import { NextRequest, NextResponse } from "next/server";
import { isLocalDevelopmentRequest, requireRequestAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { processPullRequest } from "@/lib/sync/pullHandler";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireRequestAuth(request);
    const body = await request.json();

    const result = await processPullRequest(userId, body.scopes ?? [], body.limit, {
      skipOrgAccessValidation: isLocalDevelopmentRequest(request),
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
