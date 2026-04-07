import { and, asc, count, eq, gt, gte, inArray, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { resolveOrganizationId } from "../db/scope";
import { inboundOrderItems, inboundOrderPayments, inboundOrders } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { add, divide, multiply } from "lib/math";
import { adjustProductInventory, Variant } from "./products";

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
  return multiply(item.unitCost, item.quantity);
}

export type InboundOrderStatus = "request" | "complete";

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
  organizationId?: string;
  supplier: InboundOrderSupplier;
  createdAt: number;
  updatedAt?: number;
  payments: Array<InboundOrderPayment>;
  orderDate: number;
  dueDate: number;
  status: InboundOrderStatus;
  items: Array<InboundOrderItem>;
  totalCost: number;
}

export function calcInboundOrderTotalCost(order: InboundOrder) {
  return order.items.reduce((acc, i) => add(acc, i.itemTotalCost), 0);
}

export function calcInboundOrderTotalPaid(order: InboundOrder) {
  return order.payments.reduce((acc, p) => add(acc, p.amount), 0);
}

interface InboundOrderSearchParams {
  userID: string;
  organizationId?: string;
  supplierID?: string;
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  status: InboundOrderStatus;
  cursor?: InboundOrder;
  pageSize: number;
}

const INBOUND_ORDER_COLLECTION = COLLECTION_NAMES.INBOUND_ORDERS;

const convertInboundOrderUnitsStore = (inboundOrderInfo: Partial<InboundOrder>) => {
  return {
    ...inboundOrderInfo,
    totalCost: multiply(inboundOrderInfo.totalCost ?? 0, 100),
    payments: (inboundOrderInfo.payments ?? []).map((p) => ({
      ...p,
      amount: multiply(p.amount ?? 0, 100),
    })),
    items: (inboundOrderInfo.items ?? []).map((i) => ({
      ...i,
      itemTotalCost: multiply(i.itemTotalCost ?? 0, 100),
      unitCost: multiply(i.unitCost ?? 0, 100),
      variant: {
        ...i.variant,
        prices: (i.variant?.prices ?? []).map((p) => ({
          ...p,
          value: multiply(p.value ?? 0, 100),
          profit: multiply(p.profit ?? 0, 100),
        })),
        unitCost: multiply(i.variant?.unitCost ?? 0, 100),
        totalCost: multiply(i.variant?.totalCost ?? 0, 100),
      },
    })),
  };
};

const convertInboundOrderUnitsDisplay = (inboundOrderInfo: Partial<InboundOrder>) => {
  return {
    ...inboundOrderInfo,
    totalCost: divide(inboundOrderInfo.totalCost ?? 0, 100),
    payments: (inboundOrderInfo.payments ?? []).map((p) => ({
      ...p,
      amount: divide(p.amount ?? 0, 100),
    })),
    items: (inboundOrderInfo.items ?? []).map((i) => ({
      ...i,
      itemTotalCost: divide(i.itemTotalCost ?? 0, 100),
      unitCost: divide(i.unitCost ?? 0, 100),
      variant: {
        ...i.variant,
        prices: (i.variant?.prices ?? []).map((p) => ({
          ...p,
          value: divide(p.value ?? 0, 100),
          profit: divide(p.profit ?? 0, 100),
        })),
        unitCost: divide(i.variant?.unitCost ?? 0, 100),
        totalCost: divide(i.variant?.totalCost ?? 0, 100),
      },
    })),
  };
};

