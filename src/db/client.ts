import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type AppDatabase = ReturnType<typeof createAppDb>;

const isRenderer = typeof window !== "undefined";

const browserEnv = isRenderer
  ? (window as Window & { env?: Record<string, string | undefined> }).env
  : undefined;

const runtimeEnv = browserEnv ?? (process.env as Record<string, string | undefined>);

export const getLocalDatabaseUrl = (): string => {
  return runtimeEnv.TURSO_LOCAL_DATABASE_URL ?? "file:./data/stockify.db";
};

export const getCloudDatabaseUrl = (): string | null => {
  return runtimeEnv.TURSO_DATABASE_URL ?? null;
};

export const getDatabaseToken = (): string | undefined => {
  return runtimeEnv.TURSO_AUTH_TOKEN;
};

export const createAppDbClient = () => {
  return createClient({
    url: getLocalDatabaseUrl(),
    authToken: getDatabaseToken(),
  });
};

export const createCloudDbClient = () => {
  const cloudUrl = getCloudDatabaseUrl();
  if (!cloudUrl) {
    return null;
  }

  return createClient({
    url: cloudUrl,
    authToken: getDatabaseToken(),
  });
};

export const createAppDb = () => {
  const client = createAppDbClient();
  return drizzle(client, { schema });
};

export const createCloudDb = () => {
  const client = createCloudDbClient();
  if (!client) {
    return null;
  }

  return drizzle(client, { schema });
};
