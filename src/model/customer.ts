import { collection, getDocs, where, query, setDoc, doc, updateDoc, QueryConstraint, getCountFromServer, limit, startAfter, orderBy, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { Address } from "./suppliers";

export interface Customer {
  id: string;
  userID: string;
  name: string;
  cpf: string;
  rg: string;
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: {
    date: Date;
    isDeleted: boolean;
  }
  status: string;
  address?: Address;
  phone: string;
  // sailsman: Sailsman
}

interface CustomerSearchParams {
  name?: string;
  status?: string;
  cursor?: Customer;
  pageSize: number;
}

const userID = 'my-id'
const CUSTOMER_COLLECTION = "customers"

const customerCollection = collection(db, CUSTOMER_COLLECTION)

export const getCustomers = (searchParams: CustomerSearchParams) => {
  const constrains: QueryConstraint[] = [where("userID", "==", userID)]

  const title = searchParams?.name || ''

  if (searchParams.status && searchParams.status !== "") {
    constrains.push(where("status", "==", searchParams.status))
  }

  constrains.push(orderBy("name"))

  if (searchParams.cursor) {
    constrains.push(startAfter(searchParams.cursor.name))
  }

  constrains.push(where("name", ">=", title), where('name', '<=', title + '\uf8ff'), where("deleted.isDeleted", "==", false))

  const countQuery = query(customerCollection, ...constrains)

  constrains.push(limit(searchParams.pageSize))

  const q = query(customerCollection, ...constrains);
  return Promise.all([getDocs(q), getCountFromServer(countQuery)])
}

export const createCustomer = (customerInfo: Customer) => {

  const customerID = uuidv4();

  const customerDoc = doc(db, CUSTOMER_COLLECTION, customerID);

  return setDoc(customerDoc, {
    ...customerInfo,
    id: customerID,
    createdAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    userID,
  });
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
