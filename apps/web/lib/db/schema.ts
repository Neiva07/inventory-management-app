import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { lifecycleColumns } from "@stockify/db-schema";

export * from "@stockify/db-schema";

// ---------------------------------------------------------------------------
// Cloud-only: sync event log (audit trail)
// ---------------------------------------------------------------------------

export const syncEvents = sqliteTable(
  "sync_events",
  {
    id: text("sync_events_id").primaryKey(),
    tableName: text("table_name").notNull(),
    recordId: text("record_id").notNull(),
    operation: text("operation").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeId: text("scope_id").notNull(),
    payloadJson: text("payload_json"),
    clientId: text("client_id"),
    userId: text("user_id").notNull(),
    ...lifecycleColumns,
  },
  (table) => ({
    syncEventsScopeIdx: index("sync_events_scope_idx").on(table.scopeType, table.scopeId, table.createdAt),
    syncEventsRecordIdx: index("sync_events_record_idx").on(table.tableName, table.recordId),
  })
);

// ---------------------------------------------------------------------------
// Cloud-only: distributed desktop runtime logs
// ---------------------------------------------------------------------------

export const runtimeLogEntries = sqliteTable(
  "runtime_log_entries",
  {
    id: text("id").primaryKey(),
    eventTs: integer("event_ts", { mode: "number" }).notNull(),
    receivedAt: integer("received_at", { mode: "number" }).notNull(),
    level: text("level").notNull(),
    runtime: text("runtime").notNull(),
    runtimeInstanceId: text("runtime_instance_id").notNull(),
    eventCode: text("event_code").notNull(),
    message: text("message").notNull(),
    searchText: text("search_text").notNull(),
    payloadJson: text("payload_json"),
    errorJson: text("error_json"),
    deviceId: text("device_id").notNull(),
    launchId: text("launch_id").notNull(),
    syncClientId: text("sync_client_id"),
    appVersion: text("app_version").notNull(),
    platform: text("platform").notNull(),
    arch: text("arch").notNull(),
    isPackaged: integer("is_packaged", { mode: "boolean" }).notNull(),
    authState: text("auth_state").notNull(),
    userId: text("user_id"),
    orgId: text("org_id"),
    membershipRole: text("membership_role"),
    route: text("route"),
    repeatCount: integer("repeat_count", { mode: "number" }).notNull().default(1),
    ingestLane: text("ingest_lane").notNull(),
    rawIp: text("raw_ip"),
    countryCode: text("country_code"),
    region: text("region"),
    city: text("city"),
    timezone: text("timezone"),
    asn: text("asn"),
    networkProvider: text("network_provider"),
  },
  (table) => ({
    runtimeLogsTimeIdx: index("runtime_log_entries_time_idx").on(table.eventTs),
    runtimeLogsLaunchIdx: index("runtime_log_entries_launch_idx").on(table.launchId, table.eventTs),
    runtimeLogsDeviceIdx: index("runtime_log_entries_device_idx").on(table.deviceId, table.eventTs),
    runtimeLogsOrgIdx: index("runtime_log_entries_org_idx").on(table.orgId, table.eventTs),
    runtimeLogsUserIdx: index("runtime_log_entries_user_idx").on(table.userId, table.eventTs),
    runtimeLogsLevelIdx: index("runtime_log_entries_level_idx").on(table.level, table.eventTs),
    runtimeLogsRuntimeIdx: index("runtime_log_entries_runtime_idx").on(table.runtime, table.eventTs),
    runtimeLogsLocationIdx: index("runtime_log_entries_location_idx").on(
      table.countryCode,
      table.region,
      table.city,
    ),
  }),
);

export const runtimeLogLaunches = sqliteTable(
  "runtime_log_launches",
  {
    launchId: text("launch_id").primaryKey(),
    deviceId: text("device_id").notNull(),
    firstSeenAt: integer("first_seen_at", { mode: "number" }).notNull(),
    lastSeenAt: integer("last_seen_at", { mode: "number" }).notNull(),
    appVersion: text("app_version").notNull(),
    platform: text("platform").notNull(),
    arch: text("arch").notNull(),
    authBecameAvailableAt: integer("auth_became_available_at", { mode: "number" }),
    finalUserId: text("final_user_id"),
    finalOrgId: text("final_org_id"),
    startedOffline: integer("started_offline", { mode: "boolean" }),
    endedOffline: integer("ended_offline", { mode: "boolean" }),
    transitionCount: integer("transition_count", { mode: "number" }).notNull().default(0),
    offlineDurationMs: integer("offline_duration_ms", { mode: "number" }).notNull().default(0),
    onlineDurationMs: integer("online_duration_ms", { mode: "number" }).notNull().default(0),
    longestOfflineStreakMs: integer("longest_offline_streak_ms", { mode: "number" }).notNull().default(0),
    lastConnectivityChangeAt: integer("last_connectivity_change_at", { mode: "number" }),
    lastKnownConnectivityState: text("last_known_connectivity_state"),
    countryCode: text("country_code"),
    region: text("region"),
    city: text("city"),
    timezone: text("timezone"),
    asn: text("asn"),
    networkProvider: text("network_provider"),
    rawIp: text("raw_ip"),
  },
  (table) => ({
    runtimeLogLaunchDeviceIdx: index("runtime_log_launches_device_idx").on(table.deviceId, table.lastSeenAt),
    runtimeLogLaunchUserIdx: index("runtime_log_launches_user_idx").on(table.finalUserId, table.lastSeenAt),
    runtimeLogLaunchOrgIdx: index("runtime_log_launches_org_idx").on(table.finalOrgId, table.lastSeenAt),
  }),
);

export const runtimeLogMeta = sqliteTable("runtime_log_meta", {
  id: text("id").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "number" }).notNull(),
});
