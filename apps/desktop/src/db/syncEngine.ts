import {
  getPendingSyncChanges,
  markSyncChangeAsFailed,
  markSyncChangesAsSynced,
  markSyncChangesAsSyncing,
  PendingSyncRecord,
} from "./syncQueue";
import { setSyncState } from "./syncState";

type SyncTransport = (changes: PendingSyncRecord[]) => Promise<void>;

export interface SyncEngineOptions {
  transport: SyncTransport;
  intervalMs?: number;
}

export class SyncEngine {
  private readonly transport: SyncTransport;
  private readonly intervalMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  constructor(options: SyncEngineOptions) {
    this.transport = options.transport;
    this.intervalMs = options.intervalMs ?? 15_000;
  }

  start(): void {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      void this.runOnce();
    }, this.intervalMs);

    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }

    void this.runOnce();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    }
  }

  async runOnce(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setSyncState({ status: "offline" });
      return;
    }

    this.isRunning = true;
    try {
      const pending = await getPendingSyncChanges();

      if (!pending.length) {
        setSyncState({ status: "synced", pendingCount: 0, lastError: null, lastSyncedAt: Date.now() });
        return;
      }

      setSyncState({ status: "syncing", pendingCount: pending.length, lastError: null });
      const ids = pending.map((change) => change.id);
      await markSyncChangesAsSyncing(ids);

      try {
        await this.transport(pending);
        await markSyncChangesAsSynced(ids);
        setSyncState({
          status: "synced",
          pendingCount: 0,
          lastSyncedAt: Date.now(),
          lastError: null,
        });
      } catch (error) {
        await Promise.all(
          pending.map((change) => markSyncChangeAsFailed(change.id, error instanceof Error ? error.message : String(error)))
        );
        setSyncState({
          status: "error",
          pendingCount: pending.length,
          lastError: error instanceof Error ? error.message : String(error),
        });
      }
    } finally {
      this.isRunning = false;
    }
  }

  private readonly handleOnline = () => {
    void this.runOnce();
  };

  private readonly handleOffline = () => {
    setSyncState({ status: "offline" });
  };
}

