import { eq } from "drizzle-orm";
import { createAppDb } from "./client";
import { getSyncApiClient, SyncPullChange, SyncPullResponse, SyncPullScope } from "./syncApiClient";
import { getSyncWatermark, setSyncWatermark, markInitialSyncComplete, getSeenResetGeneration } from "./syncMeta";
import { getSyncCatalogEntry } from "./syncTableMap";

// ---------------------------------------------------------------------------
// Sync-loop prevention flag
// ---------------------------------------------------------------------------

let syncingDown = false;

/** Returns true while sync-down is writing to the local DB. */
export const getIsSyncingDown = (): boolean => syncingDown;

// ---------------------------------------------------------------------------
// Core pull + apply
// ---------------------------------------------------------------------------

/**
 * Pulls delta changes from the cloud for the given scopes and applies
 * them to the local database. Handles pagination automatically.
 */
export const pullAndApplyDelta = async (
  scopes: Array<{ type: "organization" | "user"; id: string }>,
): Promise<void> => {
  const apiClient = getSyncApiClient();
  if (!apiClient) return;

  // Build initial pull request with current watermarks
  const pullScopes: SyncPullScope[] = await Promise.all(
    scopes.map(async (scope) => ({
      type: scope.type,
      id: scope.id,
      lastSyncTimestamp: await getSyncWatermark(scope.type, scope.id),
    })),
  );

  let hasMoreAnyScope = true;

  while (hasMoreAnyScope) {
    const response = await apiClient.pullChanges({
      clientResetGeneration: await getSeenResetGeneration() ?? 0,
      scopes: pullScopes,
    });

    if (response.scopes.some((s) => s.changes.length > 0)) {
      syncingDown = true;
      try {
        await applyRemoteChanges(response);
      } finally {
        syncingDown = false;
      }
    }

    // Update watermarks and check for pagination
    hasMoreAnyScope = false;
    for (const scopeResult of response.scopes) {
      if (scopeResult.changes.length > 0) {
        await setSyncWatermark(scopeResult.type, scopeResult.id, scopeResult.newWatermark);
      }

      if (scopeResult.hasMore) {
        hasMoreAnyScope = true;
        // Advance the watermark for the next page
        const matching = pullScopes.find(
          (s) => s.type === scopeResult.type && s.id === scopeResult.id,
        );
        if (matching) {
          matching.lastSyncTimestamp = scopeResult.newWatermark;
        }
      }
    }
  }
};

/**
 * Performs a full initial sync for a user and/or a set of organizations.
 * Uses watermark 0 (pull everything), then marks each scope as complete.
 */
export const performInitialSync = async (
  userId: string,
  organizationIds: string[],
): Promise<void> => {
  const scopes: Array<{ type: "organization" | "user"; id: string }> = [];

  // Always include user scope
  scopes.push({ type: "user", id: userId });

  for (const orgId of organizationIds) {
    scopes.push({ type: "organization", id: orgId });
  }

  await pullAndApplyDelta(scopes);

  // Mark each scope as initially synced
  await markInitialSyncComplete("user", userId);
  for (const orgId of organizationIds) {
    await markInitialSyncComplete("organization", orgId);
  }
};

// ---------------------------------------------------------------------------
// Apply remote changes to local DB
// ---------------------------------------------------------------------------

const applyRemoteChanges = async (response: SyncPullResponse): Promise<void> => {
  const db = createAppDb();

  for (const scopeResult of response.scopes) {
    for (const change of scopeResult.changes) {
      await applySingleChange(db, change);
    }
  }
};

const applySingleChange = async (
  db: ReturnType<typeof createAppDb>,
  change: SyncPullChange,
): Promise<void> => {
  const entry = getSyncCatalogEntry(change.tableName);
  if (!entry) {
    console.warn(`Sync-down: unknown table "${change.tableName}", skipping`);
    return;
  }

  const { table } = entry;

  if (change.operation === "delete") {
    await db.delete(table).where(eq(table.id, change.recordId));
    return;
  }

  // Upsert: insert or update on conflict
  if (!change.data) {
    console.warn(`Sync-down: upsert for "${change.tableName}/${change.recordId}" has null data, skipping`);
    return;
  }

  // Server payload is dynamic JSON — cast required at this external API boundary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = change.data as any;
  await db
    .insert(table)
    .values(values)
    .onConflictDoUpdate({ target: table.id, set: values });
};
