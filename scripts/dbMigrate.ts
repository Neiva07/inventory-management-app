import "dotenv/config";
import { bootstrapDatabase } from "../src/db/bootstrap";

async function main(): Promise<void> {
  await bootstrapDatabase();
  console.log("Database migrations completed.");
}

main().catch((error) => {
  console.error("Database migration failed:", error);
  process.exit(1);
});

