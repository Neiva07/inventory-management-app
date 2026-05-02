import { SyncEngine } from "./syncEngine";
import { replicatePendingChangesToCloud } from "./syncTransport";
import { initSyncApiClient, clearSyncApiClient, SyncApiClient, getSyncApiClient } from "./syncApiClient";
import { performInitialSync } from "./syncDown";
import {
  getOrCreateClientId,
  getSeenResetGeneration,
  hasLocalSyncData,
  isInitialSyncComplete,
  setSeenResetGeneration,
} from "./syncMeta";

let runtimeEngine: SyncEngine | null = null;

export const resetLocalDeviceForServerReset = async (): Promise<void> => {
  await window.electron.resetLocalDeviceData();
};

export const ensureServerResetGenerationCurrent = async (apiClient: SyncApiClient): Promise<boolean> => {
  const serverState = await apiClient.getResetGeneration();
  const seenGeneration = await getSeenResetGeneration();

  if (serverState.resetInProgress) {
    return false;
  }

  if (seenGeneration === null) {
    if (await hasLocalSyncData()) {
      await resetLocalDeviceForServerReset();
      return false;
    }

    await setSeenResetGeneration(serverState.resetGeneration);
    return true;
  }

  if (serverState.resetGeneration > seenGeneration) {
    await resetLocalDeviceForServerReset();
    return false;
  }

  return true;
};

const ensureActiveServerResetGenerationCurrent = async (): Promise<boolean> => {
  const apiClient = getSyncApiClient();
  if (!apiClient) {
    return true;
  }

  return ensureServerResetGenerationCurrent(apiClient);
};

export const checkServerResetOnStartup = async (): Promise<void> => {
  const baseUrl = window.env?.SYNC_API_URL;
  if (!baseUrl) {
    return;
  }

  try {
    const clientId = await getOrCreateClientId();
    const apiClient = new SyncApiClient({ baseUrl, getSessionToken: () => null, clientId });
    await ensureServerResetGenerationCurrent(apiClient);
  } catch (error) {
    console.warn("Unable to check server reset state on startup:", error);
  }
};

export const startSyncRuntime = (): SyncEngine => {
  if (runtimeEngine) {
    return runtimeEngine;
  }

  runtimeEngine = new SyncEngine({
    transport: replicatePendingChangesToCloud,
    beforeSync: ensureActiveServerResetGenerationCurrent,
    onResetRequired: resetLocalDeviceForServerReset,
  });
  runtimeEngine.start();
  return runtimeEngine;
};

/**
 * Configures the sync scope for the current user session.
 * Initializes the API client, sets the sync scope on the engine,
 * and triggers initial sync for any org/user scope not yet synced.
 */
export const configureSyncScope = async (
  userId: string,
  organizationIds: string[],
  getSessionToken: () => string | null,
): Promise<void> => {
  const baseUrl = window.env?.SYNC_API_URL;
  if (!baseUrl) {
    console.warn("SYNC_API_URL not configured — cloud sync disabled");
    return;
  }

  const clientId = await getOrCreateClientId();
  void window.electron?.setRuntimeLogContext({ syncClientId: clientId });

  const apiClient = initSyncApiClient({ baseUrl, getSessionToken, clientId, userId });

  if (runtimeEngine) {
    runtimeEngine.setScope({ userId, organizationIds });
  }

  if (!(await ensureServerResetGenerationCurrent(apiClient))) {
    return;
  }

  // Run initial sync for any scope that hasn't been fully synced yet
  const unsyncedOrgIds: string[] = [];
  for (const orgId of organizationIds) {
    const complete = await isInitialSyncComplete("organization", orgId);
    if (!complete) {
      unsyncedOrgIds.push(orgId);
    }
  }

  const userSynced = await isInitialSyncComplete("user", userId);

  if (unsyncedOrgIds.length > 0 || !userSynced) {
    await performInitialSync(userId, unsyncedOrgIds);
  }
};

/** Clears the sync scope and API client (e.g. on logout). */
export const clearSyncScope = (): void => {
  if (runtimeEngine) {
    runtimeEngine.clearScope();
  }
  clearSyncApiClient();
};

export const stopSyncRuntime = (): void => {
  if (!runtimeEngine) {
    return;
  }

  runtimeEngine.stop();
  runtimeEngine = null;
};