const mapInboundOrder = (
  row: typeof inboundOrders.$inferSelect,
  rowItems: typeof inboundOrderItems.$inferSelect[],
  rowPayments: typeof inboundOrderPayments.$inferSelect[]
): InboundOrder => {
  const inbound = {
    id: row.id,
    publicId: row.publicId ?? "",
    userID: row.userId,
    organizationId: row.organizationId,
    supplier: row.supplierJson
      ? JSON.parse(row.supplierJson)
      : {
          id: row.supplierId ?? "",
          name: "",
        },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    orderDate: row.orderDate,
    dueDate: row.dueDate ?? row.orderDate,
    status: row.status as InboundOrderStatus,
    totalCost: row.totalCostCents,
    items: rowItems.map((item) => ({
      productID: item.productId,
      productBaseUnitInventory: item.productBaseUnitInventory,
      variant: item.variantJson ? JSON.parse(item.variantJson) : ({} as Variant),
      title: item.title,
      balance: item.balance,
      quantity: item.quantity,
      unitCost: item.unitCostCents,
      itemTotalCost: item.itemTotalCostCents,
    })),
    payments: rowPayments.map((payment) => ({
      method: {
        id: payment.methodId ?? "",
        label: payment.methodLabel ?? "",
      },
      amount: payment.amountCents,
      dueDate: payment.dueDate ?? undefined,
    })),
  } as InboundOrder;

  return convertInboundOrderUnitsDisplay(inbound) as InboundOrder;
};

const getInboundItemsRows = async (orderIds: string[]) => {
  if (!orderIds.length) {
    return new Map<string, typeof inboundOrderItems.$inferSelect[]>();
  }

  const db = createAppDb();
  const rows = await db.select().from(inboundOrderItems).where(inArray(inboundOrderItems.inboundOrderId, orderIds));
  const map = new Map<string, typeof inboundOrderItems.$inferSelect[]>();
  rows.forEach((item) => {
    const values = map.get(item.inboundOrderId) ?? [];
    values.push(item);
    map.set(item.inboundOrderId, values);
  });
  return map;
};

const getInboundPaymentsRows = async (orderIds: string[]) => {
  if (!orderIds.length) {
    return new Map<string, typeof inboundOrderPayments.$inferSelect[]>();
  }

  const db = createAppDb();
  const rows = await db
    .select()
    .from(inboundOrderPayments)
    .where(inArray(inboundOrderPayments.inboundOrderId, orderIds));

  const map = new Map<string, typeof inboundOrderPayments.$inferSelect[]>();
  rows.forEach((payment) => {
    const values = map.get(payment.inboundOrderId) ?? [];
    values.push(payment);
    map.set(payment.inboundOrderId, values);
  });
  return map;
};

const applyInventoryDeltaFromItems = async (items: InboundOrderItem[], factor: 1 | -1) => {
  const itemsByProduct = items.reduce((acc, item) => {
    acc[item.productID] = [...(acc[item.productID] ?? []), item];
    return acc;
  }, {} as Record<string, InboundOrderItem[]>);

  for (const productItems of Object.values(itemsByProduct)) {
    const balanceInBaseUnit = productItems.reduce((acc, item) => add(acc, multiply(item.quantity, item.variant.conversionRate)), 0);
    await adjustProductInventory(productItems[0].productID, factor * balanceInBaseUnit);
  }
};

