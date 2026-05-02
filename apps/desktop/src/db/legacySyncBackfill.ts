import { and, eq } from "drizzle-orm";
import { createAppDb } from "./client";
import { SYNC_TABLE_MAP, SYNC_TABLE_ORDER } from "./syncTableMap";
import { enqueueSyncChange } from "./syncQueue";
import {
  inboundOrders,
  orders,
  products,
  suppliers,
  syncMeta,
  syncQueue,
} from "./schema";

const BACKFILL_META_ID = "one_time:legacy_sync_queue_backfill:v1";

type BackfillRow = Record<string, unknown> & {
  id?: string | null;
  organizationId?: string | null;
  userId?: string | null;
  productId?: string | null;
  orderId?: string | null;
  inboundOrderId?: string | null;
  supplierId?: string | null;
};

const hasCompletedBackfill = async (): Promise<boolean> => {
  const db = createAppDb();
  const rows = await db
    .select()
    .from(syncMeta)
    .where(eq(syncMeta.id, BACKFILL_META_ID))
    .limit(1);

  return rows[0]?.value === "true";
};

const markBackfillComplete = async (): Promise<void> => {
  const db = createAppDb();
  const timestamp = Date.now();

  await db
    .insert(syncMeta)
    .values({
      id: BACKFILL_META_ID,
      key: "legacySyncQueueBackfill",
      value: "true",
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .onConflictDoUpdate({
      target: syncMeta.id,
      set: {
        value: "true",
        updatedAt: timestamp,
      },
    });
};

const hasQueueHistory = async (tableName: string, recordId: string): Promise<boolean> => {
  const db = createAppDb();
  const rows = await db
    .select({ id: syncQueue.id })
    .from(syncQueue)
    .where(and(eq(syncQueue.tableName, tableName), eq(syncQueue.recordId, recordId)))
    .limit(1);

  return rows.length > 0;
};

const selectAllRows = async (tableName: keyof typeof SYNC_TABLE_MAP): Promise<BackfillRow[]> => {
  const db = createAppDb();
  const table = SYNC_TABLE_MAP[tableName].table;
  return await db.select().from(table as never) as BackfillRow[];
};

const selectOrganizationIdById = async (
  table: typeof products | typeof orders | typeof inboundOrders | typeof suppliers,
  id: string | null | undefined,
): Promise<string | null> => {
  if (!id) {
    return null;
  }

  const db = createAppDb();
  const rows = await db
    .select({ organizationId: table.organizationId })
    .from(table)
    .where(eq(table.id, id))
    .limit(1);

  return rows[0]?.organizationId ?? null;
};

const getScopeId = async (tableName: string, row: BackfillRow): Promise<string | null> => {
  if ((tableName === "users" || tableName === "organizations") && typeof row.id === "string") {
    return row.id;
  }

  const directScope = row.organizationId ?? row.userId;
  if (typeof directScope === "string" && directScope) {
    return directScope;
  }

  switch (tableName) {
    case "product_variants":
      return selectOrganizationIdById(products, row.productId);
    case "order_items":
      return selectOrganizationIdById(orders, row.orderId);
    case "inbound_order_items":
    case "inbound_order_payments":
      return selectOrganizationIdById(inboundOrders, row.inboundOrderId);
    case "supplier_product_categories":
      return selectOrganizationIdById(suppliers, row.supplierId);
    default:
      return null;
  }
};

/**
 * One-time repair for local rows created before every syncable model write was
 * tracked in sync_queue. It only queues rows with no queue history, so existing
 * synced rows are not replayed on every launch.
 */
export const runLegacySyncQueueBackfill = async (): Promise<void> => {
  if (await hasCompletedBackfill()) {
    return;
  }

  let enqueuedCount = 0;
  let skippedCount = 0;

  for (const tableName of SYNC_TABLE_ORDER) {
    const rows = await selectAllRows(tableName);

    for (const row of rows) {
      if (typeof row.id !== "string" || !row.id) {
        skippedCount += 1;
        continue;
      }

      if (await hasQueueHistory(tableName, row.id)) {
        continue;
      }

      const scopeId = await getScopeId(tableName, row);
      if (!scopeId) {
        skippedCount += 1;
        console.warn(
          `Legacy sync backfill skipped ${tableName}/${row.id}: unable to resolve sync scope.`
        );
        continue;
      }

      await enqueueSyncChange({
        organizationId: scopeId,
        tableName,
        recordId: row.id,
        operation: "create",
        payload: row,
      });
      enqueuedCount += 1;
    }
  }

  await markBackfillComplete();
  console.info(
    `Legacy sync backfill complete. Enqueued ${enqueuedCount} local rows; skipped ${skippedCount}.`
  );
};
