import { DocumentData, collection, getDocs, where, query, setDoc, doc, QueryConstraint, limit, startAt, orderBy, startAfter, getCountFromServer, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { ProductCategory } from "./productCategories";
import { getDocumentCount } from "../lib/count";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { divide, multiply } from "lib/math";

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
  publicId: string;
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
  userID: string;
  cursor?: Product;
  pageSize: number;
  title?: string;
  productCategory?: ProductCategory;
  status?: string;
}


const PRODUCTS_COLLECTION = COLLECTION_NAMES.PRODUCTS

const productColletion = collection(db, PRODUCTS_COLLECTION)

export const getProducts = async (searchParams: ProductSearchParams) => {
  const constrains: QueryConstraint[] = [where("userID", "==", searchParams.userID)]

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

  constrains.push(limit(searchParams.pageSize))

  const q = query(productColletion, ...constrains);
  return Promise.all([getDocs(q).then(docs => docs.docs.map(doc => convertProductUnitsDisplay(doc.data() as Product))), getDocumentCount(productColletion, constrains.slice(0, -1), searchParams.pageSize)])
}

export const getProduct = (productID: string) => {
  return getDoc(doc(db, PRODUCTS_COLLECTION, productID)).then(doc => {
    return convertProductUnitsDisplay(doc.data() as Product);
  });
}


export const createProduct = async (productInfo: Partial<Product>) => {
  const productID = uuidv4();
  const publicId = await generatePublicId(PRODUCTS_COLLECTION);

  const newProduct = doc(db, PRODUCTS_COLLECTION, productID);

  return setDoc(newProduct, {
    id: productID,
    publicId,
    createdAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    ...convertProductUnitsStore(productInfo)
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
    ...convertProductUnitsStore(productInfo),
  })
}

const convertProductUnitsStore = (productInfo: Partial<Product>): Partial<Product> => {
  return {
    ...productInfo,
    cost: multiply(productInfo.cost ?? 0, 100),
    sailsmanComission: multiply(productInfo.sailsmanComission ?? 0, 100),
    sellingOptions: productInfo.sellingOptions.map(so => ({
      ...so,
      unitCost: multiply(so.unitCost ?? 0, 100),
      prices: so.prices.map(p => ({
        ...p,
        value: multiply(p.value ?? 0, 100),
        profit: multiply(p.profit ?? 0, 100),
      })),
    })),
  }
}

const convertProductUnitsDisplay = (productInfo: Partial<Product>): Partial<Product> => {
  return {
    ...productInfo,
    cost: divide(productInfo.cost ?? 0, 100),
    sailsmanComission: divide(productInfo.sailsmanComission ?? 0, 100),
    sellingOptions: productInfo.sellingOptions.map(so => ({
      ...so,
      unitCost: divide(so.unitCost ?? 0, 100),
      prices: so.prices.map(p => ({
        ...p,
        value: divide(p.value ?? 0, 100),
        profit: divide(p.profit ?? 0, 100),
      })),
    })),
  }
}