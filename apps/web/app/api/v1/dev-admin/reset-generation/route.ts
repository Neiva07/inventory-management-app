import { NextResponse } from "next/server";
import { getResetState } from "@/lib/sync/resetControl";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    return NextResponse.json(await getResetState());
  } catch (error) {
    return handleApiError(error);
  }
}
