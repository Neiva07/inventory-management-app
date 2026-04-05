import { and, asc, eq, inArray, lte } from "drizzle-orm";
import { createAppDb } from "./client";
import { syncQueue } from "./schema";

export type SyncOperation = "create" | "update" | "delete";

export interface PendingSyncRecord {
  id: string;
  organizationId: string;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  payloadJson: string;
  status: "pending" | "syncing" | "failed" | "synced";
  attempts: number;
  nextAttemptAt: number | null;
}

const now = () => Date.now();

const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;

export const enqueueSyncChange = async (args: {
  organizationId: string;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  payload: unknown;
}): Promise<string> => {
  const db = createAppDb();
  const id = makeId();
  const timestamp = now();

  await db.insert(syncQueue).values({
    id,
    organizationId: args.organizationId,
    tableName: args.tableName,
    recordId: args.recordId,
    operation: args.operation,
    payloadJson: JSON.stringify(args.payload),
    status: "pending",
    attempts: 0,
    nextAttemptAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return id;
};

export const getPendingSyncChanges = async (limit = 100): Promise<PendingSyncRecord[]> => {
  const db = createAppDb();
  const timestamp = now();

  const rows = await db
    .select()
    .from(syncQueue)
    .where(
      and(
        inArray(syncQueue.status, ["pending", "failed"]),
        lte(syncQueue.nextAttemptAt, timestamp)
      )
    )
    .orderBy(asc(syncQueue.createdAt))
    .limit(limit);

  return rows as PendingSyncRecord[];
};

export const markSyncChangesAsSyncing = async (ids: string[]): Promise<void> => {
  if (!ids.length) {
    return;
  }

  const db = createAppDb();
  await db
    .update(syncQueue)
    .set({
      status: "syncing",
      updatedAt: now(),
    })
    .where(inArray(syncQueue.id, ids));
};

export const markSyncChangesAsSynced = async (ids: string[]): Promise<void> => {
  if (!ids.length) {
    return;
  }

  const db = createAppDb();
  await db
    .update(syncQueue)
    .set({
      status: "synced",
      updatedAt: now(),
      nextAttemptAt: null,
      lastError: null,
    })
    .where(inArray(syncQueue.id, ids));
};

export const markSyncChangeAsFailed = async (id: string, errorMessage: string): Promise<void> => {
  const db = createAppDb();
  const current = await db.select().from(syncQueue).where(eq(syncQueue.id, id)).limit(1);
  if (!current.length) {
    return;
  }

  const currentAttempts = current[0].attempts ?? 0;
  const attempts = currentAttempts + 1;
  const retryDelayMs = Math.min(5 * 60 * 1000, 2 ** attempts * 1000);

  await db
    .update(syncQueue)
    .set({
      status: "failed",
      attempts,
      lastError: errorMessage.slice(0, 2000),
      nextAttemptAt: now() + retryDelayMs,
      updatedAt: now(),
    })
    .where(eq(syncQueue.id, id));
};

