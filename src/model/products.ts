import { DocumentData, collection, getDocs, where, query, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export interface SellOption extends DocumentData {
    name: string;
    price: number;
    profit: number;
    unit: Unit;
}
//temporary, probably will be separated entity
export interface Unit extends DocumentData {
    name: string;
    id: string;
}

export interface Product extends DocumentData {
    productID?: string;
    userID: string;
    providersIDs?: Array<string>;
    title: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    status: string;
    sellPrices: Array<SellOption>;
    weight: number;
    inventory: number;
    buyUnit: Unit;
    cost: number;
    productCategory: string //entity
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

    return setDoc(newProduct,  {productID, 
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...productInfo});
}
