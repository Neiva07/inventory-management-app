import { uuidv4 } from "@firebase/util";
import { db } from "firebase";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, QueryConstraint, writeBatch, startAfter, where, updateDoc } from "firebase/firestore";
import { getDocumentCount } from "../lib/count";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { multiply, divide } from "lib/math";

export type SupplierBillStatus = "active" | "paid" | "overdue" | "cancelled";

export interface SupplierBill {
  id: string;
  publicId: string;
  userID: string;
  supplier: {
    supplierID: string;
    publicID: string;
    supplierName: string;
  };
  inboundOrder: {
    id: string;
    publicId: string;
  };
  totalValue: number; // Total order value
  initialCashInstallment: number; // Amount paid upfront
  remainingValue: number; // Value to be paid in installments
  startDate: number; // When installments begin
  createdAt: number;
  updatedAt?: number;
  deleted: {
    date: number;
    isDeleted: boolean;
  };
  status: SupplierBillStatus;
}

interface SupplierBillSearchParams {
  userID: string;
  supplierID?: string;
  status?: SupplierBillStatus;
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  cursor?: SupplierBill;
  pageSize: number;
}

const SUPPLIER_BILL_COLLECTION = COLLECTION_NAMES.SUPPLIER_BILLS;
const supplierBillCollection = collection(db, SUPPLIER_BILL_COLLECTION);

export const getSupplierBills = async (searchParams: SupplierBillSearchParams) => {
  const userID = searchParams.userID;
  const constrains: QueryConstraint[] = [where("userID", "==", userID)];

  if (searchParams.supplierID) {
    constrains.push(where("supplier.supplierID", "==", searchParams.supplierID));
  }

  if (searchParams.status) {
    constrains.push(where("status", "==", searchParams.status));
  }

  constrains.push(orderBy("createdAt", "desc"));

  if (searchParams.cursor) {
    constrains.push(startAfter(searchParams.cursor.createdAt));
  }

  if (searchParams.dateRange) {
    if (searchParams.dateRange.startDate) {
      constrains.push(where("createdAt", ">=", searchParams.dateRange.startDate));
    }
    if (searchParams.dateRange.endDate) {
      constrains.push(where("createdAt", "<=", searchParams.dateRange.endDate));
    }
  }

  constrains.push(where("deleted.isDeleted", "==", false));
  constrains.push(limit(searchParams.pageSize));

  const q = query(supplierBillCollection, ...constrains);
  const [docs, count] = await Promise.all([
    getDocs(q),
    getDocumentCount(supplierBillCollection, constrains.slice(0, -1), searchParams.pageSize)
  ]);
  const supplierBills = docs.docs.map(d => convertSupplierBillUnitsDisplay(d.data()) as SupplierBill);

  return {
    supplierBills,
    count,
  };
};

export const getSupplierBill = (supplierBillID: string) => {
  return getDoc(doc(db, SUPPLIER_BILL_COLLECTION, supplierBillID)).then(r => convertSupplierBillUnitsDisplay(r.data()) as SupplierBill);
};

export const createSupplierBill = async (supplierBillInfo: Partial<SupplierBill>) => {
  const supplierBillID = uuidv4();
  const publicId = await generatePublicId(SUPPLIER_BILL_COLLECTION);
  const newSupplierBill = doc(db, SUPPLIER_BILL_COLLECTION, supplierBillID);
  
  const batch = writeBatch(db);

  // Create the supplier bill document
  const documentData = {
    id: supplierBillID,
    publicId,
    createdAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    status: "active",
    ...convertSupplierBillUnitsStore(supplierBillInfo),
  };
  
  // Remove any undefined values before setting the document
  const cleanData = Object.fromEntries(
    Object.entries(documentData).filter(([_, value]) => value !== undefined)
  );

  batch.set(newSupplierBill, cleanData);

  await batch.commit();
  return supplierBillID;
};

export const updateSupplierBill = async (supplierBillID: string, supplierBillInfo: Partial<SupplierBill>) => {
  const supplierBillDoc = doc(db, SUPPLIER_BILL_COLLECTION, supplierBillID);
  
  return updateDoc(supplierBillDoc, {
    ...convertSupplierBillUnitsStore(supplierBillInfo),
    updatedAt: Date.now(),
  });
};

export const deleteSupplierBill = async (supplierBillID: string) => {
  const supplierBillDoc = doc(db, SUPPLIER_BILL_COLLECTION, supplierBillID);
  
  return updateDoc(supplierBillDoc, {
    deleted: {
      isDeleted: true,
      date: Date.now(),
    }
  });
};

// Helper functions for unit conversion (storing in cents, displaying in currency)
const convertSupplierBillUnitsStore = (supplierBillInfo: Partial<SupplierBill>) => {
  return {
    ...supplierBillInfo,
    totalValue: multiply(supplierBillInfo.totalValue ?? 0, 100),
    initialCashInstallment: multiply(supplierBillInfo.initialCashInstallment ?? 0, 100),
    remainingValue: multiply(supplierBillInfo.remainingValue ?? 0, 100),
  };
};

const convertSupplierBillUnitsDisplay = (supplierBillInfo: Partial<SupplierBill>) => {
  return {
    ...supplierBillInfo,
    totalValue: divide(supplierBillInfo.totalValue ?? 0, 100),
    initialCashInstallment: divide(supplierBillInfo.initialCashInstallment ?? 0, 100),
    remainingValue: divide(supplierBillInfo.remainingValue ?? 0, 100),
  };
}; 