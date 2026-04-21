import { and, asc, count, eq, gt, gte, inArray, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { resolveOrganizationId } from "../db/scope";
import { orderItems, orders } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { add, divide, multiply, subtract } from "lib/math";
import { adjustProductInventory, Variant } from "./products";

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
  return divide(multiply(item.unitPrice, item.quantity, subtract(100, item.descount)), 100);
}

export type OrderStatus = "request" | "complete";

export interface Order {
  id: string;
  publicId: string;
  userID: string;
  organizationId?: string;
  customer: OrderCustomer;
  createdAt: number;
  updatedAt?: number;
  paymentMethod: {
    label: string;
    id: string;
  };
  orderDate: number;
  dueDate: number;
  totalComission: number;
  status: OrderStatus;
  items: Array<Item>;
  totalCost: number;
}

export function calcOrderTotalCost(order: Order) {
  return order.items.reduce((acc, i) => add(acc, i.itemTotalCost), 0);
}

interface OrderSearchParams {
  userID: string;
  organizationId?: string;
  customerID?: string;
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  status: OrderStatus;
  cursor?: Order;
  pageSize: number;
}

const ORDER_COLLECTION = COLLECTION_NAMES.ORDERS;

const convertOrderUnitsStore = (orderInfo: Partial<Order>) => {
  return {
    ...orderInfo,
    totalCost: multiply(orderInfo.totalCost ?? 0, 100),
    totalComission: multiply(orderInfo.totalComission ?? 0, 100),
    items: (orderInfo.items ?? []).map((i) => ({
      ...i,
      cost: multiply(i.cost ?? 0, 100),
      itemTotalCost: multiply(i.itemTotalCost ?? 0, 100),
      unitPrice: multiply(i.unitPrice ?? 0, 100),
      commissionRate: multiply(i.commissionRate ?? 0, 100),
      descount: multiply(i.descount ?? 0, 100),
      variant: {
        ...i.variant,
        prices: (i.variant?.prices ?? []).map((p) => ({
          ...p,
          value: multiply(p.value ?? 0, 100),
          profit: multiply(p.profit ?? 0, 100),
        })),
        unitCost: multiply(i.variant?.unitCost ?? 0, 100),
      },
    })),
  };
};

const convertOrderUnitsDisplay = (orderInfo: Partial<Order>) => {
  return {
    ...orderInfo,
    totalCost: divide(orderInfo.totalCost ?? 0, 100),
    totalComission: divide(orderInfo.totalComission ?? 0, 100),
    items: (orderInfo.items ?? []).map((i) => ({
      ...i,
      cost: divide(i.cost ?? 0, 100),
      itemTotalCost: divide(i.itemTotalCost ?? 0, 100),
      unitPrice: divide(i.unitPrice ?? 0, 100),
      commissionRate: divide(i.commissionRate ?? 0, 100),
      descount: divide(i.descount ?? 0, 100),
      variant: {
        ...i.variant,
        prices: (i.variant?.prices ?? []).map((p) => ({
          ...p,
          value: divide(p.value ?? 0, 100),
          profit: divide(p.profit ?? 0, 100),
        })),
        unitCost: divide(i.variant?.unitCost ?? 0, 100),
      },
    })),
  };
};

const mapOrder = (row: typeof orders.$inferSelect, rowItems: typeof orderItems.$inferSelect[]): Order => {
  const order: Order = {
    id: row.id,
    publicId: row.publicId ?? "",
    userID: row.userId,
    organizationId: row.organizationId,
    customer: row.customerJson
      ? JSON.parse(row.customerJson)
      : {
          id: row.customerId ?? "",
          name: "",
        },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    paymentMethod: {
      id: row.paymentMethodId ?? "",
      label: row.paymentMethodLabel ?? "",
    },
    orderDate: row.orderDate,
    dueDate: row.dueDate ?? row.orderDate,
    totalComission: row.totalCommissionCents,
    status: row.status as OrderStatus,
    totalCost: row.totalCostCents,
    items: rowItems.map((item) => ({
      productID: item.productId,
      productBaseUnitInventory: item.productBaseUnitInventory,
      variant: item.variantJson ? JSON.parse(item.variantJson) : ({} as Variant),
      title: item.title,
      balance: item.balance,
      quantity: item.quantity,
      cost: item.costCents,
      unitPrice: item.unitPriceCents,
      itemTotalCost: item.itemTotalCostCents,
      descount: item.discountPercent,
      commissionRate: item.commissionRate,
    })),
  };

  return convertOrderUnitsDisplay(order) as Order;
};

