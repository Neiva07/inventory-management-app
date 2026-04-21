import { requireRuntimeLogsPageAccess } from "@/lib/runtime-logs/access";
import { RuntimeLogsClient } from "./runtime-logs-client";

export default async function RuntimeLogsPage() {
  await requireRuntimeLogsPageAccess();
  return <RuntimeLogsClient />;
}
