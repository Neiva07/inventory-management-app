import { collection, getDocs, where, query, setDoc, doc, updateDoc, QueryConstraint, getCountFromServer, limit, startAfter, orderBy, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { ProductCategory } from "./productCategories";

export interface Address {
  region: string;
  country: string;
  street: string;
  city: string;
  postalCode: string;
}

export interface Supplier {
  id: string;
  userID: string;
  tradeName: string;
  legalName: string;
  entityID: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: {
    date: Date;
    isDeleted: boolean;
  }
  status: string;
  address?: Address;
  daysToPay: number;
  companyPhone: string;
  contactPhone: string;
  productCategories: Array<Partial<ProductCategory>>;
  contactName: string;

}

interface SuppliersSearchParams {
  tradeName?: string;
  status?: string;
  cursor?: Supplier;
  pageSize: number;
  productCategory?: ProductCategory;
}

const userID = 'my-id'
const SUPPLIERS_COLLECTION = "suppliers"

const supplierColletion = collection(db, SUPPLIERS_COLLECTION)

export const getSuppliers = (searchParams: SuppliersSearchParams) => {
  const constrains: QueryConstraint[] = [where("userID", "==", userID)]


  const category = searchParams.productCategory;
  const title = searchParams?.tradeName || ''


  if (category && category.id) {
    constrains.push(where("productCategories", "array-contains", { id: category.id, name: category.name }))
  }

  if (searchParams.status && searchParams.status !== "") {
    constrains.push(where("status", "==", searchParams.status))
  }


  constrains.push(orderBy("tradeName"))

  if (searchParams.cursor) {
    constrains.push(startAfter(searchParams.cursor.tradeName))
  }

  constrains.push(where("tradeName", ">=", title), where('tradeName', '<=', title + '\uf8ff'), where("deleted.isDeleted", "==", false))

  const countQuery = query(supplierColletion, ...constrains)

  constrains.push(limit(searchParams.pageSize))

  const q = query(supplierColletion, ...constrains);
  return Promise.all([getDocs(q), getCountFromServer(countQuery)])
}

export const createSupplier = (supplierInfo: Supplier) => {

  const supplierID = uuidv4();

  const newSupplier = doc(db, SUPPLIERS_COLLECTION, supplierID);

  return setDoc(newSupplier, {
    id: supplierID,
    createdAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    userID,
    ...supplierInfo
  });
}

export const getSupplier = (supplierID: string) => {
  return getDoc(doc(db, SUPPLIERS_COLLECTION, supplierID));
}

export const deleteSupplier = async (supplierID: string) => {
  const supplierDoc = doc(db, SUPPLIERS_COLLECTION, supplierID)

  return updateDoc(supplierDoc, {
    deleted: {
      isDeleted: true,
      date: Date.now(),
    }
  })
}

export const deactiveSupplier = async (supplierID: string) => {

  const supplierDoc = doc(db, SUPPLIERS_COLLECTION, supplierID)

  return updateDoc(supplierDoc, {
    updatedAt: Date.now(),
    status: "inactive",
  })
}

export const updateSupplier = (supplierID: string, supplierInfo: Partial<Supplier>) => {
  const supplierDoc = doc(db, SUPPLIERS_COLLECTION, supplierID);

  return updateDoc(supplierDoc, {
    updatedAt: Date.now(),
    ...supplierInfo,
  })
}
