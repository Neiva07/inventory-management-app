import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ApiError } from "@/lib/errors";
import { requireRuntimeLogsAccess } from "@/lib/runtime-logs/access";
import { getRuntimeLogLaunch } from "@/lib/runtime-logs/store";

interface RouteContext {
  params: Promise<{ launchId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireRuntimeLogsAccess(request);
    const { launchId } = await context.params;
    const launch = await getRuntimeLogLaunch(launchId);

    if (!launch.summary) {
      throw new ApiError(404, "Runtime log launch not found");
    }

    return NextResponse.json({
      exportedAt: Date.now(),
      formatVersion: 1,
      ...launch,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
