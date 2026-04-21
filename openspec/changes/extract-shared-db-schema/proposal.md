# Proposal — extract shared Drizzle schema into `packages/db-schema`

## Why

The Electron desktop app and the Next.js web app each have their own `schema.ts` (~520 lines of shared domain tables each). Today the shared tables are kept in sync by hand — every schema change requires edits in two places, which is error-prone.

Parity check confirms the shared tables are currently byte-identical across both apps. This is the right moment to extract the shared definitions into a workspace package before the schemas drift.

## What changes

- New workspace package `packages/db-schema` owns the shared domain tables, `lifecycleColumns` helper, and all `*Relations` exports.
- Each app's `schema.ts` becomes a thin re-export (`export * from "@stockify/db-schema"`) plus declarations of app-specific tables.
  - Desktop keeps: `syncMeta`, `syncQueue` (local offline queue).
  - Web keeps: `syncEvents`, `runtimeLogEntries`, `runtimeLogLaunches`, `runtimeLogMeta` (cloud-only).
- `drizzle.config.ts` in each app is unchanged — each still points at its own local `schema.ts`, and drizzle-kit follows the re-export transitively.
- Each app still owns its own `drizzle/` migration folder and journal.

## Non-goals

- No migration is generated as part of this change (desktop should produce zero drift; web continues with `db:push`).
- No changes to repositories, models, or the sync engine.
- No restructuring of app-specific tables.

## Why this is safe

- Consumers import table names like `products`, `orders` — the re-export preserves those exact import paths.
- No `relations()` crosses the shared/app-specific boundary today (verified).
- Matches the existing `@stockify/runtime-logging` workspace package pattern (TS consumed directly, `main`/`types` fields, no build step).
