export type RuntimeLogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type RuntimeLogRuntime = "main" | "preload" | "renderer";
export type RuntimeAuthState =
  | "unknown"
  | "pre_auth"
  | "authenticating"
  | "authenticated"
  | "logged_out";

export interface RuntimeConnectivityState {
  online: boolean;
  navigatorOnLine?: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  connectionType?: string;
  observedAt: number;
}

export interface RuntimeLogError {
  name?: string;
  message?: string;
  stack?: string;
  code?: string;
  cause?: string;
}

export interface RuntimeLogEvent {
  id: string;
  timestamp: number;
  level: RuntimeLogLevel;
  runtime: RuntimeLogRuntime;
  runtimeInstanceId: string;
  eventCode: string;
  message: string;
  payload?: Record<string, unknown>;
  error?: RuntimeLogError;
  route?: string | null;
  deviceId: string;
  launchId: string;
  syncClientId?: string | null;
  appVersion: string;
  platform: string;
  arch: string;
  isPackaged: boolean;
  authState: RuntimeAuthState;
  userId?: string | null;
  orgId?: string | null;
  membershipRole?: string | null;
  repeatCount?: number;
}

export interface RuntimeLogContextUpdate {
  userId?: string | null;
  orgId?: string | null;
  membershipRole?: string | null;
  route?: string | null;
  authState?: RuntimeAuthState;
  syncClientId?: string | null;
  connectivity?: RuntimeConnectivityState | null;
  sessionId?: string | null;
}

export interface RuntimeLaunchContext {
  deviceId: string;
  launchId: string;
  appVersion: string;
  platform: string;
  arch: string;
  isPackaged: boolean;
  userId?: string | null;
  orgId?: string | null;
  membershipRole?: string | null;
  route?: string | null;
  authState: RuntimeAuthState;
  syncClientId?: string | null;
  connectivity?: RuntimeConnectivityState | null;
}

export interface RuntimeLogIngestRequest {
  deviceId: string;
  launchId: string;
  appVersion: string;
  platform: string;
  arch: string;
  isPackaged: boolean;
  events: RuntimeLogEvent[];
}

export interface RuntimeLogIngestResponse {
  accepted: number;
  rejected: Array<{ id?: string; reason: string }>;
  serverTimestamp: number;
}

export interface LaunchSummary {
  launchId: string;
  deviceId: string;
  firstSeenAt: number;
  lastSeenAt: number;
  appVersion: string;
  platform: string;
  arch: string;
  authBecameAvailableAt?: number | null;
  finalUserId?: string | null;
  finalOrgId?: string | null;
  startedOffline?: boolean | null;
  endedOffline?: boolean | null;
  transitionCount: number;
  offlineDurationMs: number;
  onlineDurationMs: number;
  longestOfflineStreakMs: number;
  lastConnectivityChangeAt?: number | null;
  lastKnownConnectivityState?: string | null;
  countryCode?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
  asn?: string | null;
  networkProvider?: string | null;
  rawIp?: string | null;
}

export interface RuntimeLogQueryRequest {
  from?: number;
  to?: number;
  orgId?: string;
  userId?: string;
  appVersion?: string;
  deviceId?: string;
  launchId?: string;
  runtime?: RuntimeLogRuntime[];
  level?: RuntimeLogLevel[];
  city?: string;
  region?: string;
  countryCode?: string;
  query?: string;
  cursor?: string;
  limit?: number;
}

export interface RuntimeLogQueryResponse {
  entries: RuntimeLogEvent[];
  nextCursor: string | null;
}

export const RUNTIME_LOG_LIMITS = {
  batchSize: 100,
  publicBatchSize: 50,
  flushIntervalMs: 10_000,
  messageMaxBytes: 4 * 1024,
  payloadMaxBytes: 16 * 1024,
  publicBodyMaxBytes: 256 * 1024,
  localOutboxMaxRows: 20_000,
  localOutboxMaxBytes: 100 * 1024 * 1024,
  localRawRetentionDays: 7,
  localRawRetentionBytes: 250 * 1024 * 1024,
  centralRetentionDays: 30,
} as const;

