import { enqueueSyncChange, SyncOperation } from "./syncQueue";
import { getSyncState, setSyncState } from "./syncState";
import { getIsSyncingDown } from "./syncDown";

interface TrackPendingSyncChangeArgs {
  organizationId?: string | null;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  payload: unknown;
}

interface TrackUserScopedSyncChangeArgs {
  userId?: string | null;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  payload: unknown;
}

const enqueueTrackedChange = async ({
  scopeId,
  tableName,
  recordId,
  operation,
  payload,
}: {
  scopeId?: string | null;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  payload: unknown;
}): Promise<void> => {
  if (!scopeId) {
    return;
  }

  // Don't re-enqueue changes being applied from sync-down
  if (getIsSyncingDown()) {
    return;
  }

  try {
    await enqueueSyncChange({
      organizationId: scopeId,
      tableName,
      recordId,
      operation,
      payload,
    });

    const current = getSyncState();
    setSyncState({
      status: "pending",
      pendingCount: Math.max(1, current.pendingCount + 1),
      lastError: null,
    });
  } catch (error) {
    setSyncState({
      status: "error",
      lastError: error instanceof Error ? error.message : String(error),
    });
    console.error("Failed to enqueue sync change:", error);
  }
};

export const trackPendingSyncChange = async ({
  organizationId,
  tableName,
  recordId,
  operation,
  payload,
}: TrackPendingSyncChangeArgs): Promise<void> =>
  enqueueTrackedChange({
    scopeId: organizationId,
    tableName,
    recordId,
    operation,
    payload,
  });

// `sync_queue.organization_id` stores the effective sync scope id.
// For user-scoped tables, that is the user id.
export const trackUserScopedSyncChange = async ({
  userId,
  tableName,
  recordId,
  operation,
  payload,
}: TrackUserScopedSyncChangeArgs): Promise<void> =>
  enqueueTrackedChange({
    scopeId: userId,
    tableName,
    recordId,
    operation,
    payload,
  });