export const getInboundOrders = async (searchParams: InboundOrderSearchParams) => {
  const db = createAppDb();
  const scopeOrganizationId = resolveOrganizationId({
    userID: searchParams.userID,
    organizationId: searchParams.organizationId,
  });

  const filters = [eq(inboundOrders.organizationId, scopeOrganizationId)];

  if (searchParams.supplierID) {
    filters.push(eq(inboundOrders.supplierId, searchParams.supplierID));
  }

  if (searchParams.status) {
    filters.push(eq(inboundOrders.status, searchParams.status));
  } else {
    filters.push(eq(inboundOrders.status, "complete"));
  }

  if (searchParams.dateRange?.startDate) {
    filters.push(gte(inboundOrders.createdAt, searchParams.dateRange.startDate));
  }

  if (searchParams.dateRange?.endDate) {
    filters.push(lte(inboundOrders.createdAt, searchParams.dateRange.endDate));
  }

  if (searchParams.cursor?.createdAt) {
    filters.push(gt(inboundOrders.createdAt, searchParams.cursor.createdAt));
  }

  const rows = await db
    .select()
    .from(inboundOrders)
    .where(and(...filters))
    .orderBy(asc(inboundOrders.createdAt))
    .limit(searchParams.pageSize);

  const countFilters = [eq(inboundOrders.organizationId, scopeOrganizationId)];

  if (searchParams.supplierID) {
    countFilters.push(eq(inboundOrders.supplierId, searchParams.supplierID));
  }

  if (searchParams.status) {
    countFilters.push(eq(inboundOrders.status, searchParams.status));
  } else {
    countFilters.push(eq(inboundOrders.status, "complete"));
  }

  if (searchParams.dateRange?.startDate) {
    countFilters.push(gte(inboundOrders.createdAt, searchParams.dateRange.startDate));
  }

  if (searchParams.dateRange?.endDate) {
    countFilters.push(lte(inboundOrders.createdAt, searchParams.dateRange.endDate));
  }

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(inboundOrders)
    .where(and(...countFilters));

  const ids = rows.map((row) => row.id);
  const itemsMap = await getInboundItemsRows(ids);
  const paymentsMap = await getInboundPaymentsRows(ids);

  return {
    inboundOrders: rows.map((row) => mapInboundOrder(row, itemsMap.get(row.id) ?? [], paymentsMap.get(row.id) ?? [])),
    count: {
      count: totalCount,
      isEstimated: false,
    },
  };
};

export const getInboundOrder = async (
  inboundOrderID?: string,
  scope?: {
    userID: string;
    organizationId?: string;
  }
) => {
  if (!inboundOrderID) {
    return null as unknown as InboundOrder;
  }

  const db = createAppDb();
  const filters = [eq(inboundOrders.id, inboundOrderID)];
  if (scope) {
    filters.push(eq(inboundOrders.organizationId, resolveOrganizationId(scope)));
  }

  const rows = await db.select().from(inboundOrders).where(and(...filters)).limit(1);
  if (!rows.length) {
    return null as unknown as InboundOrder;
  }

  const itemsMap = await getInboundItemsRows([inboundOrderID]);
  const paymentsMap = await getInboundPaymentsRows([inboundOrderID]);
  return mapInboundOrder(rows[0], itemsMap.get(inboundOrderID) ?? [], paymentsMap.get(inboundOrderID) ?? []);
};

