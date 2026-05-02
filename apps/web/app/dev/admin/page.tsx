import { requireRuntimeLogsPageAccess } from "@/lib/runtime-logs/access";
import { DevAdminClient } from "./dev-admin-client";

export default async function DevAdminPage() {
  await requireRuntimeLogsPageAccess();
  return <DevAdminClient />;
}
