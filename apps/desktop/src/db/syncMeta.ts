import { eq } from "drizzle-orm";
import { createAppDb } from "./client";
import { syncMeta } from "./schema";

type SyncScopeType = "organization" | "user";

const buildKey = (prefix: string, scopeType: SyncScopeType, scopeId: string): string =>
  `${prefix}:${scopeType}:${scopeId}`;

/** Returns the last-sync watermark (unix ms) for the given scope, or 0 if none. */
export const getSyncWatermark = async (scopeType: SyncScopeType, scopeId: string): Promise<number> => {
  const db = createAppDb();
  const key = buildKey("watermark", scopeType, scopeId);
  const rows = await db.select().from(syncMeta).where(eq(syncMeta.id, key)).limit(1);
  if (!rows.length) return 0;
  return parseInt(rows[0].value, 10) || 0;
};

/** Upserts the last-sync watermark for the given scope. */
export const setSyncWatermark = async (
  scopeType: SyncScopeType,
  scopeId: string,
  timestamp: number,
): Promise<void> => {
  const db = createAppDb();
  const key = buildKey("watermark", scopeType, scopeId);
  const now = Date.now();

  await db
    .insert(syncMeta)
    .values({ id: key, key: "lastSyncTimestamp", value: String(timestamp), createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: syncMeta.id, set: { value: String(timestamp), updatedAt: now } });
};

/** Returns true if the initial full sync has been completed for the given scope. */
export const isInitialSyncComplete = async (scopeType: SyncScopeType, scopeId: string): Promise<boolean> => {
  const db = createAppDb();
  const key = buildKey("initial_sync", scopeType, scopeId);
  const rows = await db.select().from(syncMeta).where(eq(syncMeta.id, key)).limit(1);
  return rows.length > 0 && rows[0].value === "true";
};

/** Marks the initial full sync as complete for the given scope. */
export const markInitialSyncComplete = async (scopeType: SyncScopeType, scopeId: string): Promise<void> => {
  const db = createAppDb();
  const key = buildKey("initial_sync", scopeType, scopeId);
  const now = Date.now();

  await db
    .insert(syncMeta)
    .values({ id: key, key: "initialSyncComplete", value: "true", createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: syncMeta.id, set: { value: "true", updatedAt: now } });
};

/** Removes all sync metadata for a given scope (e.g. on org leave or user logout). */
export const clearSyncMetaForScope = async (scopeType: SyncScopeType, scopeId: string): Promise<void> => {
  const db = createAppDb();
  const watermarkKey = buildKey("watermark", scopeType, scopeId);
  const initialSyncKey = buildKey("initial_sync", scopeType, scopeId);

  await db.delete(syncMeta).where(eq(syncMeta.id, watermarkKey));
  await db.delete(syncMeta).where(eq(syncMeta.id, initialSyncKey));
};

/** Returns the stored client ID for this device, or null if not set. */
export const getClientId = async (): Promise<string | null> => {
  const db = createAppDb();
  const rows = await db.select().from(syncMeta).where(eq(syncMeta.id, "client_id")).limit(1);
  return rows.length > 0 ? rows[0].value : null;
};

/** Returns the persisted device client ID, creating one if none exists. */
export const getOrCreateClientId = async (): Promise<string> => {
  const existing = await getClientId();
  if (existing) return existing;

  const newId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await setClientId(newId);
  return newId;
};

/** Stores a client ID for this device. */
export const setClientId = async (clientId: string): Promise<void> => {
  const db = createAppDb();
  const now = Date.now();

  await db
    .insert(syncMeta)
    .values({ id: "client_id", key: "clientId", value: clientId, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: syncMeta.id, set: { value: clientId, updatedAt: now } });
};