export const createInboundOrder = async (inboundOrderInfo: Partial<InboundOrder>) => {
  const db = createAppDb();
  const inboundOrderID = uuidv4();
  const publicId = await generatePublicId(INBOUND_ORDER_COLLECTION);
  const timestamp = Date.now();
  const converted = convertInboundOrderUnitsStore(inboundOrderInfo);

  const userID = inboundOrderInfo.userID ?? "";
  const organizationId = resolveOrganizationId({
    userID,
    organizationId: inboundOrderInfo.organizationId,
  });

  await db.insert(inboundOrders).values({
    id: inboundOrderID,
    publicId,
    userId: userID,
    organizationId,
    supplierId: inboundOrderInfo.supplier?.id,
    supplierJson: inboundOrderInfo.supplier ? JSON.stringify(inboundOrderInfo.supplier) : null,
    status: inboundOrderInfo.status ?? "request",
    orderDate: inboundOrderInfo.orderDate ?? timestamp,
    dueDate: inboundOrderInfo.dueDate,
    totalCostCents: (converted.totalCost as number) ?? 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  for (const item of converted.items ?? []) {
    await db.insert(inboundOrderItems).values({
      id: uuidv4(),
      inboundOrderId: inboundOrderID,
      productId: item.productID,
      variantId: null,
      variantJson: JSON.stringify(item.variant ?? {}),
      title: item.title,
      quantity: item.quantity,
      balance: item.balance,
      unitCostCents: item.unitCost,
      itemTotalCostCents: item.itemTotalCost,
      productBaseUnitInventory: item.productBaseUnitInventory,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  for (const payment of converted.payments ?? []) {
    await db.insert(inboundOrderPayments).values({
      id: uuidv4(),
      inboundOrderId: inboundOrderID,
      methodId: payment.method?.id,
      methodLabel: payment.method?.label,
      amountCents: payment.amount,
      dueDate: payment.dueDate,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  if ((inboundOrderInfo.status ?? "request") === "complete") {
    await applyInventoryDeltaFromItems(inboundOrderInfo.items ?? [], 1);
  }

  await trackPendingSyncChange({
    organizationId,
    tableName: "inbound_order",
    recordId: inboundOrderID,
    operation: "create",
    payload: inboundOrderInfo,
  });

  return { id: inboundOrderID, publicId };
};

export const deleteInboundOrder = async (inboundOrderID: string) => {
  const db = createAppDb();
  const currentOrder = await getInboundOrder(inboundOrderID);
  if (!currentOrder) {
    return;
  }

  await applyInventoryDeltaFromItems(currentOrder.items ?? [], -1);

  await db.delete(inboundOrders).where(eq(inboundOrders.id, inboundOrderID));

  await trackPendingSyncChange({
    organizationId: currentOrder.organizationId,
    tableName: "inbound_order",
    recordId: inboundOrderID,
    operation: "delete",
    payload: { id: inboundOrderID },
  });
};

export const updateInboundOrder = async (inboundOrderID: string, currentInboundOrder: Partial<InboundOrder>) => {
  const db = createAppDb();
  const prevInboundOrder = await getInboundOrder(inboundOrderID);
  if (!prevInboundOrder) {
    return;
  }

  const converted = convertInboundOrderUnitsStore(currentInboundOrder);

  await db
    .update(inboundOrders)
    .set({
      supplierId: currentInboundOrder.supplier?.id,
      supplierJson: currentInboundOrder.supplier ? JSON.stringify(currentInboundOrder.supplier) : undefined,
      status: currentInboundOrder.status,
      orderDate: currentInboundOrder.orderDate,
      dueDate: currentInboundOrder.dueDate,
      totalCostCents: converted.totalCost as number,
      updatedAt: Date.now(),
    })
    .where(eq(inboundOrders.id, inboundOrderID));

  await db.delete(inboundOrderItems).where(eq(inboundOrderItems.inboundOrderId, inboundOrderID));
  for (const item of converted.items ?? []) {
    await db.insert(inboundOrderItems).values({
      id: uuidv4(),
      inboundOrderId: inboundOrderID,
      productId: item.productID,
      variantId: null,
      variantJson: JSON.stringify(item.variant ?? {}),
      title: item.title,
      quantity: item.quantity,
      balance: item.balance,
      unitCostCents: item.unitCost,
      itemTotalCostCents: item.itemTotalCost,
      productBaseUnitInventory: item.productBaseUnitInventory,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  await db.delete(inboundOrderPayments).where(eq(inboundOrderPayments.inboundOrderId, inboundOrderID));
  for (const payment of converted.payments ?? []) {
    await db.insert(inboundOrderPayments).values({
      id: uuidv4(),
      inboundOrderId: inboundOrderID,
      methodId: payment.method?.id,
      methodLabel: payment.method?.label,
      amountCents: payment.amount,
      dueDate: payment.dueDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  const prevItems = prevInboundOrder.items ?? [];
  const nextItems = currentInboundOrder.items ?? [];

  if (currentInboundOrder.status === "complete" && prevInboundOrder.status === "complete") {
    await applyInventoryDeltaFromItems(prevItems, -1);
    await applyInventoryDeltaFromItems(nextItems, 1);
  }

  if (currentInboundOrder.status === "complete" && prevInboundOrder.status === "request") {
    await applyInventoryDeltaFromItems(nextItems, 1);
  }

  if (currentInboundOrder.status === "request" && prevInboundOrder.status === "complete") {
    await applyInventoryDeltaFromItems(prevItems, -1);
  }

  await trackPendingSyncChange({
    organizationId: prevInboundOrder.organizationId,
    tableName: "inbound_order",
    recordId: inboundOrderID,
    operation: "update",
    payload: currentInboundOrder,
  });
};
