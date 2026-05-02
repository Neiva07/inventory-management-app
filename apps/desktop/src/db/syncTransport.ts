import { and, eq, inArray } from "drizzle-orm";
import { createAppDb } from "./client";
import { getSyncApiClient, SyncPushChange } from "./syncApiClient";
import { getOrCreateClientId, getSeenResetGeneration } from "./syncMeta";
import { markSyncChangeAsFailed, PendingSyncRecord } from "./syncQueue";
import { organizations, userMemberships, users } from "./schema";

export interface SyncTransportResult {
  acceptedIds: string[];
  rejectedIds: string[];
}

const getPayloadTimestamp = (
  payload: Record<string, unknown>,
  fallbackTimestamp: number,
): number => {
  return typeof payload.updatedAt === "number" ? payload.updatedAt : fallbackTimestamp;
};

const unique = (values: Array<string | null | undefined>): string[] =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))));

const makeBootstrapQueueId = (...parts: string[]): string =>
  `__bootstrap__${parts.join("__")}`;

const makeRecordKey = (tableName: string, recordId: string): string =>
  `${tableName}:${recordId}`;

const copyStringAlias = (
  payload: Record<string, unknown>,
  from: string,
  to: string,
): void => {
  if (payload[to] !== undefined || typeof payload[from] !== "string") {
    return;
  }
  payload[to] = payload[from];
};

const copyJsonAlias = (
  payload: Record<string, unknown>,
  from: string,
  to: string,
): void => {
  if (payload[to] !== undefined || payload[from] === undefined) {
    return;
  }
  payload[to] = JSON.stringify(payload[from]);
};

const normalizeOutgoingPayload = (
  tableName: string,
  payload: Record<string, unknown>,
): Record<string, unknown> => {
  const normalized = { ...payload };

  copyStringAlias(normalized, "userID", "userId");
  copyStringAlias(normalized, "publicID", "publicId");

  if (tableName === "customers" || tableName === "suppliers") {
    copyJsonAlias(normalized, "address", "addressJson");
  }

  if (tableName === "suppliers") {
    copyStringAlias(normalized, "entityID", "entityId");
    copyStringAlias(normalized, "description", "notes");
  }

  return normalized;
};

const buildBootstrapChanges = async (
  changes: PendingSyncRecord[],
  authenticatedUserId: string | undefined,
  fallbackTimestamp: number,
): Promise<SyncPushChange[]> => {
  if (!authenticatedUserId || changes.length === 0) {
    return [];
  }

  const db = createAppDb();
  const organizationIds = unique(changes.map((change) => change.organizationId));
  const queuedRecordKeys = new Set(
    changes.map((change) => makeRecordKey(change.tableName, change.recordId)),
  );
  const bootstrapChanges: SyncPushChange[] = [];
  const pushBootstrapChange = (change: SyncPushChange) => {
    if (queuedRecordKeys.has(makeRecordKey(change.tableName, change.recordId))) {
      return;
    }
    bootstrapChanges.push(change);
  };

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, authenticatedUserId))
    .limit(1);

  if (userRows.length > 0) {
    const user = userRows[0];
    pushBootstrapChange({
      syncQueueId: makeBootstrapQueueId("users", user.id),
      organizationId: user.id,
      tableName: "users",
      recordId: user.id,
      operation: "create",
      payload: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      clientTimestamp: user.updatedAt ?? fallbackTimestamp,
    });
  }

  if (organizationIds.length > 0) {
    const organizationRows = await db
      .select()
      .from(organizations)
      .where(inArray(organizations.id, organizationIds));

    for (const organization of organizationRows) {
      pushBootstrapChange({
        syncQueueId: makeBootstrapQueueId("organizations", organization.id),
        organizationId: organization.id,
        tableName: "organizations",
        recordId: organization.id,
        operation: "create",
        payload: {
          id: organization.id,
          name: organization.name,
          createdBy: organization.createdBy,
          status: organization.status,
          settingsJson: organization.settingsJson,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
        },
        clientTimestamp: organization.updatedAt ?? fallbackTimestamp,
      });
    }

    const membershipRows = await db
      .select()
      .from(userMemberships)
      .where(
        and(
          eq(userMemberships.userId, authenticatedUserId),
          inArray(userMemberships.organizationId, organizationIds),
        ),
      );

    for (const membership of membershipRows) {
      pushBootstrapChange({
        syncQueueId: makeBootstrapQueueId("user_memberships", membership.id),
        organizationId: membership.organizationId,
        tableName: "user_memberships",
        recordId: membership.id,
        operation: "create",
        payload: {
          id: membership.id,
          userId: membership.userId,
          organizationId: membership.organizationId,
          role: membership.role,
          status: membership.status,
          createdAt: membership.createdAt,
          updatedAt: membership.updatedAt,
        },
        clientTimestamp: membership.updatedAt ?? fallbackTimestamp,
      });
    }
  }

  return bootstrapChanges;
};

export const replicatePendingChangesToCloud = async (changes: PendingSyncRecord[]): Promise<SyncTransportResult> => {
  const apiClient = getSyncApiClient();

  if (!apiClient) {
    // No API client configured — mark nothing as accepted so the queue retains items.
    return { acceptedIds: [], rejectedIds: changes.map((c) => c.id) };
  }

  const clientId = await getOrCreateClientId();
  const originalIds = new Set(changes.map((change) => change.id));
  const requestTimestamp = Date.now();

  const pushChanges: SyncPushChange[] = changes.map((change) => {
    const payload = normalizeOutgoingPayload(
      change.tableName,
      JSON.parse(change.payloadJson) as Record<string, unknown>,
    );

    return {
      syncQueueId: change.id,
      organizationId: change.organizationId,
      tableName: change.tableName,
      recordId: change.recordId,
      operation: change.operation,
      payload,
      clientTimestamp: getPayloadTimestamp(payload, requestTimestamp),
    };
  });

  const bootstrapChanges = await buildBootstrapChanges(
    changes,
    apiClient.getUserId(),
    requestTimestamp,
  );

  const response = await apiClient.pushChanges({
    clientId,
    clientResetGeneration: await getSeenResetGeneration() ?? 0,
    changes: [...bootstrapChanges, ...pushChanges],
  });

  // Mark individually rejected items as failed with reason
  for (const rejection of response.rejected) {
    if (originalIds.has(rejection.syncQueueId)) {
      await markSyncChangeAsFailed(rejection.syncQueueId, rejection.reason);
    }
  }

  return {
    acceptedIds: response.accepted.filter((id) => originalIds.has(id)),
    rejectedIds: response.rejected
      .map((r) => r.syncQueueId)
      .filter((id) => originalIds.has(id)),
  };
};
