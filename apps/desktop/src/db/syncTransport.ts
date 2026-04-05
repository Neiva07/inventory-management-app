import { eq } from "drizzle-orm";
import { createCloudDb } from "./client";
import { syncQueue } from "./schema";
import { PendingSyncRecord } from "./syncQueue";

export const replicatePendingChangesToCloud = async (changes: PendingSyncRecord[]): Promise<void> => {
  const cloudDb = createCloudDb();
  if (!cloudDb) {
    throw new Error("Cloud Turso database is not configured (missing TURSO_DATABASE_URL).");
  }

  for (const change of changes) {
    const existing = await cloudDb.select({ id: syncQueue.id }).from(syncQueue).where(eq(syncQueue.id, change.id)).limit(1);
    const now = Date.now();

    if (existing.length) {
      await cloudDb
        .update(syncQueue)
        .set({
          organizationId: change.organizationId,
          tableName: change.tableName,
          recordId: change.recordId,
          operation: change.operation,
          payloadJson: change.payloadJson,
          status: "pending",
          attempts: change.attempts,
          nextAttemptAt: change.nextAttemptAt,
          updatedAt: now,
        })
        .where(eq(syncQueue.id, change.id));
      continue;
    }

    await cloudDb.insert(syncQueue).values({
      id: change.id,
      organizationId: change.organizationId,
      tableName: change.tableName,
      recordId: change.recordId,
      operation: change.operation,
      payloadJson: change.payloadJson,
      status: "pending",
      attempts: change.attempts,
      nextAttemptAt: change.nextAttemptAt,
      createdAt: now,
      updatedAt: now,
    });
  }
};
