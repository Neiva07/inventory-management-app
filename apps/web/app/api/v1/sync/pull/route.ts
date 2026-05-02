import { NextRequest, NextResponse } from "next/server";
import { isLocalDevelopmentRequest, requireRequestAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { processPullRequest } from "@/lib/sync/pullHandler";
import { getResetRequiredResponse } from "@/lib/sync/resetControl";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resetRequiredResponse = await getResetRequiredResponse(body.clientResetGeneration);
    if (resetRequiredResponse) {
      return resetRequiredResponse;
    }

    const { userId } = await requireRequestAuth(request);
    const result = await processPullRequest(userId, body.scopes ?? [], body.limit, {
      skipOrgAccessValidation: isLocalDevelopmentRequest(request),
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
