import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { requireRuntimeLogsDesktopAuth } from "@/lib/runtime-logs/access";
import { processRuntimeLogIngest } from "@/lib/runtime-logs/ingest";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireRuntimeLogsDesktopAuth(request);
    const result = await processRuntimeLogIngest({
      request,
      lane: "authenticated",
      authenticatedUserId: userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
