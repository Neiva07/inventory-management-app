import { and, asc, count, eq, gt, isNull, lte, gte, lt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { resolveOrganizationId } from "../db/scope";
import { installmentPayments } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";
import { multiply, divide, formatCurrency } from "lib/math";

export type InstallmentPaymentStatus = "pending" | "paid" | "overdue" | "cancelled";

export interface InstallmentPayment {
  id: string;
  publicId: string;
  userID: string;
  organizationId?: string;
  supplierBillID: string;
  installmentNumber: number;
  dueDate: number;
  amount: number;
  paymentMethod: {
    id: string;
    label: string;
  };
  status: InstallmentPaymentStatus;
  paidAt?: number;
  paidAmount?: number;
  createdAt: number;
  updatedAt?: number;
  deleted: {
    date: number;
    isDeleted: boolean;
  };
}

interface InstallmentPaymentSearchParams {
  userID: string;
  organizationId?: string;
  supplierBillID?: string;
  status?: InstallmentPaymentStatus;
  dateRange?: {
    startDate?: number;
    endDate?: number;
  };
  cursor?: InstallmentPayment;
  pageSize: number;
}

const INSTALLMENT_PAYMENT_COLLECTION = COLLECTION_NAMES.INSTALLMENT_PAYMENTS;

const convertInstallmentPaymentUnitsStore = (installmentPaymentInfo: Partial<InstallmentPayment>) => {
  const converted: Partial<InstallmentPayment> = {
    ...installmentPaymentInfo,
    amount: multiply(installmentPaymentInfo.amount ?? 0, 100),
  };

  if (installmentPaymentInfo.paidAmount !== undefined && installmentPaymentInfo.paidAmount !== null) {
    converted.paidAmount = multiply(installmentPaymentInfo.paidAmount, 100);
  }

  return converted;
};

const convertInstallmentPaymentUnitsDisplay = (installmentPaymentInfo: Partial<InstallmentPayment>) => {
  return {
    ...installmentPaymentInfo,
    amount: divide(installmentPaymentInfo.amount ?? 0, 100),
    paidAmount:
      installmentPaymentInfo.paidAmount !== undefined && installmentPaymentInfo.paidAmount !== null
        ? divide(installmentPaymentInfo.paidAmount, 100)
        : undefined,
  };
};

const mapInstallment = (row: typeof installmentPayments.$inferSelect): InstallmentPayment => {
  const installment = {
    id: row.id,
    publicId: row.publicId ?? "",
    userID: row.userId,
    organizationId: row.organizationId,
    supplierBillID: row.supplierBillId,
    installmentNumber: row.installmentNumber,
    dueDate: row.dueDate,
    amount: row.amountCents,
    paymentMethod: {
      id: row.paymentMethodId ?? "",
      label: row.paymentMethodLabel ?? "",
    },
    status: row.status as InstallmentPaymentStatus,
    paidAt: row.paidDate ?? undefined,
    paidAmount: row.paidAmountCents ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: {
      isDeleted: row.deletedAt !== null,
      date: row.deletedAt ?? 0,
    },
  } as InstallmentPayment;

  return convertInstallmentPaymentUnitsDisplay(installment) as InstallmentPayment;
};

export const getInstallmentPayments = async (searchParams: InstallmentPaymentSearchParams) => {
  const db = createAppDb();
  const scopeOrganizationId = resolveOrganizationId({
    userID: searchParams.userID,
    organizationId: searchParams.organizationId,
  });

  const filters = [eq(installmentPayments.organizationId, scopeOrganizationId), isNull(installmentPayments.deletedAt)];

  if (searchParams.supplierBillID) {
    filters.push(eq(installmentPayments.supplierBillId, searchParams.supplierBillID));
  }

  if (searchParams.status) {
    filters.push(eq(installmentPayments.status, searchParams.status));
  }

  if (searchParams.dateRange?.startDate) {
    filters.push(gte(installmentPayments.dueDate, searchParams.dateRange.startDate));
  }

  if (searchParams.dateRange?.endDate) {
    filters.push(lte(installmentPayments.dueDate, searchParams.dateRange.endDate));
  }

  if (searchParams.cursor?.dueDate) {
    filters.push(gt(installmentPayments.dueDate, searchParams.cursor.dueDate));
  }

  const rows = await db
    .select()
    .from(installmentPayments)
    .where(and(...filters))
    .orderBy(asc(installmentPayments.dueDate))
    .limit(searchParams.pageSize);

  const countFilters = [eq(installmentPayments.organizationId, scopeOrganizationId), isNull(installmentPayments.deletedAt)];

  if (searchParams.supplierBillID) {
    countFilters.push(eq(installmentPayments.supplierBillId, searchParams.supplierBillID));
  }

  if (searchParams.status) {
    countFilters.push(eq(installmentPayments.status, searchParams.status));
  }

  if (searchParams.dateRange?.startDate) {
    countFilters.push(gte(installmentPayments.dueDate, searchParams.dateRange.startDate));
  }

  if (searchParams.dateRange?.endDate) {
    countFilters.push(lte(installmentPayments.dueDate, searchParams.dateRange.endDate));
  }

  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(installmentPayments)
    .where(and(...countFilters));

  return {
    installmentPayments: rows.map(mapInstallment),
    count: {
      count: totalCount,
      isEstimated: false,
    },
  };
};

export const getInstallmentPayment = async (
  installmentPaymentID?: string,
  scope?: {
    userID: string;
    organizationId?: string;
  }
) => {
  if (!installmentPaymentID) {
    return null as unknown as InstallmentPayment;
  }

  const db = createAppDb();
  const filters = [eq(installmentPayments.id, installmentPaymentID)];
  if (scope) {
    filters.push(eq(installmentPayments.organizationId, resolveOrganizationId(scope)));
  }

  const rows = await db.select().from(installmentPayments).where(and(...filters)).limit(1);
  return rows.length ? mapInstallment(rows[0]) : (null as unknown as InstallmentPayment);
};

export const createInstallmentPayment = async (installmentPaymentInfo: Partial<InstallmentPayment>) => {
  const db = createAppDb();
  const installmentPaymentID = uuidv4();
  const publicId = await generatePublicId(INSTALLMENT_PAYMENT_COLLECTION);
  const timestamp = Date.now();
  const converted = convertInstallmentPaymentUnitsStore(installmentPaymentInfo);

  const userID = installmentPaymentInfo.userID ?? "";
  const organizationId = resolveOrganizationId({
    userID,
    organizationId: installmentPaymentInfo.organizationId,
  });

  await db.insert(installmentPayments).values({
    id: installmentPaymentID,
    publicId,
    supplierBillId: installmentPaymentInfo.supplierBillID,
    organizationId,
    userId: userID,
    installmentNumber: installmentPaymentInfo.installmentNumber ?? 1,
    status: installmentPaymentInfo.status ?? "pending",
    dueDate: installmentPaymentInfo.dueDate ?? timestamp,
    paidDate: installmentPaymentInfo.paidAt,
    amountCents: (converted.amount as number) ?? 0,
    paidAmountCents: (converted.paidAmount as number) ?? 0,
    paymentMethodId: installmentPaymentInfo.paymentMethod?.id,
    paymentMethodLabel: installmentPaymentInfo.paymentMethod?.label,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  });

  await trackPendingSyncChange({
    organizationId,
    tableName: "installment_payments",
    recordId: installmentPaymentID,
    operation: "create",
    payload: installmentPaymentInfo,
  });
};

export const createMultipleInstallmentPayments = async (installments: Partial<InstallmentPayment>[]) => {
  const db = createAppDb();
  const timestamp = Date.now();

  for (const installment of installments) {
    const converted = convertInstallmentPaymentUnitsStore(installment);
    const userID = installment.userID ?? "";
    const organizationId = resolveOrganizationId({
      userID,
      organizationId: installment.organizationId,
    });
    const installmentId = uuidv4();

    await db.insert(installmentPayments).values({
      id: installmentId,
      publicId: await generatePublicId(INSTALLMENT_PAYMENT_COLLECTION),
      supplierBillId: installment.supplierBillID,
      organizationId,
      userId: userID,
      installmentNumber: installment.installmentNumber ?? 1,
      status: installment.status ?? "pending",
      dueDate: installment.dueDate ?? timestamp,
      paidDate: installment.paidAt,
      amountCents: (converted.amount as number) ?? 0,
      paidAmountCents: (converted.paidAmount as number) ?? 0,
      paymentMethodId: installment.paymentMethod?.id,
      paymentMethodLabel: installment.paymentMethod?.label,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    });

    await trackPendingSyncChange({
      organizationId,
      tableName: "installment_payments",
      recordId: installmentId,
      operation: "create",
      payload: installment,
    });
  }
};

export const updateInstallmentPayment = async (installmentPaymentID: string, installmentPaymentInfo: Partial<InstallmentPayment>) => {
  const db = createAppDb();
  const converted = convertInstallmentPaymentUnitsStore(installmentPaymentInfo);
  const existing = await db
    .select({ organizationId: installmentPayments.organizationId })
    .from(installmentPayments)
    .where(eq(installmentPayments.id, installmentPaymentID))
    .limit(1);

  await db
    .update(installmentPayments)
    .set({
      updatedAt: Date.now(),
      installmentNumber: installmentPaymentInfo.installmentNumber,
      status: installmentPaymentInfo.status,
      dueDate: installmentPaymentInfo.dueDate,
      paidDate: installmentPaymentInfo.paidAt,
      amountCents: converted.amount as number,
      paidAmountCents: converted.paidAmount as number,
      paymentMethodId: installmentPaymentInfo.paymentMethod?.id,
      paymentMethodLabel: installmentPaymentInfo.paymentMethod?.label,
    })
    .where(eq(installmentPayments.id, installmentPaymentID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "installment_payments",
    recordId: installmentPaymentID,
    operation: "update",
    payload: installmentPaymentInfo,
  });
};

export const recordPayment = async (
  installmentPaymentID: string,
  paidAmount: number,
  paymentMethod?: { id: string; label: string }
) => {
  const db = createAppDb();
  const rows = await db.select().from(installmentPayments).where(eq(installmentPayments.id, installmentPaymentID)).limit(1);

  if (!rows.length) {
    throw new Error("Parcela não encontrada");
  }

  const currentInstallment = mapInstallment(rows[0]);

  if (currentInstallment.status === "paid") {
    throw new Error("Esta parcela já foi paga");
  }

  if (currentInstallment.status === "cancelled") {
    throw new Error("Esta parcela foi cancelada e não pode ser paga");
  }

  if (paidAmount !== currentInstallment.amount) {
    throw new Error(`Valor deve ser exatamente ${formatCurrency(currentInstallment.amount)}`);
  }

  const converted = convertInstallmentPaymentUnitsStore({
    paidAmount,
    status: "paid",
  });

  await db
    .update(installmentPayments)
    .set({
      status: "paid",
      paidDate: Date.now(),
      paidAmountCents: converted.paidAmount as number,
      paymentMethodId: paymentMethod?.id,
      paymentMethodLabel: paymentMethod?.label,
      updatedAt: Date.now(),
    })
    .where(eq(installmentPayments.id, installmentPaymentID));

  await trackPendingSyncChange({
    organizationId: currentInstallment.organizationId,
    tableName: "installment_payments",
    recordId: installmentPaymentID,
    operation: "update",
    payload: {
      id: installmentPaymentID,
      paidAmount,
      paymentMethod,
      status: "paid",
    },
  });
};

export const deleteInstallmentPayment = async (installmentPaymentID: string) => {
  const db = createAppDb();
  const existing = await db
    .select({ organizationId: installmentPayments.organizationId })
    .from(installmentPayments)
    .where(eq(installmentPayments.id, installmentPaymentID))
    .limit(1);

  await db
    .update(installmentPayments)
    .set({
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    })
    .where(eq(installmentPayments.id, installmentPaymentID));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "installment_payments",
    recordId: installmentPaymentID,
    operation: "delete",
    payload: { id: installmentPaymentID },
  });
};

export const updateOverdueInstallments = async (userID: string, organizationId?: string) => {
  const db = createAppDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();
  const scopeOrganizationId = resolveOrganizationId({ userID, organizationId });

  const overdueRows = await db
    .select({ id: installmentPayments.id })
    .from(installmentPayments)
    .where(
      and(
        eq(installmentPayments.organizationId, scopeOrganizationId),
        eq(installmentPayments.status, "pending"),
        lt(installmentPayments.dueDate, todayTimestamp),
        isNull(installmentPayments.deletedAt)
      )
    );

  if (!overdueRows.length) {
    return { updated: 0 };
  }

  for (const row of overdueRows) {
    await db
      .update(installmentPayments)
      .set({
        status: "overdue",
        updatedAt: Date.now(),
      })
      .where(eq(installmentPayments.id, row.id));

    await trackPendingSyncChange({
      organizationId: scopeOrganizationId,
      tableName: "installment_payments",
      recordId: row.id,
      operation: "update",
      payload: { id: row.id, status: "overdue" },
    });
  }

  return { updated: overdueRows.length };
};
