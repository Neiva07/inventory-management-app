import {
  getPendingSyncChanges,
  markSyncChangeAsFailed,
  markSyncChangesAsSynced,
  markSyncChangesAsSyncing,
  PendingSyncRecord,
} from "./syncQueue";
import { setSyncState } from "./syncState";
import { pullAndApplyDelta } from "./syncDown";
import { type SyncTransportResult } from "./syncTransport";
import { SyncResetRequiredError } from "./syncApiClient";

type SyncTransport = (changes: PendingSyncRecord[]) => Promise<SyncTransportResult>;

export interface SyncEngineOptions {
  transport: SyncTransport;
  beforeSync?: () => Promise<boolean>;
  onResetRequired?: (resetGeneration: number) => Promise<void>;
  intervalMs?: number;
}

export interface SyncScope {
  userId: string;
  organizationIds: string[];
}

export class SyncEngine {
  private readonly transport: SyncTransport;
  private readonly beforeSync?: () => Promise<boolean>;
  private readonly onResetRequired?: (resetGeneration: number) => Promise<void>;
  private readonly intervalMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private scope: SyncScope | null = null;

  constructor(options: SyncEngineOptions) {
    this.transport = options.transport;
    this.beforeSync = options.beforeSync;
    this.onResetRequired = options.onResetRequired;
    this.intervalMs = options.intervalMs ?? 15_000;
  }

  setScope(scope: SyncScope): void {
    this.scope = scope;
  }

  clearScope(): void {
    this.scope = null;
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

    if (!this.scope) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setSyncState({ status: "offline" });
      return;
    }

    this.isRunning = true;
    try {
      if (this.beforeSync && !(await this.beforeSync())) {
        return;
      }
      await this.syncUp();
      await this.syncDown();
    } finally {
      this.isRunning = false;
    }
  }

  private async handleResetRequired(error: unknown): Promise<boolean> {
    if (!(error instanceof SyncResetRequiredError)) {
      return false;
    }

    if (this.onResetRequired) {
      await this.onResetRequired(error.resetGeneration);
    }

    return true;
  }

  private async syncUp(): Promise<void> {
    const pending = await getPendingSyncChanges();

    if (!pending.length) {
      setSyncState({ status: "synced", pendingCount: 0, lastError: null, lastSyncedAt: Date.now() });
      return;
    }

    setSyncState({ status: "syncing", pendingCount: pending.length, lastError: null });
    const ids = pending.map((change) => change.id);
    await markSyncChangesAsSyncing(ids);

    try {
      const result = await this.transport(pending);

      if (result.acceptedIds.length > 0) {
        await markSyncChangesAsSynced(result.acceptedIds);
      }

      // Rejected items are already marked as failed by the transport,
      // but update the UI state accordingly.
      if (result.rejectedIds.length > 0 && result.acceptedIds.length === 0) {
        setSyncState({
          status: "error",
          pendingCount: result.rejectedIds.length,
          lastError: "All changes were rejected by the server",
        });
      } else {
        setSyncState({
          status: "synced",
          pendingCount: result.rejectedIds.length,
          lastSyncedAt: Date.now(),
          lastError: null,
        });
      }
    } catch (error) {
      if (await this.handleResetRequired(error)) {
        return;
      }

      await Promise.all(
        pending.map((change) =>
          markSyncChangeAsFailed(change.id, error instanceof Error ? error.message : String(error)),
        ),
      );
      setSyncState({
        status: "error",
        pendingCount: pending.length,
        lastError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async syncDown(): Promise<void> {
    if (!this.scope) {
      return;
    }

    const scopes = [
      { type: "user" as const, id: this.scope.userId },
      ...this.scope.organizationIds.map((id) => ({ type: "organization" as const, id })),
    ];

    try {
      await pullAndApplyDelta(scopes);
    } catch (error) {
      if (await this.handleResetRequired(error)) {
        return;
      }

      // Sync-down failures are logged but don't override the primary sync status.
      // The sync-up status is what the user cares about for data safety.
      console.error("Sync-down failed:", error);
    }
  }

  private readonly handleOnline = () => {
    void this.runOnce();
  };

  private readonly handleOffline = () => {
    setSyncState({ status: "offline" });
  };
}
