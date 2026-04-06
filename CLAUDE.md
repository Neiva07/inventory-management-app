# Stockify Monorepo

Monorepo with pnpm workspaces containing the Electron desktop app and the Next.js website.

## Structure

```
apps/desktop/   — Electron app (stockify-app)
apps/web/       — Next.js website (stockify-web) — inventarum.com.br
packages/       — shared packages (future)
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
