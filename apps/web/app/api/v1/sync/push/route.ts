import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { processPushChanges } from "@/lib/sync/pushHandler";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const clientId = request.headers.get("x-client-id") ?? body.clientId ?? "unknown";

    const result = await processPushChanges(userId, clientId, body.changes ?? []);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
