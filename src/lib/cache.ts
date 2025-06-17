import { User } from "model/auth"
import { Session } from "model/session";
import { Supplier } from "model/suppliers"
import { enableNetwork } from "firebase/firestore";
import { db } from "../firebase";

type EntityType = User | Supplier | Session

export function storeInCache(type: "user", data: User): void;

export function storeInCache(type: "session", data: Session): void


export function storeInCache(key: string, data: EntityType) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function getFromCache(type: "user"): User;

export function getFromCache(type: "session"): Session;


export function getFromCache(key: string): EntityType {
  switch (key) {
    case "user":
      return JSON.parse(localStorage.getItem(key)) as User;
    case "session":
      return JSON.parse(localStorage.getItem(key)) as Session;
    default:
      throw new Error("invalid key type")
  }
}

export function removeFromCache(type: "user"): void;
export function removeFromCache(type: "session"): void;

export function removeFromCache(key: string) {
  localStorage.removeItem(key);
}

/**
 * Check if Firestore is online
 */
export const isFirestoreOnline = async (): Promise<boolean> => {
  try {
    // Try to enable network - if it fails, we're offline
    await enableNetwork(db);
    return true;
  } catch {
    return false;
  }
};

