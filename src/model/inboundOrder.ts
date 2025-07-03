import { uuidv4 } from "@firebase/util";
import { db } from "firebase";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, QueryConstraint, writeBatch, startAfter, where, increment } from "firebase/firestore";
import { Variant } from "./products";
import { getDocumentCount } from "../lib/count";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { add, divide, multiply } from "lib/math";

export interface InboundOrderSupplier {
  id: string;
  name: string;
}

export interface InboundOrderItem {
  productID: string;
  productBaseUnitInventory: number;
  variant: Variant;
  title: string;
  balance: number;
  quantity: number;
  unitCost: number;
  itemTotalCost: number;
}

export function calcInboundOrderItemTotalCost(item: Pick<InboundOrderItem, "unitCost" | "quantity">): number {
  return multiply(item.unitCost, item.quantity)
}

export type InboundOrderStatus = "request" | "complete"

export interface InboundOrderPayment {
  method: {
    label: string;
    id: string;
  };
  amount: number;
  dueDate?: number;
}

export interface InboundOrder {
  id: string;
  publicId: string;
  userID: string;
  supplier: InboundOrderSupplier;
  createdAt: number;
  updatedAt?: number;
  deleted: {
    date: number;
    isDeleted: boolean;
  };
  payments: Array<InboundOrderPayment>;
  orderDate: number;
  dueDate: number;
  status: InboundOrderStatus;
  items: Array<InboundOrderItem>;
  totalCost: number;
}

export function calcInboundOrderTotalCost(order: InboundOrder) {
  return order.items.reduce((acc, i) => add(acc, i.itemTotalCost), 0)
}

export function calcInboundOrderTotalPaid(order: InboundOrder) {
  return order.payments.reduce((acc, p) => add(acc, p.amount), 0)
}

interface InboundOrderSearchParams {
  userID: string;
  supplierID?: string;
  dateRange?: {
    startDate?: number;
    endDate?: number;
  }
  status: InboundOrderStatus;
  cursor?: InboundOrder;
  pageSize: number;
}

const INBOUND_ORDER_COLLECTION = COLLECTION_NAMES.INBOUND_ORDERS
const inboundOrderCollection = collection(db, INBOUND_ORDER_COLLECTION)

export const getInboundOrders = (searchParams: InboundOrderSearchParams) => {
  const userID = searchParams.userID;
  const constrains: QueryConstraint[] = [where("userID", "==", userID)]

  if (searchParams.supplierID) {
    constrains.push(where("supplier.id", "==", searchParams.supplierID))
  }

  if (searchParams.status) {
    constrains.push(where("status", "==", searchParams.status))
  } else {
    constrains.push(where("status", "==", "complete"))
  }

  constrains.push(orderBy("createdAt"))

  if (searchParams.cursor) {
    constrains.push(startAfter(searchParams.cursor.createdAt))
  }

  if (searchParams.dateRange) {
    if (searchParams.dateRange.startDate) {
      constrains.push(where("createdAt", ">=", searchParams.dateRange.startDate))
    }
    if (searchParams.dateRange.endDate) {
      constrains.push(where("createdAt", "<=", searchParams.dateRange.endDate))
    }
  }

  constrains.push(where("deleted.isDeleted", "==", false))

  constrains.push(limit(searchParams.pageSize))

  const q = query(inboundOrderCollection, ...constrains);
  return Promise.all([getDocs(q), getDocumentCount(inboundOrderCollection, constrains.slice(0, -1), searchParams.pageSize)]).then(([docs, count]) => {
    return {
      inboundOrders: docs.docs.map(d => convertInboundOrderUnitsDisplay(d.data()) as InboundOrder),
      count,
    }
  })
}

export const getInboundOrder = (inboundOrderID: string) => {
  return getDoc(doc(db, INBOUND_ORDER_COLLECTION, inboundOrderID)).then(r => convertInboundOrderUnitsDisplay(r.data()) as InboundOrder);
}

export const createInboundOrder = async (inboundOrderInfo: Partial<InboundOrder>) => {
  const inboundOrderID = uuidv4();
  const publicId = await generatePublicId(INBOUND_ORDER_COLLECTION);
  const newInboundOrder = doc(db, INBOUND_ORDER_COLLECTION, inboundOrderID);
  
  const batch = writeBatch(db);

  // Create the inbound order document
  batch.set(newInboundOrder, {
    id: inboundOrderID,
    publicId,
    createdAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
    ...convertInboundOrderUnitsStore(inboundOrderInfo),
  });
  
  const itemsByProduct = inboundOrderInfo.items.reduce((acc, item) => {
    acc[item.productID] = [...(acc[item.productID] ?? []), item]
    return acc
  }, {} as Record<string, InboundOrderItem[]>)

  // Update product inventory for each item (inbound orders increase inventory)
  for (const productItems of Object.values(itemsByProduct)) {
    const productID = productItems[0].productID;
    const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);

    const balanceInBaseUnit = productItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)

    batch.update(productRef, { inventory: increment(balanceInBaseUnit) });
  }

  await batch.commit();
  return { id: inboundOrderID, publicId };
}