const getOrderItemsRows = async (orderIds: string[]) => {
  if (!orderIds.length) {
    return new Map<string, typeof orderItems.$inferSelect[]>();
  }

  const db = createAppDb();
  const rows = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
  const map = new Map<string, typeof orderItems.$inferSelect[]>();
  rows.forEach((item) => {
    const values = map.get(item.orderId) ?? [];
    values.push(item);
    map.set(item.orderId, values);
  });
  return map;
};

const applyInventoryDeltaFromItems = async (items: Item[], factor: 1 | -1) => {
  const itemsByProduct = items.reduce((acc, item) => {
    acc[item.productID] = [...(acc[item.productID] ?? []), item];
    return acc;
  }, {} as Record<string, Item[]>);

  for (const productItems of Object.values(itemsByProduct)) {
    const balanceInBaseUnit = productItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0);
    await adjustProductInventory(productItems[0].productID, factor * balanceInBaseUnit);
  }
};

export const getOrders = async (searchParams: OrderSearchParams) => {
  const db = createAppDb();
  const scopeOrganizationId = resolveOrganizationId({
    userID: searchParams.userID,
    organizationId: searchParams.organizationId,
  });

  const filters = [eq(orders.organizationId, scopeOrganizationId)];

  if (searchParams.customerID) {
    filters.push(eq(orders.customerId, searchParams.customerID));
  }

  if (searchParams.status) {
    filters.push(eq(orders.status, searchParams.status));
  } else {
    filters.push(eq(orders.status, "complete"));
  }

  if (searchParams.dateRange?.startDate) {
    filters.push(gte(orders.createdAt, searchParams.dateRange.startDate));
  }

  if (searchParams.dateRange?.endDate) {
    filters.push(lte(orders.createdAt, searchParams.dateRange.endDate));
  }

  if (searchParams.cursor?.createdAt) {
    filters.push(gt(orders.createdAt, searchParams.cursor.createdAt));
  }

  const rows = await db
    .select()
    .from(orders)
    .where(and(...filters))
    .orderBy(asc(orders.createdAt))
    .limit(searchParams.pageSize);

  const countFilters = [eq(orders.organizationId, scopeOrganizationId)];
  if (searchParams.customerID) {
    countFilters.push(eq(orders.customerId, searchParams.customerID));
  }
  if (searchParams.status) {
    countFilters.push(eq(orders.status, searchParams.status));
  } else {
    countFilters.push(eq(orders.status, "complete"));
  }
  if (searchParams.dateRange?.startDate) {
    countFilters.push(gte(orders.createdAt, searchParams.dateRange.startDate));
  }
  if (searchParams.dateRange?.endDate) {
    countFilters.push(lte(orders.createdAt, searchParams.dateRange.endDate));
  }

  const [{ value: totalCount }] = await db.select({ value: count() }).from(orders).where(and(...countFilters));

  const itemsMap = await getOrderItemsRows(rows.map((row) => row.id));

  return {
    orders: rows.map((row) => mapOrder(row, itemsMap.get(row.id) ?? [])),
    count: {
      count: totalCount,
      isEstimated: false,
    },
  };
};

export const getOrder = async (
  orderID?: string,
  scope?: {
    userID: string;
    organizationId?: string;
  }
) => {
  if (!orderID) {
    return null as unknown as Order;
  }

  const db = createAppDb();
  const filters = [eq(orders.id, orderID)];
  if (scope) {
    filters.push(eq(orders.organizationId, resolveOrganizationId(scope)));
  }

  const rows = await db.select().from(orders).where(and(...filters)).limit(1);
  if (!rows.length) {
    return null as unknown as Order;
  }

  const itemsMap = await getOrderItemsRows([orderID]);
  return mapOrder(rows[0], itemsMap.get(orderID) ?? []);
};