export const RUNTIME_EVENT_CODES = {
  appStartup: "app.startup",
  appReady: "app.ready",
  preloadReady: "preload.ready",
  rendererBoot: "renderer.boot",
  authLoginBegin: "auth.login_begin",
  authLoginFailed: "auth.login_failed",
  authCallbackFailed: "auth.callback_failed",
  bridgeIpcError: "bridge.ipc_error",
  updaterCheckFailed: "updater.check_failed",
  connectivityOnline: "connectivity.online",
  connectivityOffline: "connectivity.offline",
  connectivityChanged: "connectivity.changed",
  consoleDebug: "console.debug",
  consoleInfo: "console.info",
  consoleWarn: "console.warn",
  consoleError: "console.error",
  runtimeUncaughtException: "runtime.uncaught_exception",
  runtimeUnhandledRejection: "runtime.unhandled_rejection",
  rendererWindowError: "renderer.window_error",
  rendererUnhandledRejection: "renderer.unhandled_rejection",
  logBackpressure: "log.backpressure",
  diagnosticsExport: "diagnostics.export",
} as const;

export const PUBLIC_INFO_EVENT_ALLOWLIST = new Set<string>([
  RUNTIME_EVENT_CODES.appStartup,
  RUNTIME_EVENT_CODES.appReady,
  RUNTIME_EVENT_CODES.preloadReady,
  RUNTIME_EVENT_CODES.rendererBoot,
  RUNTIME_EVENT_CODES.authLoginBegin,
  RUNTIME_EVENT_CODES.authLoginFailed,
  RUNTIME_EVENT_CODES.authCallbackFailed,
  RUNTIME_EVENT_CODES.bridgeIpcError,
  RUNTIME_EVENT_CODES.updaterCheckFailed,
  RUNTIME_EVENT_CODES.connectivityOnline,
  RUNTIME_EVENT_CODES.connectivityOffline,
  RUNTIME_EVENT_CODES.connectivityChanged,
]);

const SECRET_KEY_PATTERN =
  /(authorization|bearer|cookie|password|secret|token|session|clerk|api[_-]?key|credential|certificate|private[_-]?key|tax|document|cpf|cnpj|email|phone)/i;

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const COOKIE_PATTERN = /\b(cookie|set-cookie)\s*:\s*[^;\n]+/gi;
const PEM_PATTERN = /-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g;

export const byteLength = (value: string): number => new TextEncoder().encode(value).length;

export const truncateUtf8 = (value: string, maxBytes: number): string => {
  if (byteLength(value) <= maxBytes) {
    return value;
  }

  let result = value.slice(0, maxBytes);
  while (byteLength(result) > maxBytes - 16 && result.length > 0) {
    result = result.slice(0, -1);
  }
  return `${result}[truncated]`;
};

export const redactString = (value: string): string => {
  return value
    .replace(PEM_PATTERN, "[redacted-certificate]")
    .replace(BEARER_PATTERN, "Bearer [redacted]")
    .replace(COOKIE_PATTERN, "$1: [redacted]")
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(PHONE_PATTERN, "[redacted-phone]");
};

