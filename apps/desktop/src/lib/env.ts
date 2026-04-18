/**
 * Single source of truth for dev-mode detection.
 *
 * Electron Forge sets NODE_ENV to "development" when running `pnpm start`
 * and to "production" in packaged builds. All dev-only tooling (seed
 * scripts, "Preencher exemplo" buttons, DevToolsMenu, etc.) should gate
 * on this flag.
 */
export const isDev = process.env.NODE_ENV === "development";
