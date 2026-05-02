import { NextResponse } from "next/server";
import { requireRuntimeLogsAccess } from "@/lib/runtime-logs/access";
import { wipeAllData } from "@/lib/dev-admin/wipeData";

const confirmationText = "RESET CLOUD ENVIRONMENT";

export async function POST(request: Request) {
  await requireRuntimeLogsAccess(request);

  const body = await request.json().catch(() => null) as { confirmation?: unknown } | null;
  if (body?.confirmation !== confirmationText) {
    return NextResponse.json(
      { error: `Confirmation must be exactly "${confirmationText}".` },
      { status: 400 },
    );
  }

  const result = await wipeAllData();
  return NextResponse.json(result);
}