export const sanitizeError = (error: unknown): RuntimeLogError | undefined => {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    const withCode = error as Error & { code?: unknown; cause?: unknown };
    return {
      name: redactString(error.name),
      message: truncateUtf8(redactString(error.message), RUNTIME_LOG_LIMITS.messageMaxBytes),
      stack: error.stack ? truncateUtf8(redactString(error.stack), RUNTIME_LOG_LIMITS.payloadMaxBytes) : undefined,
      code: typeof withCode.code === "string" ? redactString(withCode.code) : undefined,
      cause: withCode.cause ? truncateUtf8(redactString(String(withCode.cause)), 1024) : undefined,
    };
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    return {
      name: typeof record.name === "string" ? redactString(record.name) : undefined,
      message:
        typeof record.message === "string"
          ? truncateUtf8(redactString(record.message), RUNTIME_LOG_LIMITS.messageMaxBytes)
          : truncateUtf8(redactString(String(error)), RUNTIME_LOG_LIMITS.messageMaxBytes),
      stack:
        typeof record.stack === "string"
          ? truncateUtf8(redactString(record.stack), RUNTIME_LOG_LIMITS.payloadMaxBytes)
          : undefined,
      code: typeof record.code === "string" ? redactString(record.code) : undefined,
    };
  }

  return {
    message: truncateUtf8(redactString(String(error)), RUNTIME_LOG_LIMITS.messageMaxBytes),
  };
};

export const sanitizePayload = (
  value: unknown,
  options: { depth?: number; maxBytes?: number } = {},
): Record<string, unknown> | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const maxDepth = options.depth ?? 4;
  const maxBytes = options.maxBytes ?? RUNTIME_LOG_LIMITS.payloadMaxBytes;

  const visit = (input: unknown, depth: number): unknown => {
    if (depth > maxDepth) {
      return "[redacted-depth]";
    }
    if (input === null || input === undefined) {
      return input;
    }
    if (typeof input === "string") {
      return truncateUtf8(redactString(input), 2048);
    }
    if (typeof input === "number" || typeof input === "boolean") {
      return input;
    }
    if (typeof input === "bigint") {
      return input.toString();
    }
    if (Array.isArray(input)) {
      return input.slice(0, 25).map((item) => visit(item, depth + 1));
    }
    if (typeof input === "object") {
      const output: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(input as Record<string, unknown>).slice(0, 50)) {
        if (SECRET_KEY_PATTERN.test(key)) {
          output[key] = "[redacted]";
        } else {
          output[key] = visit(child, depth + 1);
        }
      }
      return output;
    }
    return truncateUtf8(redactString(String(input)), 2048);
  };

  const sanitized = visit(value, 0) as Record<string, unknown>;
  const serialized = JSON.stringify(sanitized);
  if (byteLength(serialized) <= maxBytes) {
    return sanitized;
  }

  return {
    truncated: true,
    originalBytes: byteLength(serialized),
    preview: truncateUtf8(serialized, maxBytes),
  };
};

export const formatConsoleArgs = (args: unknown[]): { message: string; payload?: Record<string, unknown>; error?: RuntimeLogError } => {
  const parts: string[] = [];
  let firstError: RuntimeLogError | undefined;
  const extra: unknown[] = [];

  for (const arg of args) {
    if (arg instanceof Error && !firstError) {
      firstError = sanitizeError(arg);
      parts.push(arg.message);
      continue;
    }

    if (typeof arg === "string") {
      parts.push(arg);
      continue;
    }

    if (typeof arg === "number" || typeof arg === "boolean" || arg === null || arg === undefined) {
      parts.push(String(arg));
      continue;
    }

    extra.push(arg);
    try {
      parts.push(JSON.stringify(sanitizePayload({ value: arg })?.value ?? arg));
    } catch {
      parts.push(String(arg));
    }
  }

  const payload = extra.length ? sanitizePayload({ args: extra }) : undefined;
  const message = parts.join(" ");

  return {
    message: truncateUtf8(redactString(message || "(empty console message)"), RUNTIME_LOG_LIMITS.messageMaxBytes),
    payload,
    error: firstError,
  };
};

export const isPublicIngestEventAllowed = (event: Pick<RuntimeLogEvent, "level" | "eventCode">): boolean => {
  if (event.level === "warn" || event.level === "error" || event.level === "fatal") {
    return true;
  }
  if (event.level === "info") {
    return PUBLIC_INFO_EVENT_ALLOWLIST.has(event.eventCode) || event.eventCode.startsWith("connectivity.");
  }
  return false;
};

