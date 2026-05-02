import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { organizations, syncEvents } from "../db/schema";
import { getScopeForTable, getTableRegistryEntry, isKnownTable } from "./tableRegistry";
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

interface PushOptions {
  skipOrgAccessValidation?: boolean;
}

/** Processes a batch of push changes with last-write-wins conflict resolution. */
export async function processPushChanges(
  userId: string,
  clientId: string,
  changes: PushChange[],
  options: PushOptions = {},
): Promise<PushResult> {
  const accepted: string[] = [];
  const rejected: PushRejection[] = [];
  const serverNow = Date.now();

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
    if (!(await canApplyChange(userId, change, options))) {
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

const getPayloadString = (payload: Record<string, unknown>, key: string): string | null => {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : null;
};

const hasOrgMembership = async (userId: string, organizationId: string): Promise<boolean> => {
  try {
    await requireOrgMembership(userId, organizationId);
    return true;
  } catch {
    return false;
  }
};

const getOrganizationCreatedBy = async (
  organizationId: string,
): Promise<string | null> => {
  const rows = await db
    .select({ createdBy: organizations.createdBy })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  return rows[0]?.createdBy ?? null;
};

const isOrganizationCreatedByUser = async (
  organizationId: string,
  userId: string,
): Promise<boolean> => {
  return (await getOrganizationCreatedBy(organizationId)) === userId;
};

const canApplyUserScopedChange = (userId: string, change: PushChange): boolean => {
  if (change.tableName === "users") {
    const payloadId = getPayloadString(change.payload, "id");
    return change.recordId === userId && (!payloadId || payloadId === userId);
  }

  const payloadUserId = getPayloadString(change.payload, "userId");
  return payloadUserId === userId;
};

const canApplyOrganizationChange = async (
  userId: string,
  change: PushChange,
): Promise<boolean> => {
  if (await hasOrgMembership(userId, change.organizationId)) {
    return true;
  }

  const payloadCreatedBy = getPayloadString(change.payload, "createdBy");
  if (
    change.recordId !== change.organizationId ||
    payloadCreatedBy !== userId
  ) {
    return false;
  }

  const existingCreatedBy = await getOrganizationCreatedBy(change.organizationId);
  if (existingCreatedBy) {
    return existingCreatedBy === userId;
  }

  return change.operation === "create";
};

const canApplyMembershipChange = async (
  userId: string,
  change: PushChange,
): Promise<boolean> => {
  if (await hasOrgMembership(userId, change.organizationId)) {
    return true;
  }

  const payloadUserId = getPayloadString(change.payload, "userId");
  const payloadOrganizationId = getPayloadString(change.payload, "organizationId");
  return (
    payloadUserId === userId &&
    payloadOrganizationId === change.organizationId &&
    await isOrganizationCreatedByUser(change.organizationId, userId)
  );
};

const canApplyChange = async (
  userId: string,
  change: PushChange,
  options: PushOptions,
): Promise<boolean> => {
  const scope = getScopeForTable(change.tableName);

  if (scope === "user") {
    return canApplyUserScopedChange(userId, change);
  }

  if (options.skipOrgAccessValidation) {
    return true;
  }

  if (change.tableName === "organizations") {
    return canApplyOrganizationChange(userId, change);
  }

  if (change.tableName === "user_memberships") {
    return canApplyMembershipChange(userId, change);
  }

  return hasOrgMembership(userId, change.organizationId);
};

/**
 * Applies a single change to the data table with last-write-wins.
 * Returns true if applied, false if rejected due to conflict.
 */
async function applySingleChange(
  change: PushChange,
  serverTimestamp: number,
): Promise<boolean> {
  const entry = getTableRegistryEntry(change.tableName);
  if (!entry) return false;

  const { table } = entry;

  const existing = await db.select().from(table).where(eq(table.id, change.recordId)).limit(1) as any[];

  switch (change.operation) {
    case "create": {
      if (existing.length > 0) {
        // Row already exists — treat as update, check conflict
        if (existing[0].updatedAt > change.clientTimestamp) {
          return false; // cloud is newer
        }
        const updateData = { ...change.payload, updatedAt: serverTimestamp };
        await db.update(table).set(updateData as any).where(eq(table.id, change.recordId));
      } else {
        const insertData = { id: change.recordId, ...change.payload, createdAt: serverTimestamp, updatedAt: serverTimestamp };
        await db.insert(table).values(insertData as any);
      }
      return true;
    }

    case "update": {
      if (existing.length === 0) {
        // Row doesn't exist — treat as create (offline create+update sequence)
        const insertData = { id: change.recordId, ...change.payload, createdAt: serverTimestamp, updatedAt: serverTimestamp };
        await db.insert(table).values(insertData as any);
        return true;
      }
      if (existing[0].updatedAt > change.clientTimestamp) {
        return false; // cloud is newer
      }
      const updateData = { ...change.payload, updatedAt: serverTimestamp };
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
