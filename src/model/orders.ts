import { uuidv4 } from "@firebase/util";
import { db } from "firebase";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, QueryConstraint, writeBatch, startAfter, where, increment } from "firebase/firestore";
import { Variant } from "./products";
import { getDocumentCount } from "../lib/count";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { add, divide, multiply, subtract } from "lib/math";

export interface OrderCustomer {
  id: string;
  name: string;
}

export interface Item {
  productID: string;
  productBaseUnitInventory: number;
  variant: Variant;
  title: string;
  balance: number;
  quantity: number;
  cost: number;
  unitPrice: number;
  itemTotalCost: number;
  descount: number;
  commissionRate: number;
}

export function calcItemTotalCost(item: Partial<Item>) {
  return divide(multiply(item.unitPrice, item.quantity,subtract(100, item.descount)), 100) 
}

export type OrderStatus = "request" | "complete"

export interface Order {
  id: string;
  publicId: string;
  userID: string;
  customer: OrderCustomer;
  createdAt: number;
  updatedAt?: number;
  deleted: {
    date: number;
    isDeleted: boolean;
  };
  paymentMethod: {
    label: string;
    id: string;
  }; // change for db table later
  orderDate: number;
  dueDate: number;
  totalComission: number;
  status: OrderStatus;
  items: Array<Item>;
  totalCost: number;
  // sailsman: Employee;
}

export function calcOrderTotalCost(order: Order) {
  return order.items.reduce((acc, i) => add(acc, i.itemTotalCost), 0)
}

interface OrderSearchParams {
  userID: string;
  customerID?: string;
  dateRange?: {
    startDate?: number;
    endDate?: number;
  }
  status: OrderStatus;
  cursor?: Order;
  pageSize: number;
}

const ORDER_COLLECTION = COLLECTION_NAMES.ORDERS
const orderCollection = collection(db, ORDER_COLLECTION)


export const getOrders = (searchParams: OrderSearchParams) => {
  const userID = searchParams.userID;
  const constrains: QueryConstraint[] = [where("userID", "==", userID)]
  const countConstraints: QueryConstraint[] = [where("userID", "==", userID)]

  if (searchParams.customerID) {
    constrains.push(where("customer.id", "==", searchParams.customerID))
    countConstraints.push(where("customer.id", "==", searchParams.customerID))
  }

  if (searchParams.status) {
    constrains.push(where("status", "==", searchParams.status))
    countConstraints.push(where("status", "==", searchParams.status))
  } else {
    constrains.push(where("status", "==", "complete"))
    countConstraints.push(where("status", "==", "complete"))
  }

  constrains.push(orderBy("createdAt"))

  if (searchParams.cursor) {
    constrains.push(startAfter(searchParams.cursor.createdAt))
  }

  if (searchParams.dateRange) {
    if (searchParams.dateRange.startDate) {
      constrains.push(where("createdAt", ">=", searchParams.dateRange.startDate))
      countConstraints.push(where("createdAt", ">=", searchParams.dateRange.startDate))
    }
    if (searchParams.dateRange.endDate) {
      constrains.push(where("createdAt", "<=", searchParams.dateRange.endDate))
      countConstraints.push(where("createdAt", "<=", searchParams.dateRange.endDate))
    }
  }

  constrains.push(where("deleted.isDeleted", "==", false))
  countConstraints.push(where("deleted.isDeleted", "==", false))

  constrains.push(limit(searchParams.pageSize))

  const q = query(orderCollection, ...constrains);
  return Promise.all([getDocs(q), getDocumentCount(orderCollection, countConstraints, searchParams.pageSize)]).then(([docs, count]) => {
    return {
      orders: docs.docs.map(d => convertOrderUnitsDisplay(d.data()) as Order),
      count,
    }
  })
}

export const getOrder = (orderID: string) => {
  return getDoc(doc(db, ORDER_COLLECTION, orderID)).then(r => convertOrderUnitsDisplay(r.data()) as Order);
}

export const createOrder = async (orderInfo: Partial<Order>) => {
  const orderID = uuidv4();
  const publicId = await generatePublicId(ORDER_COLLECTION);
  const newOrder = doc(db, ORDER_COLLECTION, orderID);
  
  const batch = writeBatch(db);

  // Create the order document
  batch.set(newOrder, {
    id: orderID,
    publicId,
    createdAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    ...convertOrderUnitsStore(orderInfo),
  });
  const itemsByProduct = orderInfo.items.reduce((acc, item) => {
    acc[item.productID] = [...(acc[item.productID] ?? []), item]
    return acc
  }, {} as Record<string, Item[]>)

  // Update product inventory for each item
  for (const productItems of Object.values(itemsByProduct)) {
    const productID = productItems[0].productID;
    const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);

    const balanceInBaseUnit = productItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)

    batch.update(productRef, { inventory: increment(-balanceInBaseUnit) });
  }

  return batch.commit();
}

