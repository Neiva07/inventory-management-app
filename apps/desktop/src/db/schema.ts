import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { lifecycleColumns } from "@stockify/db-schema";

export * from "@stockify/db-schema";

// Stores sync bookkeeping: watermarks, initial-sync flags, client ID.
export const syncMeta = sqliteTable("sync_meta", {
  id: text("sync_meta_id").primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  ...lifecycleColumns,
});

// Tracks local writes that still need cloud replication.
export const syncQueue = sqliteTable(
  "sync_queue",
  {
    id: text("sync_queue_id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    tableName: text("table_name").notNull(),
    recordId: text("record_id").notNull(),
    operation: text("operation").notNull(), // create | update | delete
    payloadJson: text("payload_json").notNull(),
    status: text("status").notNull().default("pending"), // pending | syncing | failed | synced
    attempts: integer("attempts", { mode: "number" }).notNull().default(0),
    lastError: text("last_error"),
    nextAttemptAt: integer("next_attempt_at", { mode: "number" }),
    ...lifecycleColumns,
  },
  (table) => ({
    syncQueueStatusIdx: index("sync_queue_status_idx").on(table.status, table.nextAttemptAt),
    syncQueueOrgIdx: index("sync_queue_org_idx").on(table.organizationId),
    syncQueueEntityIdx: index("sync_queue_entity_idx").on(table.tableName, table.recordId),
  })
);
