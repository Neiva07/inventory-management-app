import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { processRuntimeLogIngest } from "@/lib/runtime-logs/ingest";

export async function POST(request: NextRequest) {
  try {
    const result = await processRuntimeLogIngest({
      request,
      lane: "public",
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