export const deleteOrder = async (orderID: string) => {
  const orderDoc = doc(db, ORDER_COLLECTION, orderID);
  const order = await getDoc(orderDoc);
  const orderData = order.data() as Order;
  const batch = writeBatch(db);
  
  // Mark the order as deleted
  batch.update(orderDoc, {
    deleted: {
      isDeleted: true,
      date: Date.now(),
    }
  });

  const itemsByProduct = orderData.items.reduce((acc, item) => {
    acc[item.productID] = [...(acc[item.productID] ?? []), item]
    return acc
  }, {} as Record<string, Item[]>)

  for (const productItems of Object.values(itemsByProduct)) {
    const productID = productItems[0].productID;
    const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);
    const balanceInBaseUnit = productItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)
    batch.update(productRef, { inventory: increment(balanceInBaseUnit) });
  }

  return batch.commit();
}


export const updateOrder = async (orderID: string, currentOrder: Partial<Order>) => {
  const orderDoc = doc(db, ORDER_COLLECTION, orderID);
  const order = await getDoc(orderDoc);
  const prevOrder = order.data() as Order;
  const batch = writeBatch(db);

  const prevOrderItemsByProduct = prevOrder.items.reduce((acc, item) => {
    acc[item.productID] = [...(acc[item.productID] ?? []), item]
    return acc
  }, {} as Record<string, Item[]>)

  const currentOrderItemsByProduct = currentOrder.items.reduce((acc, item) => {
    acc[item.productID] = [...(acc[item.productID] ?? []), item]
    return acc
  }, {} as Record<string, Item[]>)

  batch.update(orderDoc, {
    ...convertOrderUnitsStore(currentOrder),
    updatedAt: Date.now(),
  })

  if(currentOrder.status === "complete" && prevOrder.status === "complete") {

  // Restore inventory for all products from previous order
  for (const productID of Object.keys(prevOrderItemsByProduct)) {
    const prevProductItems = prevOrderItemsByProduct[productID]
    const balanceInBaseUnit = prevProductItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)
    const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);
    batch.update(productRef, { inventory: increment(balanceInBaseUnit) });
  }

  // Reduce inventory for all products from current order
  for (const productID of Object.keys(currentOrderItemsByProduct)) {
    const currentProductItems = currentOrderItemsByProduct[productID]
    const balanceInBaseUnit = currentProductItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)
    const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);
    batch.update(productRef, { inventory: increment(-balanceInBaseUnit) });
  }
}

if(currentOrder.status === "complete" && prevOrder.status === "request") {
  for (const productID of Object.keys(currentOrderItemsByProduct)) {
    const currentProductItems = currentOrderItemsByProduct[productID]
    const balanceInBaseUnit = currentProductItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)
    const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);
    batch.update(productRef, { inventory: increment(-balanceInBaseUnit) });
  }
}

if(currentOrder.status === "request" && prevOrder.status === "complete") {
  for (const productID of Object.keys(prevOrderItemsByProduct)) {
    const prevProductItems = prevOrderItemsByProduct[productID]
    const balanceInBaseUnit = prevProductItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)
    const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);
    batch.update(productRef, { inventory: increment(balanceInBaseUnit) });
  }
}

  return batch.commit();
}

const convertOrderUnitsStore = (orderInfo: Partial<Order>) => {
  return {
    ...orderInfo,
    totalCost: multiply(orderInfo.totalCost ?? 0, 100),
    totalComission: multiply(orderInfo.totalComission ?? 0, 100),
    items: orderInfo.items.map(i => ({
      ...i,
      cost: multiply(i.cost ?? 0, 100),
      itemTotalCost: multiply(i.itemTotalCost ?? 0, 100),
      unitPrice: multiply(i.unitPrice ?? 0, 100),
      commissionRate: multiply(i.commissionRate ?? 0, 100),
      descount: multiply(i.descount ?? 0, 100),
      variant: {
        ...i.variant,
        prices: i.variant.prices.map(p => ({
          ...p,
          value: multiply(p.value ?? 0, 100),
          profit: multiply(p.profit ?? 0, 100),
        })),
        unitCost: multiply(i.variant.unitCost ?? 0, 100),
      },
    })),
  }
}

const convertOrderUnitsDisplay = (orderInfo: Partial<Order>) => {
  return {
    ...orderInfo,
    totalCost: divide(orderInfo.totalCost ?? 0, 100),
    totalComission: divide(orderInfo.totalComission ?? 0, 100),
    items: orderInfo.items.map(i => ({
      ...i,
      cost: divide(i.cost ?? 0, 100),
      itemTotalCost: divide(i.itemTotalCost ?? 0, 100),
      unitPrice: divide(i.unitPrice ?? 0, 100),
      commissionRate: divide(i.commissionRate ?? 0, 100),
      descount: divide(i.descount ?? 0, 100),
      variant: {
        ...i.variant,
        prices: i.variant.prices.map(p => ({
          ...p,
          value: divide(p.value ?? 0, 100),
          profit: divide(p.profit ?? 0, 100),
        })),
        unitCost: divide(i.variant.unitCost ?? 0, 100),
      },
    })),
  }
}
