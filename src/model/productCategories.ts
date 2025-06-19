import { collection, getDocs, where, query, setDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";

export interface ProductCategory {
  name: string;
  description: string;
  id: string;
  publicId: string;
  createdAt?: Date;
  updatedAt?: Date;
  userID: string;
  deleted?: {
    date: Date;
    isDeleted: boolean;
  };
}


const PRODUCT_CATEGORIES_COLLECTION = COLLECTION_NAMES.PRODUCT_CATEGORIES

const productCategoryColletion = collection(db, PRODUCT_CATEGORIES_COLLECTION);

export const getProductCategories = (userID: string, name = '') => {
  const q = query(
    productCategoryColletion, 
    where("userID", "==", userID), 
    where("name", ">=", name), 
    where('name', '<=', name + '\uf8ff'),
    where("deleted.isDeleted", "==", false)
  );

  return getDocs(q);
}

export const createProductCategories = async (productCategoryInfo: Partial<ProductCategory>) => {
  const id = uuidv4();
  const publicId = await generatePublicId(PRODUCT_CATEGORIES_COLLECTION);
  const newProductCategory = doc(db, PRODUCT_CATEGORIES_COLLECTION, id);

  return setDoc(newProductCategory, {
    id,
    publicId,
    createdAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    ...productCategoryInfo
  });
}

export const updateProductCategory = (id: string, productCategoryInfo: Partial<ProductCategory>) => {
  const productCategoryRef = doc(db, PRODUCT_CATEGORIES_COLLECTION, id);
  
  return updateDoc(productCategoryRef, {
    ...productCategoryInfo,
    updatedAt: Date.now()
  });
}

export const deleteProductCategory = async (id: string) => {
  const productCategoryRef = doc(db, PRODUCT_CATEGORIES_COLLECTION, id);
  
  return updateDoc(productCategoryRef, {
    deleted: {
      isDeleted: true,
      date: Date.now(),
    }
  });
}
