import { DocumentData, collection, getDocs, where, query, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export interface Supplier extends DocumentData {
    supplierID?: string;
    userID: string;
    providersIDs?: Array<string>;
    name: string;
    description: string;
    productIDs?: Array<string>;
    createdAt?: string;
    updatedAt?: string;
    status: string;
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
