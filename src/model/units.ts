import { collection, getDocs, where, query, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export interface Unit {
  name: string;
  description: string;
  id: string;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
  userID: string;
}

const userID = 'my-id'

const UNIT_COLLECTION = "units"

const unitColletion = collection(db, UNIT_COLLECTION);

export const getUnits = (name: string = '') => {
  const q = query(unitColletion, where("userID", "==", userID), where("name", ">=", name), where('name', '<=', name + '\uf8ff'));
  return getDocs(q);
}

export const createUnit = (unitInfo: Partial<Unit>) => {

  const id = uuidv4();

  const newUnit = doc(db, UNIT_COLLECTION, id);

  return setDoc(newUnit, {
    id,
    userID,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...unitInfo
  });
}
