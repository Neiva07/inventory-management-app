import { collection, getDocs, where, query, setDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export interface Unit {
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


const UNIT_COLLECTION = "units"

const unitColletion = collection(db, UNIT_COLLECTION);

export const getUnits = (userID: string, name = '') => {
  const q = query(
    unitColletion, 
    where("userID", "==", userID), 
    where("name", ">=", name), 
    where('name', '<=', name + '\uf8ff'),
    where("deleted.isDeleted", "==", false)
  );
  return getDocs(q);
}

export const createUnit = (unitInfo: Partial<Unit>) => {
  const id = uuidv4();
  const newUnit = doc(db, UNIT_COLLECTION, id);

  return setDoc(newUnit, {
    id,
    createdAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    ...unitInfo
  });
}

export const updateUnit = (id: string, unitInfo: Partial<Unit>) => {
  const unitRef = doc(db, UNIT_COLLECTION, id);
  
  return updateDoc(unitRef, {
    ...unitInfo,
    updatedAt: Date.now()
  });
}

export const deleteUnit = async (id: string) => {
  const unitRef = doc(db, UNIT_COLLECTION, id);
  
  return updateDoc(unitRef, {
    deleted: {
      isDeleted: true,
      date: Date.now(),
    }
  });
}
