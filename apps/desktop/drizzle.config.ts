import { defineConfig } from "drizzle-kit";

const databaseUrl =
  process.env.TURSO_LOCAL_DATABASE_URL ??
  process.env.TURSO_DATABASE_URL ??
  "file:./data/stockify.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: databaseUrl,
    authToken,
  },
  verbose: true,
  strict: true,
});
