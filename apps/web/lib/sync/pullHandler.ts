import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "../db/client";
import { syncEvents } from "../db/schema";
import { requireOrgMembership } from "../auth";
import { ApiError } from "../errors";

interface PullScope {
  type: "organization" | "user";
  id: string;
  lastSyncTimestamp: number;
}

interface PullChange {
  tableName: string;
  recordId: string;
  operation: "upsert" | "delete";
  data: Record<string, unknown> | null;
  serverTimestamp: number;
}

interface PullScopeResult {
  type: "organization" | "user";
  id: string;
  changes: PullChange[];
  newWatermark: number;
  hasMore: boolean;
}

interface PullResult {
  scopes: PullScopeResult[];
  serverTimestamp: number;
}

const MAX_LIMIT = 1000;
const DEFAULT_LIMIT = 500;

/** Processes a pull request, returning delta changes from the event log. */
export async function processPullRequest(
  userId: string,
  scopes: PullScope[],
  requestLimit?: number,
): Promise<PullResult> {
  const limit = Math.min(requestLimit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const results: PullScopeResult[] = [];

  for (const scope of scopes) {
    // Verify access
    if (scope.type === "user" && scope.id !== userId) {
      throw new ApiError(403, "Cannot pull data for a different user");
    }
    if (scope.type === "organization") {
      await requireOrgMembership(userId, scope.id);
    }

    // Query event log
    const events = await db
      .select()
      .from(syncEvents)
      .where(
        and(
          eq(syncEvents.scopeType, scope.type),
          eq(syncEvents.scopeId, scope.id),
          gt(syncEvents.createdAt, scope.lastSyncTimestamp),
        ),
      )
      .orderBy(asc(syncEvents.createdAt))
      .limit(limit + 1); // fetch one extra to check hasMore

    const hasMore = events.length > limit;
    const pageEvents = hasMore ? events.slice(0, limit) : events;

    const changes: PullChange[] = pageEvents.map((event) => ({
      tableName: event.tableName,
      recordId: event.recordId,
      operation: event.operation === "delete" ? "delete" as const : "upsert" as const,
      data: event.payloadJson ? JSON.parse(event.payloadJson) as Record<string, unknown> : null,
      serverTimestamp: event.createdAt,
    }));

    const newWatermark = pageEvents.length > 0
      ? pageEvents[pageEvents.length - 1].createdAt
      : scope.lastSyncTimestamp;

    results.push({
      type: scope.type,
      id: scope.id,
      changes,
      newWatermark,
      hasMore,
    });
  }

  return { scopes: results, serverTimestamp: Date.now() };
}
