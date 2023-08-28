import { DocumentData, collection, getDocs, where, query, setDoc, doc, QueryConstraint, limit, startAt, orderBy, startAfter, getCountFromServer, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { ProductCategory } from "./productCategories";

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

export interface ProductSupplier {
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
  deleted: {
    date: Date;
    isDeleted: boolean;
  };
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

export interface ProductSearchParams {
  cursor?: Product;
  pageSize: number;
  title?: string;
  productCategory?: ProductCategory;
  status?: string;
}


const userID = "my-id";
const PRODUCTS_COLLECTION = "products"

const productColletion = collection(db, PRODUCTS_COLLECTION)

export const getProducts = (searchParams: ProductSearchParams) => {
  const constrains: QueryConstraint[] = [where("userID", "==", userID)]


  const category = searchParams.productCategory;
  const title = searchParams?.title || ''


  if (category && category.id) {
    constrains.push(where("productCategory.id", "==", category.id))
  }

  if (searchParams.status && searchParams.status !== "") {
    constrains.push(where("status", "==", searchParams.status))
  }


  constrains.push(orderBy("title"))

  if (searchParams.cursor) {
    constrains.push(startAfter(searchParams.cursor.title))
  }

  constrains.push(where("title", ">=", title), where('title', '<=', title + '\uf8ff'), where("deleted.isDeleted", "==", false))

  const countQuery = query(productColletion, ...constrains)

  constrains.push(limit(searchParams.pageSize))

  const q = query(productColletion, ...constrains);
  return Promise.all([getDocs(q), getCountFromServer(countQuery)])
}

export const getProduct = (productID: string) => {
  return getDoc(doc(db, PRODUCTS_COLLECTION, productID));
}


export const createProduct = (productInfo: Partial<Product>) => {

  const productID = uuidv4();

  const newProduct = doc(db, PRODUCTS_COLLECTION, productID);

  return setDoc(newProduct, {
    id: productID,
    userID,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    ...productInfo
  });
}

export const deleteProduct = async (productID: string) => {
  const productDoc = doc(db, PRODUCTS_COLLECTION, productID);

  return updateDoc(productDoc, {
    deleted: {
      isDeleted: true,
      date: Date.now(),
    }
  })
}

export const deactiveProduct = async (productID: string) => {

  const productDoc = doc(db, PRODUCTS_COLLECTION, productID);

  return updateDoc(productDoc, {
    updatedAt: Date.now(),
    status: "inactive",
  })
}

export const activeProduct = async (productID: string) => {

  const productDoc = doc(db, PRODUCTS_COLLECTION, productID);

  return updateDoc(productDoc, {
    updatedAt: Date.now(),
    status: "active",
  })
}
export const updateProduct = (productID: string, productInfo: Partial<Product>) => {
  const productDoc = doc(db, PRODUCTS_COLLECTION, productID);

  return updateDoc(productDoc, {
    updatedAt: Date.now(),
    ...productInfo,
  })
}