export const deleteInboundOrder = async (inboundOrderID: string) => {
  const inboundOrderDoc = doc(db, INBOUND_ORDER_COLLECTION, inboundOrderID);
  const inboundOrder = await getDoc(inboundOrderDoc);
  const inboundOrderData = inboundOrder.data() as InboundOrder;
  const batch = writeBatch(db);
  
  // Mark the inbound order as deleted
  batch.update(inboundOrderDoc, {
    deleted: {
      isDeleted: true,
      date: Date.now(),
    }
  });

  const itemsByProduct = inboundOrderData.items.reduce((acc, item) => {
    acc[item.productID] = [...(acc[item.productID] ?? []), item]
    return acc
  }, {} as Record<string, InboundOrderItem[]>)

  // Reduce inventory for each item (reverse the inbound order)
  for (const productItems of Object.values(itemsByProduct)) {
    const productID = productItems[0].productID;
    const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);
    const balanceInBaseUnit = productItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)
    batch.update(productRef, { inventory: increment(-balanceInBaseUnit) });
  }

  return batch.commit();
}

export const updateInboundOrder = async (inboundOrderID: string, currentInboundOrder: Partial<InboundOrder>) => {
  const inboundOrderDoc = doc(db, INBOUND_ORDER_COLLECTION, inboundOrderID);
  const inboundOrder = await getDoc(inboundOrderDoc);
  const prevInboundOrder = inboundOrder.data() as InboundOrder;
  const batch = writeBatch(db);

  const prevInboundOrderItemsByProduct = prevInboundOrder.items.reduce((acc, item) => {
    acc[item.productID] = [...(acc[item.productID] ?? []), item]
    return acc
  }, {} as Record<string, InboundOrderItem[]>)

  const currentInboundOrderItemsByProduct = currentInboundOrder.items.reduce((acc, item) => {
    acc[item.productID] = [...(acc[item.productID] ?? []), item]
    return acc
  }, {} as Record<string, InboundOrderItem[]>)

  batch.update(inboundOrderDoc, {
    ...convertInboundOrderUnitsStore(currentInboundOrder),
    updatedAt: Date.now(),
  })

  if(currentInboundOrder.status === "complete" && prevInboundOrder.status === "complete") {
    // Restore inventory for all products from previous inbound order
    for (const productID of Object.keys(prevInboundOrderItemsByProduct)) {
      const prevProductItems = prevInboundOrderItemsByProduct[productID]
      const balanceInBaseUnit = prevProductItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)
      const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);
      batch.update(productRef, { inventory: increment(-balanceInBaseUnit) });
    }

    // Increase inventory for all products from current inbound order
    for (const productID of Object.keys(currentInboundOrderItemsByProduct)) {
      const currentProductItems = currentInboundOrderItemsByProduct[productID]
      const balanceInBaseUnit = currentProductItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)
      const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);
      batch.update(productRef, { inventory: increment(balanceInBaseUnit) });
    }
  }

  if(currentInboundOrder.status === "complete" && prevInboundOrder.status === "request") {
    for (const productID of Object.keys(currentInboundOrderItemsByProduct)) {
      const currentProductItems = currentInboundOrderItemsByProduct[productID]
      const balanceInBaseUnit = currentProductItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)
      const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);
      batch.update(productRef, { inventory: increment(balanceInBaseUnit) });
    }
  }

  if(currentInboundOrder.status === "request" && prevInboundOrder.status === "complete") {
    for (const productID of Object.keys(prevInboundOrderItemsByProduct)) {
      const prevProductItems = prevInboundOrderItemsByProduct[productID]
      const balanceInBaseUnit = prevProductItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0)
      const productRef = doc(db, COLLECTION_NAMES.PRODUCTS, productID);
      batch.update(productRef, { inventory: increment(-balanceInBaseUnit) });
    }
  }

  return batch.commit();
}

const convertInboundOrderUnitsStore = (inboundOrderInfo: Partial<InboundOrder>) => {
  return {
    ...inboundOrderInfo,
    totalCost: multiply(inboundOrderInfo.totalCost ?? 0, 100),
    payments: inboundOrderInfo.payments?.map(p => ({
      ...p,
      amount: multiply(p.amount ?? 0, 100),
    })),
    items: inboundOrderInfo.items?.map(i => ({
      ...i,
      itemTotalCost: multiply(i.itemTotalCost ?? 0, 100),
      unitCost: multiply(i.unitCost ?? 0, 100),
      variant: {
        ...i.variant,
        prices: i.variant.prices.map(p => ({
          ...p,
          value: multiply(p.value ?? 0, 100),
          profit: multiply(p.profit ?? 0, 100),
        })),
        unitCost: multiply(i.variant.unitCost ?? 0, 100), 
        totalCost: multiply(i.variant.totalCost ?? 0, 100),
      },
    })),
  }
}

const convertInboundOrderUnitsDisplay = (inboundOrderInfo: Partial<InboundOrder>) => {
  return {
    ...inboundOrderInfo,
    totalCost: divide(inboundOrderInfo.totalCost ?? 0, 100),
    payments: inboundOrderInfo.payments?.map(p => ({
      ...p,
      amount: divide(p.amount ?? 0, 100),
    })),
    items: inboundOrderInfo.items?.map(i => ({
      ...i,
      itemTotalCost: divide(i.itemTotalCost ?? 0, 100),
      unitCost: divide(i.unitCost ?? 0, 100),
      variant: {
        ...i.variant,
        prices: i.variant.prices.map(p => ({
          ...p,
          value: divide(p.value ?? 0, 100),
          profit: divide(p.profit ?? 0, 100),
        })),
        unitCost: divide(i.variant.unitCost ?? 0, 100),
        totalCost: divide(i.variant.totalCost ?? 0, 100),
      },
    })),
  }
} 