import type { ResultSet } from "@libsql/client";
import {
  buildRuntimeLogSearchText,
  type LaunchSummary,
  type RuntimeLogEvent,
  type RuntimeLogLevel,
  type RuntimeLogQueryRequest,
  type RuntimeLogQueryResponse,
  type RuntimeLogRuntime,
} from "@stockify/runtime-logging";
import { client } from "@/lib/db/client";
import type { RuntimeLogNetworkMetadata } from "./network";

let schemaPromise: Promise<void> | null = null;

const execute = async (sql: string, args: Array<string | number | null> = []): Promise<ResultSet> => {
  return client.execute({ sql, args });
};

export const ensureRuntimeLogSchema = async (): Promise<void> => {
  if (schemaPromise) {
    return schemaPromise;
  }

  schemaPromise = (async () => {
    await execute(`
      CREATE TABLE IF NOT EXISTS runtime_log_entries (
        id TEXT PRIMARY KEY,
        event_ts INTEGER NOT NULL,
        received_at INTEGER NOT NULL,
        level TEXT NOT NULL,
        runtime TEXT NOT NULL,
        runtime_instance_id TEXT NOT NULL,
        event_code TEXT NOT NULL,
        message TEXT NOT NULL,
        search_text TEXT NOT NULL,
        payload_json TEXT,
        error_json TEXT,
        device_id TEXT NOT NULL,
        launch_id TEXT NOT NULL,
        sync_client_id TEXT,
        app_version TEXT NOT NULL,
        platform TEXT NOT NULL,
        arch TEXT NOT NULL,
        is_packaged INTEGER NOT NULL,
        auth_state TEXT NOT NULL,
        user_id TEXT,
        org_id TEXT,
        membership_role TEXT,
        route TEXT,
        repeat_count INTEGER NOT NULL DEFAULT 1,
        ingest_lane TEXT NOT NULL,
        raw_ip TEXT,
        country_code TEXT,
        region TEXT,
        city TEXT,
        timezone TEXT,
        asn TEXT,
        network_provider TEXT
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS runtime_log_launches (
        launch_id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL,
        first_seen_at INTEGER NOT NULL,
        last_seen_at INTEGER NOT NULL,
        app_version TEXT NOT NULL,
        platform TEXT NOT NULL,
        arch TEXT NOT NULL,
        auth_became_available_at INTEGER,
        final_user_id TEXT,
        final_org_id TEXT,
        started_offline INTEGER,
        ended_offline INTEGER,
        transition_count INTEGER NOT NULL DEFAULT 0,
        offline_duration_ms INTEGER NOT NULL DEFAULT 0,
        online_duration_ms INTEGER NOT NULL DEFAULT 0,
        longest_offline_streak_ms INTEGER NOT NULL DEFAULT 0,
        last_connectivity_change_at INTEGER,
        last_known_connectivity_state TEXT,
        country_code TEXT,
        region TEXT,
        city TEXT,
        timezone TEXT,
        asn TEXT,
        network_provider TEXT,
        raw_ip TEXT
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS runtime_log_meta (
        id TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    const indexes = [
      "CREATE INDEX IF NOT EXISTS runtime_log_entries_time_idx ON runtime_log_entries(event_ts)",
      "CREATE INDEX IF NOT EXISTS runtime_log_entries_launch_idx ON runtime_log_entries(launch_id, event_ts)",
      "CREATE INDEX IF NOT EXISTS runtime_log_entries_device_idx ON runtime_log_entries(device_id, event_ts)",
      "CREATE INDEX IF NOT EXISTS runtime_log_entries_org_idx ON runtime_log_entries(org_id, event_ts)",
      "CREATE INDEX IF NOT EXISTS runtime_log_entries_user_idx ON runtime_log_entries(user_id, event_ts)",
      "CREATE INDEX IF NOT EXISTS runtime_log_entries_level_idx ON runtime_log_entries(level, event_ts)",
      "CREATE INDEX IF NOT EXISTS runtime_log_entries_runtime_idx ON runtime_log_entries(runtime, event_ts)",
      "CREATE INDEX IF NOT EXISTS runtime_log_entries_location_idx ON runtime_log_entries(country_code, region, city)",
      "CREATE INDEX IF NOT EXISTS runtime_log_launches_device_idx ON runtime_log_launches(device_id, last_seen_at)",
      "CREATE INDEX IF NOT EXISTS runtime_log_launches_user_idx ON runtime_log_launches(final_user_id, last_seen_at)",
      "CREATE INDEX IF NOT EXISTS runtime_log_launches_org_idx ON runtime_log_launches(final_org_id, last_seen_at)",
    ];

    for (const indexSql of indexes) {
      await execute(indexSql);
    }

    await execute(`
      CREATE VIRTUAL TABLE IF NOT EXISTS runtime_log_entries_fts
      USING fts5(id UNINDEXED, search_text, content='runtime_log_entries', content_rowid='rowid')
    `);
    await execute(`
      CREATE TRIGGER IF NOT EXISTS runtime_log_entries_ai
      AFTER INSERT ON runtime_log_entries BEGIN
        INSERT INTO runtime_log_entries_fts(rowid, id, search_text)
        VALUES (new.rowid, new.id, new.search_text);
      END
    `);
    await execute(`
      CREATE TRIGGER IF NOT EXISTS runtime_log_entries_ad
      AFTER DELETE ON runtime_log_entries BEGIN
        INSERT INTO runtime_log_entries_fts(runtime_log_entries_fts, rowid, id, search_text)
        VALUES('delete', old.rowid, old.id, old.search_text);
      END
    `);
    await execute(`
      CREATE TRIGGER IF NOT EXISTS runtime_log_entries_au
      AFTER UPDATE ON runtime_log_entries BEGIN
        INSERT INTO runtime_log_entries_fts(runtime_log_entries_fts, rowid, id, search_text)
        VALUES('delete', old.rowid, old.id, old.search_text);
        INSERT INTO runtime_log_entries_fts(rowid, id, search_text)
        VALUES (new.rowid, new.id, new.search_text);
      END
    `);
  })();

  return schemaPromise;
};

interface StoredRuntimeLogEvent extends RuntimeLogEvent {
  ingestLane: "public" | "authenticated";
  receivedAt: number;
  network: RuntimeLogNetworkMetadata;
}

type RuntimeLogEventWithMetadata = RuntimeLogEvent & {
  receivedAt?: number;
  ingestLane?: string;
  rawIp?: string | null;
  countryCode?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
  asn?: string | null;
  networkProvider?: string | null;
};

const getNumber = (value: unknown): number | null => {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const getBoolean = (value: unknown): boolean | null => {
  return typeof value === "boolean" ? value : null;
};

const getConnectivityRollup = (event: RuntimeLogEvent) => {
  const payload = event.payload ?? {};
  const rollup = typeof payload.rollup === "object" && payload.rollup ? payload.rollup as Record<string, unknown> : null;

  return {
    online: getBoolean(payload.online),
    startedOffline: rollup ? getBoolean(rollup.startedOffline) : null,
    endedOffline: rollup ? getBoolean(rollup.endedOffline) : null,
    transitionCount: rollup ? getNumber(rollup.transitionCount) : null,
    offlineDurationMs: rollup ? getNumber(rollup.offlineDurationMs) : null,
    onlineDurationMs: rollup ? getNumber(rollup.onlineDurationMs) : null,
    longestOfflineStreakMs: rollup ? getNumber(rollup.longestOfflineStreakMs) : null,
    lastConnectivityChangeAt: rollup ? getNumber(rollup.lastConnectivityChangeAt) : null,
    lastKnownConnectivityState:
      rollup && typeof rollup.lastKnownConnectivityState === "string" ? rollup.lastKnownConnectivityState : null,
  };
};

const upsertLaunch = async (event: StoredRuntimeLogEvent): Promise<void> => {
  const network = event.network;
  const connectivity = getConnectivityRollup(event);
  const becameAuthenticatedAt = event.authState === "authenticated" ? event.timestamp : null;

  await execute(
    `
      INSERT INTO runtime_log_launches (
        launch_id,
        device_id,
        first_seen_at,
        last_seen_at,
        app_version,
        platform,
        arch,
        auth_became_available_at,
        final_user_id,
        final_org_id,
        started_offline,
        ended_offline,
        transition_count,
        offline_duration_ms,
        online_duration_ms,
        longest_offline_streak_ms,
        last_connectivity_change_at,
        last_known_connectivity_state,
        country_code,
        region,
        city,
        timezone,
        asn,
        network_provider,
        raw_ip
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(launch_id) DO UPDATE SET
        last_seen_at = MAX(runtime_log_launches.last_seen_at, excluded.last_seen_at),
        auth_became_available_at = COALESCE(runtime_log_launches.auth_became_available_at, excluded.auth_became_available_at),
        final_user_id = COALESCE(excluded.final_user_id, runtime_log_launches.final_user_id),
        final_org_id = COALESCE(excluded.final_org_id, runtime_log_launches.final_org_id),
        started_offline = COALESCE(runtime_log_launches.started_offline, excluded.started_offline),
        ended_offline = COALESCE(excluded.ended_offline, runtime_log_launches.ended_offline),
        transition_count = MAX(runtime_log_launches.transition_count, excluded.transition_count),
        offline_duration_ms = MAX(runtime_log_launches.offline_duration_ms, excluded.offline_duration_ms),
        online_duration_ms = MAX(runtime_log_launches.online_duration_ms, excluded.online_duration_ms),
        longest_offline_streak_ms = MAX(runtime_log_launches.longest_offline_streak_ms, excluded.longest_offline_streak_ms),
        last_connectivity_change_at = COALESCE(excluded.last_connectivity_change_at, runtime_log_launches.last_connectivity_change_at),
        last_known_connectivity_state = COALESCE(excluded.last_known_connectivity_state, runtime_log_launches.last_known_connectivity_state),
        country_code = COALESCE(excluded.country_code, runtime_log_launches.country_code),
        region = COALESCE(excluded.region, runtime_log_launches.region),
        city = COALESCE(excluded.city, runtime_log_launches.city),
        timezone = COALESCE(excluded.timezone, runtime_log_launches.timezone),
        asn = COALESCE(excluded.asn, runtime_log_launches.asn),
        network_provider = COALESCE(excluded.network_provider, runtime_log_launches.network_provider),
        raw_ip = COALESCE(excluded.raw_ip, runtime_log_launches.raw_ip)
    `,
    [
      event.launchId,
      event.deviceId,
      event.timestamp,
      event.timestamp,
      event.appVersion,
      event.platform,
      event.arch,
      becameAuthenticatedAt,
      event.userId ?? null,
      event.orgId ?? null,
      connectivity.startedOffline === null ? (connectivity.online === false ? 1 : null) : Number(connectivity.startedOffline),
      connectivity.endedOffline === null ? (connectivity.online === null ? null : Number(!connectivity.online)) : Number(connectivity.endedOffline),
      connectivity.transitionCount ?? (event.eventCode.startsWith("connectivity.") ? 1 : 0),
      connectivity.offlineDurationMs ?? 0,
      connectivity.onlineDurationMs ?? 0,
      connectivity.longestOfflineStreakMs ?? 0,
      connectivity.lastConnectivityChangeAt ?? (event.eventCode.startsWith("connectivity.") ? event.timestamp : null),
      connectivity.lastKnownConnectivityState ?? (connectivity.online === null ? null : connectivity.online ? "online" : "offline"),
      network.countryCode,
      network.region,
      network.city,
      network.timezone,
      network.asn,
      network.networkProvider,
      network.rawIp,
    ],
  );
};

export const insertRuntimeLogEvents = async (events: StoredRuntimeLogEvent[]): Promise<void> => {
  await ensureRuntimeLogSchema();

  for (const event of events) {
    const searchText = buildRuntimeLogSearchText(event);
    await execute(
      `
        INSERT OR IGNORE INTO runtime_log_entries (
          id,
          event_ts,
          received_at,
          level,
          runtime,
          runtime_instance_id,
          event_code,
          message,
          search_text,
          payload_json,
          error_json,
          device_id,
          launch_id,
          sync_client_id,
          app_version,
          platform,
          arch,
          is_packaged,
          auth_state,
          user_id,
          org_id,
          membership_role,
          route,
          repeat_count,
          ingest_lane,
          raw_ip,
          country_code,
          region,
          city,
          timezone,
          asn,
          network_provider
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        event.id,
        event.timestamp,
        event.receivedAt,
        event.level,
        event.runtime,
        event.runtimeInstanceId,
        event.eventCode,
        event.message,
        searchText,
        event.payload ? JSON.stringify(event.payload) : null,
        event.error ? JSON.stringify(event.error) : null,
        event.deviceId,
        event.launchId,
        event.syncClientId ?? null,
        event.appVersion,
        event.platform,
        event.arch,
        Number(event.isPackaged),
        event.authState,
        event.userId ?? null,
        event.orgId ?? null,
        event.membershipRole ?? null,
        event.route ?? null,
        event.repeatCount ?? 1,
        event.ingestLane,
        event.network.rawIp,
        event.network.countryCode,
        event.network.region,
        event.network.city,
        event.network.timezone,
        event.network.asn,
        event.network.networkProvider,
      ],
    );

    await upsertLaunch(event);
  }
};

const parseJson = <T>(value: unknown): T | undefined => {
  if (typeof value !== "string" || !value) {
    return undefined;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

const mapEntryRow = (row: Record<string, unknown>): RuntimeLogEventWithMetadata => ({
  id: String(row.id),
  timestamp: Number(row.event_ts),
  level: row.level as RuntimeLogLevel,
  runtime: row.runtime as RuntimeLogRuntime,
  runtimeInstanceId: String(row.runtime_instance_id),
  eventCode: String(row.event_code),
  message: String(row.message),
  payload: parseJson<Record<string, unknown>>(row.payload_json),
  error: parseJson(row.error_json),
  route: row.route ? String(row.route) : null,
  deviceId: String(row.device_id),
  launchId: String(row.launch_id),
  syncClientId: row.sync_client_id ? String(row.sync_client_id) : null,
  appVersion: String(row.app_version),
  platform: String(row.platform),
  arch: String(row.arch),
  isPackaged: Boolean(row.is_packaged),
  authState: row.auth_state as RuntimeLogEvent["authState"],
  userId: row.user_id ? String(row.user_id) : null,
  orgId: row.org_id ? String(row.org_id) : null,
  membershipRole: row.membership_role ? String(row.membership_role) : null,
  repeatCount: Number(row.repeat_count ?? 1),
  receivedAt: row.received_at ? Number(row.received_at) : undefined,
  ingestLane: row.ingest_lane ? String(row.ingest_lane) : undefined,
  rawIp: row.raw_ip ? String(row.raw_ip) : null,
  countryCode: row.country_code ? String(row.country_code) : null,
  region: row.region ? String(row.region) : null,
  city: row.city ? String(row.city) : null,
  timezone: row.timezone ? String(row.timezone) : null,
  asn: row.asn ? String(row.asn) : null,
  networkProvider: row.network_provider ? String(row.network_provider) : null,
});

const encodeCursor = (event: RuntimeLogEvent): string => {
  return Buffer.from(JSON.stringify({ ts: event.timestamp, id: event.id })).toString("base64url");
};

const decodeCursor = (cursor?: string): { ts: number; id: string } | null => {
  if (!cursor) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as { ts?: unknown; id?: unknown };
    return typeof parsed.ts === "number" && typeof parsed.id === "string" ? { ts: parsed.ts, id: parsed.id } : null;
  } catch {
    return null;
  }
};

const normalizeFtsQuery = (query: string): string | null => {
  const tokens = query
    .toLowerCase()
    .match(/[\p{L}\p{N}_-]+/gu)
    ?.slice(0, 12)
    .map((token) => token.replace(/"/g, ""));
  if (!tokens?.length) {
    return null;
  }
  return tokens.map((token) => `"${token}"*`).join(" AND ");
};

export const queryRuntimeLogs = async (filters: RuntimeLogQueryRequest): Promise<RuntimeLogQueryResponse> => {
  await ensureRuntimeLogSchema();

  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 200);
  const from = filters.from ?? Date.now() - 30 * 24 * 60 * 60 * 1000;
  const to = filters.to ?? Date.now();
  const args: Array<string | number | null> = [from, to];
  const where = ["event_ts >= ?", "event_ts <= ?"];

  const addEquals = (column: string, value?: string) => {
    if (!value) return;
    where.push(`${column} = ?`);
    args.push(value);
  };

  addEquals("org_id", filters.orgId);
  addEquals("user_id", filters.userId);
  addEquals("app_version", filters.appVersion);
  addEquals("device_id", filters.deviceId);
  addEquals("launch_id", filters.launchId);
  addEquals("city", filters.city);
  addEquals("region", filters.region);
  addEquals("country_code", filters.countryCode);

  if (filters.runtime?.length) {
    where.push(`runtime IN (${filters.runtime.map(() => "?").join(", ")})`);
    args.push(...filters.runtime);
  }

  if (filters.level?.length) {
    where.push(`level IN (${filters.level.map(() => "?").join(", ")})`);
    args.push(...filters.level);
  }

  const ftsQuery = filters.query ? normalizeFtsQuery(filters.query) : null;
  if (ftsQuery) {
    where.push("id IN (SELECT id FROM runtime_log_entries_fts WHERE runtime_log_entries_fts MATCH ?)");
    args.push(ftsQuery);
  }

  const cursor = decodeCursor(filters.cursor);
  if (cursor) {
    where.push("(event_ts < ? OR (event_ts = ? AND id < ?))");
    args.push(cursor.ts, cursor.ts, cursor.id);
  }

  args.push(limit + 1);

  const result = await execute(
    `
      SELECT *
      FROM runtime_log_entries
      WHERE ${where.join(" AND ")}
      ORDER BY event_ts DESC, id DESC
      LIMIT ?
    `,
    args,
  );

  const mapped = result.rows.map((row) => mapEntryRow(row as Record<string, unknown>));
  const page = mapped.slice(0, limit);
  const nextCursor = mapped.length > limit && page.length ? encodeCursor(page[page.length - 1]) : null;

  return { entries: page, nextCursor };
};

const mapLaunchRow = (row: Record<string, unknown>): LaunchSummary => ({
  launchId: String(row.launch_id),
  deviceId: String(row.device_id),
  firstSeenAt: Number(row.first_seen_at),
  lastSeenAt: Number(row.last_seen_at),
  appVersion: String(row.app_version),
  platform: String(row.platform),
  arch: String(row.arch),
  authBecameAvailableAt: row.auth_became_available_at ? Number(row.auth_became_available_at) : null,
  finalUserId: row.final_user_id ? String(row.final_user_id) : null,
  finalOrgId: row.final_org_id ? String(row.final_org_id) : null,
  startedOffline: row.started_offline === null || row.started_offline === undefined ? null : Boolean(row.started_offline),
  endedOffline: row.ended_offline === null || row.ended_offline === undefined ? null : Boolean(row.ended_offline),
  transitionCount: Number(row.transition_count ?? 0),
  offlineDurationMs: Number(row.offline_duration_ms ?? 0),
  onlineDurationMs: Number(row.online_duration_ms ?? 0),
  longestOfflineStreakMs: Number(row.longest_offline_streak_ms ?? 0),
  lastConnectivityChangeAt: row.last_connectivity_change_at ? Number(row.last_connectivity_change_at) : null,
  lastKnownConnectivityState: row.last_known_connectivity_state ? String(row.last_known_connectivity_state) : null,
  countryCode: row.country_code ? String(row.country_code) : null,
  region: row.region ? String(row.region) : null,
  city: row.city ? String(row.city) : null,
  timezone: row.timezone ? String(row.timezone) : null,
  asn: row.asn ? String(row.asn) : null,
  networkProvider: row.network_provider ? String(row.network_provider) : null,
  rawIp: row.raw_ip ? String(row.raw_ip) : null,
});

export const getRuntimeLogLaunch = async (launchId: string): Promise<{ summary: LaunchSummary | null; entries: RuntimeLogEvent[] }> => {
  await ensureRuntimeLogSchema();

  const launchResult = await execute("SELECT * FROM runtime_log_launches WHERE launch_id = ? LIMIT 1", [launchId]);
  const summary = launchResult.rows[0] ? mapLaunchRow(launchResult.rows[0] as Record<string, unknown>) : null;

  const entriesResult = await execute(
    "SELECT * FROM runtime_log_entries WHERE launch_id = ? ORDER BY event_ts ASC, id ASC LIMIT 5000",
    [launchId],
  );

  return {
    summary,
    entries: entriesResult.rows.map((row) => mapEntryRow(row as Record<string, unknown>)),
  };
};

export const pruneRuntimeLogs = async (): Promise<void> => {
  await ensureRuntimeLogSchema();

  const now = Date.now();
  const meta = await execute("SELECT value FROM runtime_log_meta WHERE id = 'retention.last_pruned_at' LIMIT 1");
  const lastPrunedAt = meta.rows[0]?.value ? Number(meta.rows[0].value) : 0;
  if (now - lastPrunedAt < 60 * 60 * 1000) {
    return;
  }

  const cutoff = now - 30 * 24 * 60 * 60 * 1000;
  await execute("DELETE FROM runtime_log_entries WHERE event_ts < ?", [cutoff]);
  await execute("DELETE FROM runtime_log_launches WHERE last_seen_at < ?", [cutoff]);
  await execute(
    `
      INSERT INTO runtime_log_meta (id, value, updated_at)
      VALUES ('retention.last_pruned_at', ?, ?)
      ON CONFLICT(id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `,
    [String(now), now],
  );
};
