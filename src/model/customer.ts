import { collection, getDocs, where, query, setDoc, doc, updateDoc, QueryConstraint, getCountFromServer, limit, startAfter, orderBy, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { Address } from "./suppliers";
import { getDocumentCount } from "../lib/count";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";

export interface Customer {
  id: string;
  publicId: string;
  userID: string;
  name: string;
  cpf?: string;
  rg?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: {
    date: Date;
    isDeleted: boolean;
  }
  status: string;
  address?: Address;
  companyPhone?: string;
  contactPhone?: string;
  contactName?: string;
  // sailsman: Sailsman
}

interface CustomerSearchParams {
  userID: string;
  name?: string;
  status?: string;
  cursor?: Customer;
  pageSize: number;
}

const CUSTOMER_COLLECTION = COLLECTION_NAMES.CUSTOMERS

const customerCollection = collection(db, CUSTOMER_COLLECTION)

export const getCustomers = (searchParams: CustomerSearchParams) => {
  const constrains: QueryConstraint[] = [where("userID", "==", searchParams.userID)]

  const title = searchParams?.name || ''

  if (searchParams.status && searchParams.status !== "") {
    constrains.push(where("status", "==", searchParams.status))
  }

  constrains.push(orderBy("name"))

  if (searchParams.cursor) {
    constrains.push(startAfter(searchParams.cursor.name))
  }

  constrains.push(where("name", ">=", title), where('name', '<=', title + '\uf8ff'), where("deleted.isDeleted", "==", false))

  constrains.push(limit(searchParams.pageSize))

  const q = query(customerCollection, ...constrains);
  return Promise.all([
    getDocs(q), 
    getDocumentCount(customerCollection, constrains.slice(0, -1), searchParams.pageSize)
  ]);
}

export const createCustomer = async (customerInfo: Customer) => {
  const customerID = uuidv4();
  const publicId = await generatePublicId(CUSTOMER_COLLECTION);

  const customerDoc = doc(db, CUSTOMER_COLLECTION, customerID);

  const customerData = {
    ...customerInfo,
    id: customerID,
    publicId,
    createdAt: new Date(Date.now()),
    deleted: {
      isDeleted: false,
    },
  };

  return setDoc(customerDoc, customerData).then(() => customerData as Customer);
}

export const getCustomer = (customerID: string) => {
  return getDoc(doc(db, CUSTOMER_COLLECTION, customerID));
}

export const deleteCustomer = async (customerID: string) => {
  const customerDoc = doc(db, CUSTOMER_COLLECTION, customerID)

  return updateDoc(customerDoc, {
    deleted: {
      isDeleted: true,
      date: Date.now(),
    }
  })
}

export const deactiveCustomer = async (customerID: string) => {

  const customerDoc = doc(db, CUSTOMER_COLLECTION, customerID)

  return updateDoc(customerDoc, {
    updatedAt: Date.now(),
    status: "inactive",
  })
}
export const activeCustomer = async (customerID: string) => {

  const customerDoc = doc(db, CUSTOMER_COLLECTION, customerID)

  return updateDoc(customerDoc, {
    updatedAt: Date.now(),
    status: "active",
  })
}


export const updateCustomer = (customerID: string, customerInfo: Partial<Customer>) => {
  const customerDoc = doc(db, CUSTOMER_COLLECTION, customerID);

  return updateDoc(customerDoc, {
    updatedAt: Date.now(),
    ...customerInfo,
  })
}
