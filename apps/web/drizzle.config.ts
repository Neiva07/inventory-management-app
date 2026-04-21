import { defineConfig } from "drizzle-kit";
import { mkdirSync } from "fs";
import path from "path";

const databaseUrl = process.env.TURSO_DATABASE_URL?.trim() || "file:./data/stockify-web.db";

if (databaseUrl.startsWith("file:")) {
  const filePath = databaseUrl.slice("file:".length).split("?")[0];
  const dir = path.dirname(filePath);
  if (filePath && filePath !== ":memory:" && dir && dir !== ".") {
    mkdirSync(dir, { recursive: true });
  }
}

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
  verbose: true,
  strict: true,
});
