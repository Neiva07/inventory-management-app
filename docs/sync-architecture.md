# Sync Architecture

Stockify has two physical database environments today:

- Desktop local SQLite, owned by `apps/desktop`.
- Web/cloud Turso SQLite, owned by `apps/web`.

The important architecture boundary is not only physical. The codebase treats
data as three conceptual domains.

## 1. Shared Domain / Syncable

These tables represent product data and account data that can replicate between
desktop and cloud. They are defined in `packages/db-schema/src/index.ts`.

The sync contract for these tables lives in
`packages/db-schema/src/syncCatalog.ts` and is exported as
`@stockify/db-schema/sync-catalog`.

Every syncable table must declare:

- table name
- Drizzle table object
- sync scope: `user` or `organization`
- sync direction: currently `push-pull`
- owner: currently `shared-domain`

The catalog is the single source of truth for push validation, pull apply, sync
metadata checks, and legacy sync backfill ordering.

## 2. Desktop Local

These tables exist only in the desktop SQLite database and are declared in
`apps/desktop/src/db/schema.ts`.

Current examples:

- `sync_meta`
- `sync_queue`

They are operational state for this device. They should not be added to the
shared sync catalog.

## 3. Cloud Only

These tables exist only in the web/cloud database and are declared in
`apps/web/lib/db/schema.ts`.

Current examples:

- `sync_events`
- `sync_control`
- `runtime_log_entries`
- `runtime_log_launches`
- `runtime_log_meta`

They are server-side control, audit, or observability state. They should not be
added to the shared sync catalog.

## Rule for New Tables

Before adding a table, classify it:

- If both desktop and web store it as product/account data, add it to
  `packages/db-schema/src/index.ts` and classify it in the sync catalog.
- If it is local device state, add it only to `apps/desktop/src/db/schema.ts`.
- If it is cloud control, audit, or observability state, add it only to
  `apps/web/lib/db/schema.ts`.

Do not generate migrations for sync catalog-only changes. Generate migrations
only when Drizzle table definitions change.
