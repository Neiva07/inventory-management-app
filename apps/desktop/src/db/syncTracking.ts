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

export const trackPendingSyncChange = async ({
  organizationId,
  tableName,
  recordId,
  operation,
  payload,
}: TrackPendingSyncChangeArgs): Promise<void> => {
  if (!organizationId) {
    return;
  }

  // Don't re-enqueue changes being applied from sync-down
  if (getIsSyncingDown()) {
    return;
  }

  try {
    await enqueueSyncChange({
      organizationId,
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
