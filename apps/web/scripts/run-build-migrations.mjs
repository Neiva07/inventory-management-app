import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, "..");
const isProductionBuild = process.env.VERCEL_ENV === "production";
const allowLocalMigration = process.env.STOCKIFY_ALLOW_LOCAL_BUILD_MIGRATE === "1";
const skipMigration = process.env.STOCKIFY_SKIP_BUILD_MIGRATE === "1";

const getDatabaseUrl = () => process.env.TURSO_DATABASE_URL?.trim() || "";

const ensureLocalDatabaseDir = (databaseUrl) => {
  if (!databaseUrl.startsWith("file:")) {
    return;
  }

  const filePath = databaseUrl.slice("file:".length).split("?")[0];
  const dir = path.dirname(path.resolve(webRoot, filePath));
  if (filePath && filePath !== ":memory:" && dir && dir !== ".") {
    mkdirSync(dir, { recursive: true });
  }
};

const run = (command, args, env = process.env) => {
  const result = spawnSync(command, args, {
    cwd: webRoot,
    env,
    shell: false,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const migrate = () => {
  if (skipMigration) {
    console.log("[build] Skipping database migration because STOCKIFY_SKIP_BUILD_MIGRATE=1.");
    return;
  }

  const databaseUrl = getDatabaseUrl();

  if (isProductionBuild) {
    if (!databaseUrl) {
      throw new Error("TURSO_DATABASE_URL is required for production build migrations.");
    }
  } else if (!allowLocalMigration) {
    console.log("[build] Skipping database migration outside production.");
    return;
  } else if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      "Local build migration refused because TURSO_DATABASE_URL is not file:. " +
        "Use TURSO_DATABASE_URL=file:./data/stockify-web.db for local testing.",
    );
  }

  ensureLocalDatabaseDir(databaseUrl);
  console.log(`[build] Running database migrations against ${databaseUrl}.`);
  run("pnpm", ["exec", "drizzle-kit", "migrate"]);
};

migrate();
