import { collection, getDocs, where, query, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export interface ProductCategory {
  name: string;
  description: string;
  id: string;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
  userID: string;
}

const userID = 'my-id'

const PRODUCT_CATEGORIES_COLLECTION = "product_categories"

const productCategoryColletion = collection(db, PRODUCT_CATEGORIES_COLLECTION);

export const getProductCategories = (name: string = '') => {
  const q = query(productCategoryColletion, where("userID", "==", userID), where("name", ">=", name), where('name', '<=', name + '\uf8ff'));

  return getDocs(q);
}

export const createProductCategories = (productCategoryInfo: Partial<ProductCategory>) => {

  const id = uuidv4();

  const newProductCategory = doc(db, PRODUCT_CATEGORIES_COLLECTION, id);

  return setDoc(newProductCategory, {
    id,
    userID,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...productCategoryInfo
  });
}
