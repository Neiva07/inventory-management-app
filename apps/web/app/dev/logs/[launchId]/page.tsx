import { requireRuntimeLogsPageAccess } from "@/lib/runtime-logs/access";
import { RuntimeLogLaunchClient } from "./runtime-log-launch-client";

interface PageProps {
  params: Promise<{ launchId: string }>;
}

export default async function RuntimeLogLaunchPage({ params }: PageProps) {
  await requireRuntimeLogsPageAccess();
  const { launchId } = await params;
  return <RuntimeLogLaunchClient launchId={launchId} />;
}
