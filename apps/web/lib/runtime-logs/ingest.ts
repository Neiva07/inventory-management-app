import {
  byteLength,
  isPublicIngestEventAllowed,
  normalizeRuntimeLogEvent,
  RUNTIME_LOG_LIMITS,
  type RuntimeLogEvent,
  type RuntimeLogIngestResponse,
} from "@stockify/runtime-logging";
import { requireOrgMembership } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { isRuntimeLogsLocalDevelopmentRequest } from "./access";
import { getRuntimeLogNetworkMetadata } from "./network";
import { insertRuntimeLogEvents, pruneRuntimeLogs } from "./store";

type IngestLane = "public" | "authenticated";

interface ProcessRuntimeLogIngestOptions {
  request: Request;
  lane: IngestLane;
  authenticatedUserId?: string;
}

const publicRateLimitBuckets = new Map<string, number[]>();

const rateLimitPublicIngest = (request: Request, deviceId: string): void => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${ip}:${deviceId}`;
  const now = Date.now();
  const windowStart = now - 10 * 60 * 1000;
  const bucket = (publicRateLimitBuckets.get(key) ?? []).filter((timestamp) => timestamp >= windowStart);

  if (bucket.length >= 120) {
    throw new ApiError(429, "Runtime log public ingest rate limit exceeded");
  }

  bucket.push(now);
  publicRateLimitBuckets.set(key, bucket);
};

const readJsonBody = async (request: Request, maxBytes: number): Promise<unknown> => {
  const text = await request.text();
  if (byteLength(text) > maxBytes) {
    throw new ApiError(413, "Request body too large");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
};

const getString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || value.length === 0) {
    throw new ApiError(400, `Missing required field: ${field}`);
  }
  return value;
};

const getBoolean = (value: unknown, field: string): boolean => {
  if (typeof value !== "boolean") {
    throw new ApiError(400, `Missing required field: ${field}`);
  }
  return value;
};

const validateOrgAccess = async (userId: string, events: RuntimeLogEvent[]): Promise<Set<string>> => {
  const orgIds = [...new Set(events.map((event) => event.orgId).filter((orgId): orgId is string => Boolean(orgId)))];
  const allowed = new Set<string>();

  for (const orgId of orgIds) {
    await requireOrgMembership(userId, orgId);
    allowed.add(orgId);
  }

  return allowed;
};

export const processRuntimeLogIngest = async ({
  request,
  lane,
  authenticatedUserId,
}: ProcessRuntimeLogIngestOptions): Promise<RuntimeLogIngestResponse> => {
  const maxBodyBytes = lane === "public" ? RUNTIME_LOG_LIMITS.publicBodyMaxBytes : 1024 * 1024;
  const body = await readJsonBody(request, maxBodyBytes);

  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Invalid runtime log ingest body");
  }

  const record = body as Record<string, unknown>;
  const deviceId = getString(record.deviceId, "deviceId");
  const launchId = getString(record.launchId, "launchId");
  const appVersion = getString(record.appVersion, "appVersion");
  const platform = getString(record.platform, "platform");
  const arch = getString(record.arch, "arch");
  const isPackaged = getBoolean(record.isPackaged, "isPackaged");

  if (lane === "public") {
    rateLimitPublicIngest(request, deviceId);
  }

  if (!Array.isArray(record.events)) {
    throw new ApiError(400, "events must be an array");
  }

  const maxEvents = lane === "public" ? RUNTIME_LOG_LIMITS.publicBatchSize : RUNTIME_LOG_LIMITS.batchSize;
  if (record.events.length > maxEvents) {
    throw new ApiError(413, `Too many events; max ${maxEvents}`);
  }

  const normalized: RuntimeLogEvent[] = [];
  const rejected: Array<{ id?: string; reason: string }> = [];

  for (const rawEvent of record.events) {
    const rawId = rawEvent && typeof rawEvent === "object" && "id" in rawEvent
      ? String((rawEvent as { id?: unknown }).id ?? "")
      : undefined;
    const event = normalizeRuntimeLogEvent(rawEvent, { strictPublicPayload: lane === "public" });

    if (!event) {
      rejected.push({ id: rawId, reason: "invalid_event" });
      continue;
    }

    if (
      event.deviceId !== deviceId ||
      event.launchId !== launchId ||
      event.appVersion !== appVersion ||
      event.platform !== platform ||
      event.arch !== arch ||
      event.isPackaged !== isPackaged
    ) {
      rejected.push({ id: event.id, reason: "context_mismatch" });
      continue;
    }

    if (lane === "public") {
      const original = rawEvent as Partial<RuntimeLogEvent>;
      if (original.userId || original.orgId) {
        rejected.push({ id: event.id, reason: "identity_spoofing_not_allowed" });
        continue;
      }
      if (!isPublicIngestEventAllowed(event)) {
        rejected.push({ id: event.id, reason: "event_code_not_allowed_pre_auth" });
        continue;
      }
      event.userId = null;
      event.orgId = null;
      event.membershipRole = null;
    }

    if (lane === "authenticated") {
      event.userId = authenticatedUserId ?? null;
      event.authState = "authenticated";
    }

    normalized.push(event);
  }

  if (lane === "authenticated" && authenticatedUserId && !isRuntimeLogsLocalDevelopmentRequest(request)) {
    await validateOrgAccess(authenticatedUserId, normalized);
  }

  const receivedAt = Date.now();
  const network = getRuntimeLogNetworkMetadata(request);
  await insertRuntimeLogEvents(
    normalized.map((event) => ({
      ...event,
      receivedAt,
      ingestLane: lane,
      network,
    })),
  );

  void pruneRuntimeLogs().catch((error) => {
    console.error("Failed to prune runtime logs:", error);
  });

  return {
    accepted: normalized.length,
    rejected,
    serverTimestamp: receivedAt,
  };
};
