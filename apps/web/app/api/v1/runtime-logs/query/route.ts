import { NextRequest, NextResponse } from "next/server";
import {
  coerceRuntime,
  coerceRuntimeLogLevel,
  type RuntimeLogQueryRequest,
} from "@stockify/runtime-logging";
import { handleApiError } from "@/lib/errors";
import { requireRuntimeLogsAccess } from "@/lib/runtime-logs/access";
import { queryRuntimeLogs } from "@/lib/runtime-logs/store";

const coerceStringArray = <T extends string>(
  value: unknown,
  coerce: (candidate: unknown) => T | null,
): T[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const coerced = value.map(coerce).filter((item): item is T => Boolean(item));
  return coerced.length ? coerced : undefined;
};

export async function POST(request: NextRequest) {
  try {
    await requireRuntimeLogsAccess(request);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const filters: RuntimeLogQueryRequest = {
      from: typeof body.from === "number" ? body.from : undefined,
      to: typeof body.to === "number" ? body.to : undefined,
      orgId: typeof body.orgId === "string" ? body.orgId : undefined,
      userId: typeof body.userId === "string" ? body.userId : undefined,
      appVersion: typeof body.appVersion === "string" ? body.appVersion : undefined,
      deviceId: typeof body.deviceId === "string" ? body.deviceId : undefined,
      launchId: typeof body.launchId === "string" ? body.launchId : undefined,
      runtime: coerceStringArray(body.runtime, coerceRuntime),
      level: coerceStringArray(body.level, coerceRuntimeLogLevel),
      city: typeof body.city === "string" ? body.city : undefined,
      region: typeof body.region === "string" ? body.region : undefined,
      countryCode: typeof body.countryCode === "string" ? body.countryCode : undefined,
      query: typeof body.query === "string" ? body.query : undefined,
      cursor: typeof body.cursor === "string" ? body.cursor : undefined,
      limit: typeof body.limit === "number" ? body.limit : undefined,
    };

    return NextResponse.json(await queryRuntimeLogs(filters));
  } catch (error) {
    return handleApiError(error);
  }
}
