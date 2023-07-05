import {  collection, getDocs, where, query, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { ProductCategory } from "./products";

export interface Address {
    region: string;
    country: string;
    street: string;
    city: string;
    postalCode: string;
}


export interface Supplier  {
    supplierID?: string;
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

const SUPPLIERS_COLLECTION = "suppliers"

const supplierColletion = collection(db, SUPPLIERS_COLLECTION)

export const getSuppliers = (name: string = '') => {
    const q = query(supplierColletion, where("name", ">=", name), where('name', '<=', name+ '\uf8ff'));

    return getDocs(q);
}

export const createSupplier = (supplierInfo: Supplier) => {

    const supplierID = uuidv4();

    const newSupplier = doc(db, SUPPLIERS_COLLECTION, supplierID);

    return setDoc(newSupplier,  {supplierID, ...supplierInfo});
}
