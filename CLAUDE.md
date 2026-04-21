# Stockify Monorepo

Monorepo with pnpm workspaces containing the Electron desktop app and the Next.js website.

## Structure

```
apps/desktop/             — Electron app (stockify-app)
apps/web/                 — Next.js website (stockify-web) — inventarum.com.br
packages/db-schema/       — shared Drizzle table definitions for shared domain tables
packages/runtime-logging/ — shared runtime logging package
packages/logs-mcp/        — logs MCP server
```

## Monorepo Rules

- **Keep apps isolated.** Do not import code from `apps/desktop` into `apps/web` or vice versa. Shared code goes in `packages/`.
- **Run commands in the correct app scope.** Use `pnpm desktop <cmd>` or `pnpm web <cmd>` from root, or `cd` into the app directory.
- **Each app has its own dependencies.** Do not add desktop deps to the web package.json or vice versa.
- **Each app has its own config files.** Do not mix webpack/forge config (desktop) with next.config (web).
- **Environment variables are app-specific.** Desktop uses `apps/desktop/.env`, web uses `apps/web/.env.local`.

## Desktop App (`apps/desktop`)

- **Stack:** Electron + React 19 + Webpack + Tailwind 4 + Drizzle ORM
- **Build:** Electron Forge (`pnpm desktop run package` / `pnpm desktop run publish`)
- **Database:** Local SQLite via libsql at `apps/desktop/data/stockify.db`, optional cloud sync to Turso
- **Dev:** `pnpm desktop start`
- **CI:** GitHub Actions workflow (`.github/workflows/build.yml`) builds from `apps/desktop/`

## Web App (`apps/web`)

- **Stack:** Next.js 15 + React 19 + Tailwind 4 + Clerk auth
- **Deploy:** Vercel, root directory set to `apps/web`
- **Dev:** `pnpm web dev` (port 3111)
- **Build:** `pnpm web build`
- **Purpose:** Landing page, login domain for the desktop app, web dashboard, download page

## Database Schema Rules (CRITICAL)

There are two physical databases: desktop's local SQLite (`apps/desktop/data/stockify.db`) and web's Turso cloud DB. Schema is organized so shared domain tables live in ONE place and app-specific tables live with the app that owns them.

### Where tables live

- **Shared domain tables** (users, organizations, products, orders, suppliers, invitations, memberships, etc. + their `relations()` + `lifecycleColumns` helper) → `packages/db-schema/src/`. This is the single source of truth.
- **Desktop-only tables** (`sync_meta`, `sync_queue`) → `apps/desktop/src/db/schema.ts`.
- **Cloud-only tables** (`sync_events`, `runtime_log_entries`, `runtime_log_launches`, `runtime_log_meta`) → `apps/web/lib/db/schema.ts`.

Each app's `schema.ts` starts with `export * from "@stockify/db-schema"` and then declares its own app-specific tables. Drizzle-kit in each app follows that import and sees the full table set.

### Changing a SHARED table (e.g., adding a column to `products`)

1. Edit the table in `packages/db-schema/src/`. **Only once.**
2. `pnpm desktop exec drizzle-kit generate` → new migration in `apps/desktop/drizzle/`, updates `apps/desktop/drizzle/meta/_journal.json`.
3. `pnpm web exec drizzle-kit generate` → new migration in `apps/web/drizzle/`, updates `apps/web/drizzle/meta/_journal.json`.
4. Both migrations must be applied (user runs `db:migrate`/`db:push` per app — never Claude).

Both DBs need the change. Never skip one side.

### Changing an APP-SPECIFIC table (e.g., `sync_queue`)

1. Edit it in that app's `schema.ts` only (`apps/desktop/src/db/schema.ts` for desktop tables, `apps/web/lib/db/schema.ts` for web tables).
2. Run `drizzle-kit generate` in that app only.
3. The other app is untouched — no migration, no journal update.

### Hard rules

- **Never** put shared tables in an app's local `schema.ts`. If it's used by both apps, it belongs in `packages/db-schema`.
- **Never** import an app-specific table from the shared package. The shared package must not know that `sync_queue` or `sync_events` exist.
- **Never** edit `.sql` migration files or `_journal.json` by hand (see global rules). Schema changes go through the table definitions; drizzle-kit generates the SQL.
- **Never** run `db:migrate` or `db:push` — only the user does that.
- **Relations across the boundary:** if an app-specific table needs a `relations()` to a shared table, declare that relation in the app's own `schema.ts`, not in the shared package.
- **Journals are per-app.** Shared package has no `drizzle/` folder, no journal, no `drizzle.config.ts`. Each app owns its own migration history.

### Quick check before editing

Ask: "Is this table used by both apps?"
- Yes → edit `packages/db-schema/src/` → generate in both apps.
- No → edit the owning app's `schema.ts` → generate in that app only.
