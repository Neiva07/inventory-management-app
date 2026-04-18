import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { syncEvents } from "../db/schema";
import { TABLE_REGISTRY, isKnownTable, getScopeForTable } from "./tableRegistry";
import { requireOrgMembership } from "../auth";

interface PushChange {
  syncQueueId: string;
  organizationId: string;
  tableName: string;
  recordId: string;
  operation: "create" | "update" | "delete";
  payload: Record<string, unknown>;
  clientTimestamp: number;
}

interface PushRejection {
  syncQueueId: string;
  reason: string;
}

interface PushResult {
  accepted: string[];
  rejected: PushRejection[];
  serverTimestamp: number;
}

/** Processes a batch of push changes with last-write-wins conflict resolution. */
export async function processPushChanges(
  userId: string,
  clientId: string,
  changes: PushChange[],
): Promise<PushResult> {
  const accepted: string[] = [];
  const rejected: PushRejection[] = [];
  const serverNow = Date.now();

  // Pre-validate org memberships (deduplicated)
  const orgIds = [...new Set(changes.map((c) => c.organizationId))];
  const orgAccessMap = new Map<string, boolean>();

  for (const orgId of orgIds) {
    try {
      await requireOrgMembership(userId, orgId);
      orgAccessMap.set(orgId, true);
    } catch {
      orgAccessMap.set(orgId, false);
    }
  }

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    // Offset ensures batch ordering is preserved in updatedAt
    const serverTimestamp = serverNow + i;

    // Validate table
    if (!isKnownTable(change.tableName)) {
      rejected.push({ syncQueueId: change.syncQueueId, reason: "invalid_table" });
      continue;
    }

    // Validate org access
    if (!orgAccessMap.get(change.organizationId)) {
      rejected.push({ syncQueueId: change.syncQueueId, reason: "unauthorized" });
      continue;
    }

    try {
      const applied = await applySingleChange(change, serverTimestamp);
      if (applied) {
        // Append to event log
        const scope = getScopeForTable(change.tableName);
        await db.insert(syncEvents).values({
          id: `evt_${serverTimestamp}_${Math.random().toString(36).slice(2, 8)}`,
          tableName: change.tableName,
          recordId: change.recordId,
          operation: change.operation,
          scopeType: scope === "user" ? "user" : "organization",
          scopeId: scope === "user" ? userId : change.organizationId,
          payloadJson: change.operation === "delete" ? null : JSON.stringify(change.payload),
          clientId,
          userId,
          createdAt: serverTimestamp,
          updatedAt: serverTimestamp,
        });

        accepted.push(change.syncQueueId);
      } else {
        rejected.push({ syncQueueId: change.syncQueueId, reason: "conflict" });
      }
    } catch (error) {
      console.error(`Push failed for ${change.tableName}/${change.recordId}:`, error);
      rejected.push({
        syncQueueId: change.syncQueueId,
        reason: error instanceof Error ? error.message : "internal_error",
      });
    }
  }

  return { accepted, rejected, serverTimestamp: serverNow };
}

/**
 * Applies a single change to the data table with last-write-wins.
 * Returns true if applied, false if rejected due to conflict.
 */
async function applySingleChange(
  change: PushChange,
  serverTimestamp: number,
): Promise<boolean> {
  const entry = TABLE_REGISTRY[change.tableName];
  if (!entry) return false;

  const { table } = entry;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await db.select().from(table).where(eq(table.id, change.recordId)).limit(1) as any[];

  switch (change.operation) {
    case "create": {
      if (existing.length > 0) {
        // Row already exists — treat as update, check conflict
        if (existing[0].updatedAt > change.clientTimestamp) {
          return false; // cloud is newer
        }
        const updateData = { ...change.payload, updatedAt: serverTimestamp };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.update(table).set(updateData as any).where(eq(table.id, change.recordId));
      } else {
        const insertData = { ...change.payload, createdAt: serverTimestamp, updatedAt: serverTimestamp };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.insert(table).values(insertData as any);
      }
      return true;
    }

    case "update": {
      if (existing.length === 0) {
        // Row doesn't exist — treat as create (offline create+update sequence)
        const insertData = { ...change.payload, createdAt: serverTimestamp, updatedAt: serverTimestamp };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.insert(table).values(insertData as any);
        return true;
      }
      if (existing[0].updatedAt > change.clientTimestamp) {
        return false; // cloud is newer
      }
      const updateData = { ...change.payload, updatedAt: serverTimestamp };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.update(table).set(updateData as any).where(eq(table.id, change.recordId));
      return true;
    }

    case "delete": {
      if (existing.length === 0) {
        return true; // already gone
      }
      if (existing[0].updatedAt > change.clientTimestamp) {
        return false; // cloud is newer
      }
      await db.delete(table).where(eq(table.id, change.recordId));
      return true;
    }

    default:
      return false;
  }
}
