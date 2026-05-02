import { NextRequest, NextResponse } from "next/server";
import { isLocalDevelopmentRequest, requireRequestAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { processPushChanges } from "@/lib/sync/pushHandler";
import { getResetRequiredResponse } from "@/lib/sync/resetControl";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resetRequiredResponse = await getResetRequiredResponse(body.clientResetGeneration);
    if (resetRequiredResponse) {
      return resetRequiredResponse;
    }

    const { userId } = await requireRequestAuth(request);
    const clientId = request.headers.get("x-client-id") ?? body.clientId ?? "unknown";

    const result = await processPushChanges(userId, clientId, body.changes ?? [], {
      skipOrgAccessValidation: isLocalDevelopmentRequest(request),
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
