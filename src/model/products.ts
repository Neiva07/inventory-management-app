import { DocumentData, collection, getDocs, where, query, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export interface Product extends DocumentData {
    productID?: string;
    userID: string;
    providersIDs?: Array<string>;
    name: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
    status: string;
}


const PRODUCTS_COLLECTION = "products"

const productColletion = collection(db, PRODUCTS_COLLECTION)

export const getProducts = (name: string = '') => {
    const q = query(productColletion, where("name", ">=", name), where('name', '<=', name+ '\uf8ff'));

    return getDocs(q);
}

export const createProduct = (productInfo: Product) => {

    const productID = uuidv4();

    const newProduct = doc(db, PRODUCTS_COLLECTION, productID);

    return setDoc(newProduct,  {productID, ...productInfo});
}
