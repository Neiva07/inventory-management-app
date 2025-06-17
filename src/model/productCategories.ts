import { collection, getDocs, where, query, setDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export interface ProductCategory {
  name: string;
  description: string;
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  userID: string;
  deleted?: {
    date: Date;
    isDeleted: boolean;
  };
}


const PRODUCT_CATEGORIES_COLLECTION = "product_categories"

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

export const createProductCategories = (productCategoryInfo: Partial<ProductCategory>) => {
  const id = uuidv4();
  const newProductCategory = doc(db, PRODUCT_CATEGORIES_COLLECTION, id);

  return setDoc(newProductCategory, {
    id,
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
