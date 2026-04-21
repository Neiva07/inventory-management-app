import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "fs";
import path from "path";
import * as schema from "./schema";

export const LOCAL_DATABASE_URL = "file:./data/stockify-web.db";

const resolveDatabaseUrl = (): string => {
  const configuredUrl = process.env.TURSO_DATABASE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    return LOCAL_DATABASE_URL;
  }

  throw new Error("TURSO_DATABASE_URL is required outside local development.");
};

const ensureFileDatabaseDirectory = (url: string): void => {
  if (!url.startsWith("file:")) {
    return;
  }

  const filePath = url.slice("file:".length).split("?")[0];
  if (!filePath || filePath === ":memory:") {
    return;
  }

  const dir = path.dirname(filePath);
  if (dir && dir !== ".") {
    mkdirSync(dir, { recursive: true });
  }
};

export const databaseUrl = resolveDatabaseUrl();
ensureFileDatabaseDirectory(databaseUrl);

export const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export const db = drizzle(client, { schema });
