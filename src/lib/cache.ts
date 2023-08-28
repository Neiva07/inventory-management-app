import { User } from "model/auth"
import { Supplier } from "model/suppliers"

type EntityType = User | Supplier

export function storeInCache(type: "user", data: User): void;


export function storeInCache(key: string, data: EntityType) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function getFromCache(type: "user"): User;

export function getFromCache(key: string): EntityType {
  switch (key) {
    case "user":
      return JSON.parse(localStorage.getItem(key)) as User;
    default:
      throw new Error("invalid key type")
  }
}

export function removeFromCache(type: "user"): void;

export function removeFromCache(key: string) {
  localStorage.removeItem(key);
}

