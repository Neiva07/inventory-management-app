import { uuidv4 } from "@firebase/util";
import { db } from "firebase";
import { collection, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, QueryConstraint, setDoc, startAfter, updateDoc, where } from "firebase/firestore";
import { ProductSearchParams, ProductUnit, updateProduct } from "./products";

export interface OrderCustomer {
  id: string;
  name: string;
}

export interface Item {
  productID: string;
  title: string;
  balance: number;
  quantity: number;
  cost: number;
  unitPrice: number;
  unit: ProductUnit;
  itemTotalCost: number;
  descount: number;
  commissionRate: number;
}

export function calcItemTotalCost(item: Partial<Item>) {
  return item.unitPrice * item.quantity * Math.round((100 - item.descount)) / 100
}

export type OrderStatus = "request" | "complete"

export interface Order {
  id: string;
  userID: string;
  customer: OrderCustomer;
  createdAt: number;
  updatedAt?: number;
  deleted: {
    date: number;
    isDeleted: boolean;
  };
  paymentType: {
    name: string;
    id: string;
  }; // change for db table later
  dueDate: number;
  totalComission: number;
  status: OrderStatus;
  items: Array<Item>;
  totalCost: number;
  // sailsman: Employee;
}

export function calcOrderTotalCost(order: Order) {
  return order.items.reduce((acc, i) => acc + i.itemTotalCost, 0)
}

interface OrderSearchParams {
  userID: string;
  customerID?: string;
  customerName?: string;
  dateRange?: {
    startDate: number;
    endDate: number;
  }
  status: OrderStatus;
  cursor?: Order;
  pageSize: number;
}

const ORDER_COLLECTION = "orders"
const orderCollection = collection(db, ORDER_COLLECTION)
//
// export const getOrders = (searchParams: OrderSearchParams) => {
//   const constrains: QueryConstraint[] = [where("userID", "==", userID)]
//
//
//   const category = searchParams.productCategory;
//   const title = searchParams?.customerName || ''
//
//
//   if (category && category.id) {
//     constrains.push(where("productCategory.id", "==", category.id))
//   }
//
//   if (searchParams.status) {
//     constrains.push(where("status", "==", searchParams.status))
//   } else {
//     constrains.push(where("status", "==", "complete"))
//   }
//
//
//
//   constrains.push(orderBy("customer.name"))
//
//   if (searchParams.cursor) {
//     constrains.push(startAfter(searchParams.cursor.customer.name))
//   }
//
//   constrains.push(where("title", ">=", title), where('title', '<=', title + '\uf8ff'), where("deleted.isDeleted", "==", false))
//
//   const countQuery = query(orderCollection, ...constrains)
//
//   constrains.push(limit(searchParams.pageSize))
//
//   const q = query(orderCollection, ...constrains);
//   return Promise.all([getDocs(q), getCountFromServer(countQuery)])
// }
//
export const getOrder = (orderID: string) => {
  return getDoc(doc(db, ORDER_COLLECTION, orderID));
}


export const createOrder = (orderInfo: Partial<Order>) => {
  const orderID = uuidv4();
  const newOrder = doc(db, ORDER_COLLECTION, orderID);

  const newOrderDoc = setDoc(newOrder, {
    id: orderID,
    createdAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    ...orderInfo
  });

  orderInfo.items.map(o => {
    updateProduct(o.productID, { inventory: o.balance })
  })

  return newOrderDoc
}

export const deleteOrder = async (orderID: string) => {
  const productDoc = doc(db, ORDER_COLLECTION, orderID);

  return updateDoc(productDoc, {
    deleted: {
      isDeleted: true,
      date: Date.now(),
    }
  })
}


