import { DocumentData, collection, getDocs, where, query, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { Supplier } from "./suppliers";
import { ProductCategory } from "./productCategories";
import { triGram } from "../lib/search";

export interface SellingOption extends DocumentData {
  unit: ProductUnit;
  conversionRate: number;
  inventory: number;
  unitCost: number;
  prices: Array<Price>;
}

export interface Price {
  profit: number;
  value: number;
  title: string;
}
//temporary, probably will be separated entity -> should extends Partial Unit
export interface ProductUnit extends DocumentData {
  name: string;
  id: string;
}

export interface ProductSupplier extends Partial<Supplier> {
  supplierID: string;
  name: string;
  description: string;
  status: string;
}

export interface Product extends DocumentData {
  id: string;
  userID: string;
  title: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  status: string;
  sellingOptions: Array<SellingOption>;
  weight: number;
  inventory: number;
  minInventory?: number;
  buyUnit: ProductUnit;
  sailsmanComission?: number;
  suppliers: Array<ProductSupplier>;
  cost: number;
  productCategory: Partial<ProductCategory>;
}


const userID = "my-id";
const PRODUCTS_COLLECTION = "products"

const productColletion = collection(db, PRODUCTS_COLLECTION)

export const getProducts = (title: string = '', category?: ProductCategory) => {
  const constrains = []

  if (category && category.id) {
    constrains.push(where("productCategory.id", "==", category.id))
  }
  const q = query(productColletion, where("userID", "==", userID), ...constrains, where("title", ">=", title), where('title', '<=', title + '\uf8ff'));
  return getDocs(q);
}

export const createProduct = (productInfo: Partial<Product>) => {

  const productID = uuidv4();

  const newProduct = doc(db, PRODUCTS_COLLECTION, productID);

  return setDoc(newProduct, {
    id: productID,
    userID,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...productInfo
  });
}