export const createOrder = async (orderInfo: Partial<Order>) => {
  const db = createAppDb();
  const orderID = uuidv4();
  const publicId = await generatePublicId(ORDER_COLLECTION);
  const timestamp = Date.now();
  const converted = convertOrderUnitsStore(orderInfo);

  const userID = orderInfo.userID ?? "";
  const organizationId = resolveOrganizationId({
    userID,
    organizationId: orderInfo.organizationId,
  });

  const row = {
    id: orderID,
    publicId,
    userId: userID,
    organizationId,
    customerId: orderInfo.customer?.id,
    customerJson: orderInfo.customer ? JSON.stringify(orderInfo.customer) : null,
    status: orderInfo.status ?? "request",
    paymentMethodId: orderInfo.paymentMethod?.id,
    paymentMethodLabel: orderInfo.paymentMethod?.label,
    orderDate: orderInfo.orderDate ?? timestamp,
    dueDate: orderInfo.dueDate,
    totalCommissionCents: (converted.totalComission as number) ?? 0,
    totalCostCents: (converted.totalCost as number) ?? 0,
  };

  await db.insert(orders).values({
    ...row,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  for (const item of converted.items ?? []) {
    await db.insert(orderItems).values({
      id: uuidv4(),
      orderId: orderID,
      productId: item.productID,
      variantId: null,
      variantJson: JSON.stringify(item.variant ?? {}),
      title: item.title,
      quantity: item.quantity,
      balance: item.balance,
      discountPercent: item.descount,
      commissionRate: item.commissionRate,
      unitPriceCents: item.unitPrice,
      costCents: item.cost,
      itemTotalCostCents: item.itemTotalCost,
      productBaseUnitInventory: item.productBaseUnitInventory,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  if ((orderInfo.status ?? "request") === "complete") {
    await applyInventoryDeltaFromItems(orderInfo.items ?? [], -1);
  }

  await trackPendingSyncChange({
    organizationId,
    tableName: "orders",
    recordId: orderID,
    operation: "create",
    payload: row,
  });
};

export const deleteOrder = async (orderID: string) => {
  const db = createAppDb();
  const currentOrder = await getOrder(orderID);
  if (!currentOrder) {
    return;
  }

  await applyInventoryDeltaFromItems(currentOrder.items ?? [], 1);

  await db.delete(orders).where(eq(orders.id, orderID));

  await trackPendingSyncChange({
    organizationId: currentOrder.organizationId,
    tableName: "orders",
    recordId: orderID,
    operation: "delete",
    payload: { id: orderID },
  });
};

export const updateOrder = async (orderID: string, currentOrder: Partial<Order>) => {
  const db = createAppDb();
  const prevOrder = await getOrder(orderID);
  if (!prevOrder) {
    return;
  }

  const converted = convertOrderUnitsStore(currentOrder);

  const changes = {
    customerId: currentOrder.customer?.id,
    customerJson: currentOrder.customer ? JSON.stringify(currentOrder.customer) : undefined,
    status: currentOrder.status,
    paymentMethodId: currentOrder.paymentMethod?.id,
    paymentMethodLabel: currentOrder.paymentMethod?.label,
    orderDate: currentOrder.orderDate,
    dueDate: currentOrder.dueDate,
    totalCommissionCents: converted.totalComission as number,
    totalCostCents: converted.totalCost as number,
  };

  await db
    .update(orders)
    .set({
      ...changes,
      updatedAt: Date.now(),
    })
    .where(eq(orders.id, orderID));

  await db.delete(orderItems).where(eq(orderItems.orderId, orderID));
  for (const item of converted.items ?? []) {
    await db.insert(orderItems).values({
      id: uuidv4(),
      orderId: orderID,
      productId: item.productID,
      variantId: null,
      variantJson: JSON.stringify(item.variant ?? {}),
      title: item.title,
      quantity: item.quantity,
      balance: item.balance,
      discountPercent: item.descount,
      commissionRate: item.commissionRate,
      unitPriceCents: item.unitPrice,
      costCents: item.cost,
      itemTotalCostCents: item.itemTotalCost,
      productBaseUnitInventory: item.productBaseUnitInventory,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  const prevItems = prevOrder.items ?? [];
  const nextItems = currentOrder.items ?? [];

  if (currentOrder.status === "complete" && prevOrder.status === "complete") {
    await applyInventoryDeltaFromItems(prevItems, 1);
    await applyInventoryDeltaFromItems(nextItems, -1);
  }

  if (currentOrder.status === "complete" && prevOrder.status === "request") {
    await applyInventoryDeltaFromItems(nextItems, -1);
  }

  if (currentOrder.status === "request" && prevOrder.status === "complete") {
    await applyInventoryDeltaFromItems(prevItems, 1);
  }

  await trackPendingSyncChange({
    organizationId: prevOrder.organizationId,
    tableName: "orders",
    recordId: orderID,
    operation: "update",
    payload: changes,
  });
};
