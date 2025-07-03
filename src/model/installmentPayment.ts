import { uuidv4 } from "@firebase/util";
import { db } from "firebase";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, QueryConstraint, writeBatch, startAfter, where, updateDoc } from "firebase/firestore";
import { getDocumentCount } from "../lib/count";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { multiply, divide } from "lib/math";

export type InstallmentPaymentStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface InstallmentPayment {
  id: string;
  publicId: string;
  userID: string;
  supplierBillID: string; // Reference to SupplierBill
  installmentNumber: number; // 1, 2, 3, etc.
  dueDate: number;
  amount: number;
  paymentMethod: {
    id: string;
    label: string;
  };
  status: InstallmentPaymentStatus;
  paidAt?: number;
  paidAmount?: number; // In case of partial payments
  createdAt: number;
  updatedAt?: number;
  deleted: {
    date: number;
    isDeleted: boolean;
  };
}

interface InstallmentPaymentSearchParams {
  userID: string;
  supplierBillID?: string;
  status?: InstallmentPaymentStatus;
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  cursor?: InstallmentPayment;
  pageSize: number;
}

const INSTALLMENT_PAYMENT_COLLECTION = COLLECTION_NAMES.INSTALLMENT_PAYMENTS;
const installmentPaymentCollection = collection(db, INSTALLMENT_PAYMENT_COLLECTION);

export const getInstallmentPayments = (searchParams: InstallmentPaymentSearchParams) => {
  const userID = searchParams.userID;
  const constrains: QueryConstraint[] = [where("userID", "==", userID)];

  if (searchParams.supplierBillID) {
    constrains.push(where("supplierBillID", "==", searchParams.supplierBillID));
  }

  if (searchParams.status) {
    constrains.push(where("status", "==", searchParams.status));
  }

  constrains.push(orderBy("dueDate", "asc"));

  if (searchParams.cursor) {
    constrains.push(startAfter(searchParams.cursor.dueDate));
  }

  if (searchParams.dateRange) {
    if (searchParams.dateRange.startDate) {
      constrains.push(where("dueDate", ">=", searchParams.dateRange.startDate));
    }
    if (searchParams.dateRange.endDate) {
      constrains.push(where("dueDate", "<=", searchParams.dateRange.endDate));
    }
  }

  constrains.push(where("deleted.isDeleted", "==", false));
  constrains.push(limit(searchParams.pageSize));

  const q = query(installmentPaymentCollection, ...constrains);
  return Promise.all([getDocs(q), getDocumentCount(installmentPaymentCollection, constrains.slice(0, -1), searchParams.pageSize)]).then(([docs, count]) => {
    return {
      installmentPayments: docs.docs.map(d => convertInstallmentPaymentUnitsDisplay(d.data()) as InstallmentPayment),
      count,
    };
  });
};

export const getInstallmentPayment = (installmentPaymentID: string) => {
  return getDoc(doc(db, INSTALLMENT_PAYMENT_COLLECTION, installmentPaymentID)).then(r => convertInstallmentPaymentUnitsDisplay(r.data()) as InstallmentPayment);
};

export const createInstallmentPayment = async (installmentPaymentInfo: Partial<InstallmentPayment>) => {
  const installmentPaymentID = uuidv4();
  const publicId = await generatePublicId(INSTALLMENT_PAYMENT_COLLECTION);
  const newInstallmentPayment = doc(db, INSTALLMENT_PAYMENT_COLLECTION, installmentPaymentID);
  
  const batch = writeBatch(db);

  // Create the installment payment document
  const documentData = {
    id: installmentPaymentID,
    publicId,
    createdAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    status: "pending",
    ...convertInstallmentPaymentUnitsStore(installmentPaymentInfo),
  };
  
  // Remove any undefined values before setting the document
  const cleanData = Object.fromEntries(
    Object.entries(documentData).filter(([_, value]) => value !== undefined)
  );

  batch.set(newInstallmentPayment, cleanData);

  return batch.commit();
};

export const createMultipleInstallmentPayments = async (installmentPayments: Partial<InstallmentPayment>[]) => {
  const batch = writeBatch(db);
  
  for (const installmentPaymentInfo of installmentPayments) {
    const installmentPaymentID = uuidv4();
    const publicId = await generatePublicId(INSTALLMENT_PAYMENT_COLLECTION);
    const newInstallmentPayment = doc(db, INSTALLMENT_PAYMENT_COLLECTION, installmentPaymentID);
    
    const documentData = {
      id: installmentPaymentID,
      publicId,
      createdAt: Date.now(),
      deleted: {
        isDeleted: false,
      },
      status: "pending",
      ...convertInstallmentPaymentUnitsStore(installmentPaymentInfo),
    };
    
    // Remove any undefined values before setting the document
    const cleanData = Object.fromEntries(
      Object.entries(documentData).filter(([_, value]) => value !== undefined)
    );
    
    batch.set(newInstallmentPayment, cleanData);
  }

  return batch.commit();
};

export const updateInstallmentPayment = async (installmentPaymentID: string, installmentPaymentInfo: Partial<InstallmentPayment>) => {
  const installmentPaymentDoc = doc(db, INSTALLMENT_PAYMENT_COLLECTION, installmentPaymentID);
  
  return updateDoc(installmentPaymentDoc, {
    ...convertInstallmentPaymentUnitsStore(installmentPaymentInfo),
    updatedAt: Date.now(),
  });
};

export const recordPayment = async (installmentPaymentID: string, paidAmount: number, paymentMethod?: { id: string; label: string }) => {
  const installmentPaymentDoc = doc(db, INSTALLMENT_PAYMENT_COLLECTION, installmentPaymentID);
  
  const updateData: Partial<InstallmentPayment> = {
    status: "paid",
    paidAt: Date.now(),
    paidAmount,
    updatedAt: Date.now(),
  };

  if (paymentMethod) {
    updateData.paymentMethod = paymentMethod;
  }

  return updateDoc(installmentPaymentDoc, convertInstallmentPaymentUnitsStore(updateData));
};

export const deleteInstallmentPayment = async (installmentPaymentID: string) => {
  const installmentPaymentDoc = doc(db, INSTALLMENT_PAYMENT_COLLECTION, installmentPaymentID);
  
  return updateDoc(installmentPaymentDoc, {
    deleted: {
      isDeleted: true,
      date: Date.now(),
    }
  });
};

// Helper functions for unit conversion (storing in cents, displaying in currency)
const convertInstallmentPaymentUnitsStore = (installmentPaymentInfo: Partial<InstallmentPayment>) => {
  const converted = {
    ...installmentPaymentInfo,
    amount: multiply(installmentPaymentInfo.amount ?? 0, 100),
  };
  
  // Only include paidAmount if it's defined and not undefined
  if (installmentPaymentInfo.paidAmount !== undefined && installmentPaymentInfo.paidAmount !== null) {
    converted.paidAmount = multiply(installmentPaymentInfo.paidAmount, 100);
  }
  
  return converted;
};

const convertInstallmentPaymentUnitsDisplay = (installmentPaymentInfo: Partial<InstallmentPayment>) => {
  return {
    ...installmentPaymentInfo,
    amount: divide(installmentPaymentInfo.amount ?? 0, 100),
    paidAmount: installmentPaymentInfo.paidAmount ? divide(installmentPaymentInfo.paidAmount, 100) : undefined,
  };
}; 