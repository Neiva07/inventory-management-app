export type SyncStatus = "synced" | "pending" | "syncing" | "error" | "offline";

export interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncedAt: number | null;
  lastError: string | null;
}

type SyncStateListener = (state: SyncState) => void;

const initialState: SyncState = {
  status: "synced",
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
};

let state: SyncState = { ...initialState };
const listeners = new Set<SyncStateListener>();

export const getSyncState = (): SyncState => state;

export const setSyncState = (next: Partial<SyncState>): SyncState => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener(state));
  return state;
};

export const resetSyncState = (): SyncState => {
  state = { ...initialState };
  listeners.forEach((listener) => listener(state));
  return state;
};

export const subscribeSyncState = (listener: SyncStateListener): (() => void) => {
  listeners.add(listener);
  listener(state);
  return () => {
    listeners.delete(listener);
  };
};

