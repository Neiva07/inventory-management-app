import { getSyncApiClient, SyncPushChange } from "./syncApiClient";
import { getOrCreateClientId } from "./syncMeta";
import { markSyncChangeAsFailed, PendingSyncRecord } from "./syncQueue";

export interface SyncTransportResult {
  acceptedIds: string[];
  rejectedIds: string[];
}

export const replicatePendingChangesToCloud = async (changes: PendingSyncRecord[]): Promise<SyncTransportResult> => {
  const apiClient = getSyncApiClient();

  if (!apiClient) {
    // No API client configured — mark nothing as accepted so the queue retains items.
    return { acceptedIds: [], rejectedIds: changes.map((c) => c.id) };
  }

  const clientId = await getOrCreateClientId();

  const pushChanges: SyncPushChange[] = changes.map((change) => ({
    syncQueueId: change.id,
    organizationId: change.organizationId,
    tableName: change.tableName,
    recordId: change.recordId,
    operation: change.operation,
    payload: JSON.parse(change.payloadJson) as Record<string, unknown>,
    clientTimestamp: Date.now(),
  }));

  const response = await apiClient.pushChanges({ clientId, changes: pushChanges });

  // Mark individually rejected items as failed with reason
  for (const rejection of response.rejected) {
    await markSyncChangeAsFailed(rejection.syncQueueId, rejection.reason);
  }

  return {
    acceptedIds: response.accepted,
    rejectedIds: response.rejected.map((r) => r.syncQueueId),
  };
};
