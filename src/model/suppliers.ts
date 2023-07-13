import { collection, getDocs, where, query, setDoc, doc } from "firebase/firestore";
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
  createdAt?: string;
  updatedAt?: string;
  status: string;
  address?: Address;
  daysToPay: number;
  companyPhone: string;
  contactPhone: string;
  productCategories: Array<Partial<ProductCategory>>;
  contactName: string;

}

const userID = 'my-id'
const SUPPLIERS_COLLECTION = "suppliers"

const supplierColletion = collection(db, SUPPLIERS_COLLECTION)

export const getSuppliers = (tradeName: string = '') => {
  const q = query(supplierColletion, where("userID", "==", userID), where("tradeName", ">=", tradeName), where('tradeName', '<=', tradeName + '\uf8ff'));
  return getDocs(q);
}

export const createSupplier = (supplierInfo: Supplier) => {

  const supplierID = uuidv4();

  const newSupplier = doc(db, SUPPLIERS_COLLECTION, supplierID);

  return setDoc(newSupplier, {
    id: supplierID,
    userID,
    ...supplierInfo
  });
}
