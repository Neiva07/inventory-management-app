import { existsSync, mkdirSync } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";
import { createAppDb, createAppDbClient, getLocalDatabaseUrl } from "./client";
import { runLegacySyncQueueBackfill } from "./legacySyncBackfill";

let bootstrapPromise: Promise<ReturnType<typeof createAppDb>> | null = null;

const isSqliteAlreadyExistsError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("SQLITE_ERROR") &&
    error.message.includes("already exists")
  );
};

const resolveLocalDatabaseFilePath = (): string | null => {
  const databaseUrl = getLocalDatabaseUrl();
  if (!databaseUrl.startsWith("file:")) {
    return null;
  }

  const rawPath = databaseUrl.slice("file:".length).split("?")[0];
  if (!rawPath || rawPath === ":memory:") {
    return null;
  }

  // Support the common `file:./relative/path.db` style used in this project.
  if (!rawPath.startsWith("/")) {
    return path.resolve(process.cwd(), rawPath);
  }

  return rawPath;
};

const isDevMode = (): boolean => process.env.NODE_ENV !== "production";

const resetLocalDatabaseFile = async (): Promise<boolean> => {
  const filePath = resolveLocalDatabaseFilePath();
  if (!filePath) {
    return false;
  }

  await rm(filePath, { force: true });
  return true;
};

const resolveMigrationsFolder = (): string => {
  // In packaged builds, migrations are copied into the asar by the forge hook.
  // process.resourcesPath points to the Resources directory of the Electron app.
  if (typeof process.resourcesPath === "string") {
    const asarPath = path.join(process.resourcesPath, "app.asar", "drizzle");
    if (existsSync(asarPath)) {
      return asarPath;
    }
  }

  return "drizzle";
};

const ensureDbDirectoryExists = () => {
  const dbUrl = getLocalDatabaseUrl();
  const raw = dbUrl.replace(/^file:/, "").split("?")[0];
  if (!raw || raw === ":memory:") return;

  const dir = path.dirname(raw.startsWith("/") ? raw : path.resolve(process.cwd(), raw));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const runMigrations = async () => {
  ensureDbDirectoryExists();

  const client = createAppDbClient();
  const db = drizzle(client, { schema });

  try {
    await migrate(db, {
      migrationsFolder: resolveMigrationsFolder(),
    });
  } finally {
    client.close();
  }
};

const bootstrapDatabaseOnce = async () => {
  try {
    await runMigrations();
  } catch (error) {
    if (isDevMode() && isSqliteAlreadyExistsError(error)) {
      const reset = await resetLocalDatabaseFile();
      if (reset) {
        console.warn(
          "Local DB migration baseline conflict detected. Resetting local SQLite file and retrying bootstrap once."
        );
        await runMigrations();
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  await runLegacySyncQueueBackfill();

  return createAppDb();
};

export const bootstrapDatabase = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapDatabaseOnce().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
};
