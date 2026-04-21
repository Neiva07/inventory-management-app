import { and, count, desc, eq, gt, lte, gte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { resolveOrganizationId } from "../db/scope";
import { supplierBills } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { multiply, divide } from "lib/math";

export type SupplierBillStatus = "active" | "paid" | "overdue" | "cancelled";

export interface SupplierBill {
  id: string;
  publicId: string;
  userID: string;
  organizationId?: string;
  supplier: {
    supplierID: string;
    publicID: string;
    supplierName: string;
  };
  inboundOrder: {
    id: string;
    publicId: string;
  };
  totalValue: number;
  initialCashInstallment: number;
  remainingValue: number;
  startDate: number;
  createdAt: number;
  updatedAt?: number;
  status: SupplierBillStatus;
}

interface SupplierBillSearchParams {
  userID: string;
  organizationId?: string;
  supplierID?: string;
  status?: SupplierBillStatus;
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  cursor?: SupplierBill;
  pageSize: number;
}

const SUPPLIER_BILL_COLLECTION = COLLECTION_NAMES.SUPPLIER_BILLS;

const convertSupplierBillUnitsStore = (supplierBillInfo: Partial<SupplierBill>) => {
  return {
    ...supplierBillInfo,
    totalValue: multiply(supplierBillInfo.totalValue ?? 0, 100),
    initialCashInstallment: multiply(supplierBillInfo.initialCashInstallment ?? 0, 100),
    remainingValue: multiply(supplierBillInfo.remainingValue ?? 0, 100),
  };
};

const convertSupplierBillUnitsDisplay = (supplierBillInfo: Partial<SupplierBill>) => {
  return {
    ...supplierBillInfo,
    totalValue: divide(supplierBillInfo.totalValue ?? 0, 100),
    initialCashInstallment: divide(supplierBillInfo.initialCashInstallment ?? 0, 100),
    remainingValue: divide(supplierBillInfo.remainingValue ?? 0, 100),
  };
};

const mapSupplierBill = (row: typeof supplierBills.$inferSelect): SupplierBill => {
  const bill = {
    id: row.id,
    publicId: row.publicId ?? "",
    userID: row.userId,
    organizationId: row.organizationId,
    supplier: row.supplierJson
      ? JSON.parse(row.supplierJson)
      : {
          supplierID: row.supplierId ?? "",
          publicID: "",
          supplierName: "",
        },
    inboundOrder: row.inboundOrderJson
      ? JSON.parse(row.inboundOrderJson)
      : {
          id: row.inboundOrderId ?? "",
          publicId: "",
        },
    totalValue: row.totalAmountCents,
    initialCashInstallment: row.paidAmountCents,
    remainingValue: Math.max(0, row.totalAmountCents - row.paidAmountCents),
    startDate: row.dueDate ?? row.createdAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    status: row.status as SupplierBillStatus,
  } as SupplierBill;

  return convertSupplierBillUnitsDisplay(bill) as SupplierBill;
};

export const getSupplierBills = async (searchParams: SupplierBillSearchParams) => {
  const db = createAppDb();
  const scopeOrganizationId = resolveOrganizationId({
    userID: searchParams.userID,
    organizationId: searchParams.organizationId,
  });

  const filters = [eq(supplierBills.organizationId, scopeOrganizationId)];

  if (searchParams.supplierID) {
    filters.push(eq(supplierBills.supplierId, searchParams.supplierID));
  }

  if (searchParams.status) {
    filters.push(eq(supplierBills.status, searchParams.status));
  }

  if (searchParams.dateRange?.startDate) {
    filters.push(gte(supplierBills.createdAt, searchParams.dateRange.startDate));
  }

  if (searchParams.dateRange?.endDate) {
    filters.push(lte(supplierBills.createdAt, searchParams.dateRange.endDate));
  }

  if (searchParams.cursor?.createdAt) {
    filters.push(gt(supplierBills.createdAt, searchParams.cursor.createdAt));
  }

  const rows = await db
    .select()
    .from(supplierBills)
    .where(and(...filters))
    .orderBy(desc(supplierBills.createdAt))
    .limit(searchParams.pageSize);

  const countFilters = [eq(supplierBills.organizationId, scopeOrganizationId)];

  if (searchParams.supplierID) {
    countFilters.push(eq(supplierBills.supplierId, searchParams.supplierID));
  }

  if (searchParams.status) {
    countFilters.push(eq(supplierBills.status, searchParams.status));
  }

  if (searchParams.dateRange?.startDate) {
    countFilters.push(gte(supplierBills.createdAt, searchParams.dateRange.startDate));
  }

  if (searchParams.dateRange?.endDate) {
    countFilters.push(lte(supplierBills.createdAt, searchParams.dateRange.endDate));
  }

  const [{ value: totalCount }] = await db.select({ value: count() }).from(supplierBills).where(and(...countFilters));

  return {
    supplierBills: rows.map(mapSupplierBill),
    count: {
      count: totalCount,
      isEstimated: false,
    },
  };
};

export const getSupplierBill = async (
  supplierBillID?: string,
  scope?: {
    userID: string;
    organizationId?: string;
  }
) => {
  if (!supplierBillID) {
    return null as unknown as SupplierBill;
  }

  const db = createAppDb();
  const filters = [eq(supplierBills.id, supplierBillID)];
  if (scope) {
    filters.push(eq(supplierBills.organizationId, resolveOrganizationId(scope)));
  }

  const row = await db.select().from(supplierBills).where(and(...filters)).limit(1);
  return row.length ? mapSupplierBill(row[0]) : (null as unknown as SupplierBill);
};

export const createSupplierBill = async (supplierBillInfo: Partial<SupplierBill>) => {
  const db = createAppDb();
  const supplierBillID = uuidv4();
  const publicId = await generatePublicId(SUPPLIER_BILL_COLLECTION);
  const timestamp = Date.now();
  const converted = convertSupplierBillUnitsStore(supplierBillInfo);

  const userID = supplierBillInfo.userID ?? "";
  const organizationId = resolveOrganizationId({
    userID,
    organizationId: supplierBillInfo.organizationId,
  });

  const row = {
    id: supplierBillID,
    publicId,
    userId: userID,
    organizationId,
    supplierId: supplierBillInfo.supplier?.supplierID,
    supplierJson: supplierBillInfo.supplier ? JSON.stringify(supplierBillInfo.supplier) : null,
    inboundOrderId: supplierBillInfo.inboundOrder?.id,
    inboundOrderJson: supplierBillInfo.inboundOrder ? JSON.stringify(supplierBillInfo.inboundOrder) : null,
    status: supplierBillInfo.status ?? "active",
    dueDate: supplierBillInfo.startDate,
    totalAmountCents: (converted.totalValue as number) ?? 0,
    paidAmountCents: (converted.initialCashInstallment as number) ?? 0,
  };

  await db.insert(supplierBills).values({
    ...row,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await trackPendingSyncChange({
    organizationId,
    tableName: "supplier_bills",
    recordId: supplierBillID,
    operation: "create",
    payload: row,
  });

  return supplierBillID;
};

export const updateSupplierBill = async (supplierBillID: string, supplierBillInfo: Partial<SupplierBill>) => {
  const db = createAppDb();
  const converted = convertSupplierBillUnitsStore(supplierBillInfo);
  const existing = await db.select({ organizationId: supplierBills.organizationId }).from(supplierBills).where(eq(supplierBills.id, supplierBillID)).limit(1);

  const changes = {
    supplierId: supplierBillInfo.supplier?.supplierID,
    supplierJson: supplierBillInfo.supplier ? JSON.stringify(supplierBillInfo.supplier) : undefined,
    inboundOrderId: supplierBillInfo.inboundOrder?.id,
    inboundOrderJson: supplierBillInfo.inboundOrder ? JSON.stringify(supplierBillInfo.inboundOrder) : undefined,
    status: supplierBillInfo.status,
    dueDate: supplierBillInfo.startDate,
    totalAmountCents: converted.totalValue as number,
    paidAmountCents: converted.initialCashInstallment as number,
  };

  await db
    .update(supplierBills)
    .set({
      ...changes,
      updatedAt: Date.now(),
    })
    .where(eq(supplierBills.id, supplierBillID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "supplier_bills",
    recordId: supplierBillID,
    operation: "update",
    payload: changes,
  });
};

export const deleteSupplierBill = async (supplierBillID: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: supplierBills.organizationId }).from(supplierBills).where(eq(supplierBills.id, supplierBillID)).limit(1);

  await db.delete(supplierBills).where(eq(supplierBills.id, supplierBillID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "supplier_bills",
    recordId: supplierBillID,
    operation: "delete",
    payload: { id: supplierBillID },
  });
};