export const buildRuntimeLogSearchText = (event: Pick<RuntimeLogEvent, "message" | "eventCode" | "error" | "route" | "payload">): string => {
  const parts = [
    event.message,
    event.eventCode,
    event.error?.name,
    event.error?.message,
    event.route ?? undefined,
  ];

  if (event.payload) {
    for (const [key, value] of Object.entries(event.payload)) {
      if (typeof value === "string" && /^(status|reason|code|phase|component|operation|url|path)$/i.test(key)) {
        parts.push(value);
      }
    }
  }

  return parts.filter(Boolean).join(" ").slice(0, 8192);
};

export const coerceRuntimeLogLevel = (value: unknown): RuntimeLogLevel | null => {
  return value === "debug" || value === "info" || value === "warn" || value === "error" || value === "fatal"
    ? value
    : null;
};

export const coerceRuntime = (value: unknown): RuntimeLogRuntime | null => {
  return value === "main" || value === "preload" || value === "renderer" ? value : null;
};

export const normalizeRuntimeLogEvent = (
  value: unknown,
  options: { strictPublicPayload?: boolean } = {},
): RuntimeLogEvent | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const input = value as Partial<RuntimeLogEvent>;
  const level = coerceRuntimeLogLevel(input.level);
  const runtime = coerceRuntime(input.runtime);

  if (
    !input.id ||
    typeof input.id !== "string" ||
    typeof input.timestamp !== "number" ||
    !level ||
    !runtime ||
    typeof input.runtimeInstanceId !== "string" ||
    typeof input.eventCode !== "string" ||
    typeof input.message !== "string" ||
    typeof input.deviceId !== "string" ||
    typeof input.launchId !== "string" ||
    typeof input.appVersion !== "string" ||
    typeof input.platform !== "string" ||
    typeof input.arch !== "string" ||
    typeof input.isPackaged !== "boolean"
  ) {
    return null;
  }

  const authState: RuntimeAuthState =
    input.authState === "pre_auth" ||
    input.authState === "authenticating" ||
    input.authState === "authenticated" ||
    input.authState === "logged_out"
      ? input.authState
      : "unknown";

  return {
    id: input.id,
    timestamp: input.timestamp,
    level,
    runtime,
    runtimeInstanceId: input.runtimeInstanceId,
    eventCode: truncateUtf8(redactString(input.eventCode), 256),
    message: truncateUtf8(redactString(input.message), RUNTIME_LOG_LIMITS.messageMaxBytes),
    payload: sanitizePayload(input.payload, {
      depth: options.strictPublicPayload ? 2 : 4,
      maxBytes: options.strictPublicPayload ? 4096 : RUNTIME_LOG_LIMITS.payloadMaxBytes,
    }),
    error: sanitizeError(input.error),
    route: input.route ? truncateUtf8(redactString(String(input.route)), 512) : null,
    deviceId: truncateUtf8(redactString(input.deviceId), 128),
    launchId: truncateUtf8(redactString(input.launchId), 128),
    syncClientId: input.syncClientId ? truncateUtf8(redactString(String(input.syncClientId)), 128) : null,
    appVersion: truncateUtf8(redactString(input.appVersion), 64),
    platform: truncateUtf8(redactString(input.platform), 64),
    arch: truncateUtf8(redactString(input.arch), 64),
    isPackaged: input.isPackaged,
    authState,
    userId: input.userId ? truncateUtf8(redactString(String(input.userId)), 128) : null,
    orgId: input.orgId ? truncateUtf8(redactString(String(input.orgId)), 128) : null,
    membershipRole: input.membershipRole ? truncateUtf8(redactString(String(input.membershipRole)), 64) : null,
    repeatCount: Math.max(1, Number(input.repeatCount ?? 1) || 1),
  };
};

export const makeRuntimeId = (prefix: string): string => {
  const cryptoLike = globalThis.crypto;
  if (cryptoLike?.randomUUID) {
    return `${prefix}_${cryptoLike.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};
