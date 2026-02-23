# Turso + Drizzle Operations Runbook

## Purpose

This runbook describes how to bootstrap, migrate, and troubleshoot the local-first Turso/Drizzle data layer used by the desktop app.

## Environment Variables

- `TURSO_DATABASE_URL`: Remote libsql URL used when cloud sync is enabled.
- `TURSO_LOCAL_DATABASE_URL`: Local SQLite/libsql URL. Default fallback is `file:./data/stockify.db`.
- `TURSO_AUTH_TOKEN`: Auth token for Turso cloud access.

## Main Commands

- `pnpm db:generate`: Generate SQL migrations from `src/db/schema.ts`.
- `pnpm db:migrate`: Apply Drizzle migrations via drizzle-kit.
- `pnpm db:push`: Push schema directly to the configured database.
- `pnpm db:studio`: Open Drizzle Studio against the configured database.
- `pnpm db:migrate:local`: Run app bootstrap migration path (`scripts/dbMigrate.ts`).

## Local Bootstrap Flow

1. Configure `TURSO_LOCAL_DATABASE_URL` (or rely on default `file:./data/stockify.db`).
2. Run `pnpm db:migrate:local`.
3. Start the app and verify that DB initialization succeeds.

## Sync Queue Operations

Local writes that still need cloud replication are tracked in `sync_queue`.

States:
- `pending`: waiting for sync attempt
- `syncing`: currently being sent
- `failed`: last send failed, will retry
- `synced`: successfully replicated

Key retry behavior:
- Failed items are retried with exponential backoff up to 5 minutes.

## Troubleshooting

### Migrations fail at startup

- Verify `drizzle` folder exists and contains migrations.
- Check DB URL syntax (`file:` for local; `libsql://` for remote).
- Re-run `pnpm db:migrate:local` and inspect error logs.

### Sync stays in `failed`

- Validate network connectivity.
- Confirm `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
- Inspect `sync_queue.last_error` and `attempts`.

### Sync never runs

- Ensure the sync engine is started by app bootstrap.
- In renderer contexts, verify online/offline events are firing.

## Operational Notes

- Monetary values are stored in minor units (cents) to avoid floating-point drift.
- Soft deletes use `deleted_at` instead of physical deletes for business entities.
- This migration phase does not include Firestore historical backfill.
