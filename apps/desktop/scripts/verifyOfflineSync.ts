import "dotenv/config";
import { eq } from "drizzle-orm";
import { bootstrapDatabase } from "../src/db/bootstrap";
import { createAppDb } from "../src/db/client";
import { syncQueue } from "../src/db/schema";
import { SyncEngine } from "../src/db/syncEngine";
import { getSyncState, resetSyncState } from "../src/db/syncState";
import { trackPendingSyncChange } from "../src/db/syncTracking";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

async function main(): Promise<void> {
  await bootstrapDatabase();
  const db = createAppDb();

  await db.delete(syncQueue);
  resetSyncState();

  const runId = Date.now().toString();
  const recordId = `offline-sync-${runId}`;
  const organizationId = `offline-org-${runId}`;

  await trackPendingSyncChange({
    organizationId,
    tableName: "orders",
    recordId,
    operation: "create",
    payload: {
      id: recordId,
      sample: true,
    },
  });

  const queuedRows = await db.select().from(syncQueue).where(eq(syncQueue.recordId, recordId)).limit(1);
  assert(queuedRows.length === 1, "Pending write was not queued.");
  assert(queuedRows[0].status === "pending", `Expected queued status=pending, got ${queuedRows[0].status}.`);
  assert(getSyncState().status === "pending", "Sync state should be pending after enqueue.");

  let transportAttempts = 0;
  const engine = new SyncEngine({
    transport: async () => {
      transportAttempts += 1;
      if (transportAttempts === 1) {
        throw new Error("Simulated transient network failure");
      }
    },
  });

  await engine.runOnce();
  const failedRows = await db.select().from(syncQueue).where(eq(syncQueue.recordId, recordId)).limit(1);
  assert(failedRows.length === 1, "Queued row disappeared after failed sync.");
  assert(failedRows[0].status === "failed", `Expected status=failed after first run, got ${failedRows[0].status}.`);
  assert(getSyncState().status === "error", "Sync state should be error after failed transport.");

  // Simulate backoff window passing / connectivity restored.
  await db
    .update(syncQueue)
    .set({ nextAttemptAt: Date.now() - 1, updatedAt: Date.now() })
    .where(eq(syncQueue.recordId, recordId));

  await engine.runOnce();
  const syncedRows = await db.select().from(syncQueue).where(eq(syncQueue.recordId, recordId)).limit(1);
  assert(syncedRows.length === 1, "Queued row disappeared after successful retry.");
  assert(syncedRows[0].status === "synced", `Expected status=synced after retry, got ${syncedRows[0].status}.`);
  assert(getSyncState().status === "synced", "Sync state should be synced after successful retry.");

  console.log("✅ Offline sync and retry verification passed.");
}

main().catch((error) => {
  console.error("❌ Offline sync verification failed:", error);
  process.exit(1);
});
