# Tasks — extract shared Drizzle schema

Durable checklist. Tick tasks as they complete. Safe to resume after context loss.

## Phase 1 — create the shared package

- [x] Create `packages/db-schema/package.json`
  - `name: "@stockify/db-schema"`, `private: true`, `type: "module"`
  - `main`/`types` → `./src/index.ts`, `exports["."]` same shape as `@stockify/runtime-logging`
  - `peerDependencies.drizzle-orm`: `">=0.44.0 <0.45.0"`
  - `devDependencies.drizzle-orm`: match highest app version (currently `^0.44.7`)
- [x] Create `packages/db-schema/src/lifecycle.ts` with the shared `lifecycleColumns` constant
- [x] Create `packages/db-schema/src/index.ts` containing all shared tables + all `*Relations` (verified byte-identical move from desktop source)

## Phase 2 — thin down each app's schema.ts

- [x] `apps/desktop/src/db/schema.ts` → `export * from "@stockify/db-schema"` + keep only `syncMeta` + `syncQueue`
- [x] `apps/web/lib/db/schema.ts` → `export * from "@stockify/db-schema"` + keep only `syncEvents`, `runtimeLogEntries`, `runtimeLogLaunches`, `runtimeLogMeta`

## Phase 3 — wire workspace deps

- [x] Add `"@stockify/db-schema": "workspace:*"` to `apps/desktop/package.json` dependencies
- [x] Add `"@stockify/db-schema": "workspace:*"` to `apps/web/package.json` dependencies
- [x] Run `pnpm install` from repo root (workspace symlinks verified in both apps)

## Phase 4 — verify no drift

- [x] `pnpm desktop db:generate` → "No schema changes, nothing to migrate 😴". Drizzle-kit saw all 23 tables (21 shared + 2 desktop-only). `apps/desktop/drizzle/` unchanged.
- [x] Web uses `db:push` today and has no `drizzle/` folder — intentionally did NOT run `db:generate` on web.

## Phase 5 — verify consumers still build

- [x] `pnpm desktop exec tsc --noEmit` — zero errors.
- [x] `pnpm web exec tsc --noEmit` — zero errors.

## Phase 6 — confirm

- [x] Reported back to user. Did NOT run `db:migrate`/`db:push`/`pnpm start`/`pnpm dev` — user runs those.

## Constraints (did not violate)

- [x] No `.sql` or `_journal.json` files edited by hand.
- [x] No `db:migrate`/`db:push` run.
- [x] `drizzle-orm` is a peerDependency on the shared package (not a direct dep) — avoids dual drizzle-orm instances.
- [x] Desktop schema file ends up with only `syncMeta` + `syncQueue` (+ the re-export).
- [x] Web schema file ends up with only `syncEvents`, `runtimeLogEntries`, `runtimeLogLaunches`, `runtimeLogMeta` (+ the re-export).
