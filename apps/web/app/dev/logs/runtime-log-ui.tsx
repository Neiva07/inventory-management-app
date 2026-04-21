import * as React from "react";
import type { RuntimeLogEvent, RuntimeLogLevel } from "@stockify/runtime-logging";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type RuntimeLogDisplayEntry = RuntimeLogEvent & {
  receivedAt?: number;
  ingestLane?: string;
  rawIp?: string | null;
  countryCode?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
  asn?: string | null;
  networkProvider?: string | null;
};

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

interface ParsedFact {
  label: string;
  value: string;
  tone?: BadgeVariant;
}

interface ParsedLogEntry {
  title: string;
  message: string;
  family: string;
  facts: ParsedFact[];
  drawerFacts: ParsedFact[];
}

const levelOrder: Record<RuntimeLogLevel, number> = {
  fatal: 5,
  error: 4,
  warn: 3,
  info: 2,
  debug: 1,
};

const levelBadgeVariant: Record<RuntimeLogLevel, BadgeVariant> = {
  fatal: "destructive",
  error: "destructive",
  warn: "default",
  info: "secondary",
  debug: "outline",
};

const levelBorderClass: Record<RuntimeLogLevel, string> = {
  fatal: "border-l-destructive",
  error: "border-l-destructive",
  warn: "border-l-primary",
  info: "border-l-border",
  debug: "border-l-muted",
};

const statusLabels: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  408: "Timeout",
  409: "Conflict",
  429: "Rate Limited",
  500: "Server Error",
  502: "Bad Gateway",
  503: "Unavailable",
  504: "Gateway Timeout",
};

export const formatLogDate = (value: number) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));

export const formatDuration = (value: number) => {
  if (value < 1000) return `${value}ms`;
  const seconds = Math.round(value / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
};

export const countByLevel = (entries: RuntimeLogDisplayEntry[]) => {
  return entries.reduce<Record<RuntimeLogLevel, number>>(
    (counts, entry) => {
      counts[entry.level] += 1;
      return counts;
    },
    { debug: 0, info: 0, warn: 0, error: 0, fatal: 0 },
  );
};

export const highestLevel = (entries: RuntimeLogDisplayEntry[]): RuntimeLogLevel | null => {
  return entries.reduce<RuntimeLogLevel | null>((current, entry) => {
    if (!current || levelOrder[entry.level] > levelOrder[current]) {
      return entry.level;
    }
    return current;
  }, null);
};

export const shortId = (value?: string | null) => {
  if (!value) return null;
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
};

const firstLine = (value: string) => value.split(/\r?\n/).find((line) => line.trim().length > 0)?.trim() ?? value.trim();

const normalizeConsoleMessage = (value: string) => {
  return value
    .replace(/%c/g, "")
    .replace(/\s*font-weight\s*:\s*bold\s*;?/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const getNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return null;
};

const extractHttpStatus = (entry: RuntimeLogDisplayEntry): number | null => {
  const payload = entry.payload ?? {};
  const payloadStatus =
    getNumber(payload.status) ??
    getNumber(payload.statusCode) ??
    getNumber(payload.httpStatus) ??
    getNumber(payload.responseStatus);
  if (payloadStatus) return payloadStatus;

  const source = [entry.message, entry.error?.message, entry.error?.cause].filter(Boolean).join(" ");
  const match = source.match(/\bstatus(?:\s+code)?\s+(\d{3})\b/i) ?? source.match(/\bHTTP\s+(\d{3})\b/i);
  return match ? Number(match[1]) : null;
};

const statusLabel = (status: number) => statusLabels[status] ?? (status >= 500 ? "Server Error" : status >= 400 ? "Client Error" : "HTTP");

const getEventFamily = (eventCode: string) => {
  const [family] = eventCode.split(".");
  return family || "runtime";
};

const getConnectivityState = (entry: RuntimeLogDisplayEntry): string | null => {
  const online = entry.payload?.online;
  if (typeof online === "boolean") return online ? "online" : "offline";
  if (entry.eventCode.includes("connectivity.online")) return "online";
  if (entry.eventCode.includes("connectivity.offline")) return "offline";
  return null;
};

const formatValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : null;
  if (typeof value === "string") return value.trim() || null;
  return null;
};

const addFact = (facts: ParsedFact[], label: string, value: unknown, tone?: BadgeVariant) => {
  const formatted = formatValue(value);
  if (formatted) {
    facts.push({ label, value: formatted, tone });
  }
};

const getTitle = (entry: RuntimeLogDisplayEntry, message: string, status: number | null) => {
  if (status) return `HTTP ${status} ${statusLabel(status)}`;
  if (/electron security warning/i.test(message)) return "Electron security warning";
  if (/react devtools/i.test(message)) return "React DevTools hint";
  if (entry.eventCode.includes("unhandled_rejection")) return "Unhandled promise rejection";
  if (entry.eventCode.includes("uncaught_exception")) return "Uncaught runtime exception";
  if (entry.eventCode.startsWith("connectivity.")) return `Connectivity ${getConnectivityState(entry) ?? "changed"}`;
  if (entry.eventCode.startsWith("auth.")) return "Authentication event";
  return firstLine(message);
};

export const parseRuntimeLogEntry = (entry: RuntimeLogDisplayEntry): ParsedLogEntry => {
  const message = normalizeConsoleMessage(entry.message);
  const family = getEventFamily(entry.eventCode);
  const status = extractHttpStatus(entry);
  const facts: ParsedFact[] = [];
  const drawerFacts: ParsedFact[] = [];
  const connectivity = getConnectivityState(entry);

  if (status) addFact(facts, "HTTP", `${status} ${statusLabel(status)}`, status >= 400 ? "destructive" : "secondary");
  addFact(facts, "event", entry.eventCode, "outline");
  if (entry.error?.name) addFact(facts, "error", entry.error.name, entry.level === "error" || entry.level === "fatal" ? "destructive" : "outline");
  if (entry.error?.code) addFact(facts, "code", entry.error.code, "outline");
  if (connectivity) addFact(facts, "network", connectivity, connectivity === "offline" ? "default" : "secondary");
  if (entry.repeatCount && entry.repeatCount > 1) addFact(facts, "repeat", `x${entry.repeatCount}`, "secondary");

  addFact(drawerFacts, "route", entry.route);
  addFact(drawerFacts, "auth", entry.authState);
  addFact(drawerFacts, "user", entry.userId);
  addFact(drawerFacts, "org", entry.orgId);
  addFact(drawerFacts, "device", entry.deviceId);
  addFact(drawerFacts, "launch", entry.launchId);
  addFact(drawerFacts, "runtime instance", entry.runtimeInstanceId);
  addFact(drawerFacts, "app", entry.appVersion);
  addFact(drawerFacts, "platform", `${entry.platform}/${entry.arch}`);
  addFact(drawerFacts, "ingest", entry.ingestLane);
  addFact(drawerFacts, "location", [entry.city, entry.region, entry.countryCode].filter(Boolean).join(", "));
  addFact(drawerFacts, "provider", entry.networkProvider ?? entry.asn);
  addFact(drawerFacts, "received", entry.receivedAt ? formatLogDate(entry.receivedAt) : null);

  for (const key of ["method", "url", "path", "operation", "phase", "component", "reason", "effectiveType", "downlink", "rtt"]) {
    addFact(drawerFacts, key, entry.payload?.[key]);
  }

  return {
    title: getTitle(entry, message, status),
    message,
    family,
    facts,
    drawerFacts,
  };
};

export function RuntimeLogLevelBadge({ level }: { level: RuntimeLogLevel }) {
  return <Badge variant={levelBadgeVariant[level]}>{level.toUpperCase()}</Badge>;
}

export function RuntimeLogEntryCard({
  entry,
  actions,
  showIdentity = true,
}: {
  entry: RuntimeLogDisplayEntry;
  actions?: React.ReactNode;
  showIdentity?: boolean;
}) {
  const parsed = parseRuntimeLogEntry(entry);
  const identity = [
    ["launch", shortId(entry.launchId), entry.launchId],
    ["device", shortId(entry.deviceId), entry.deviceId],
    ["org", shortId(entry.orgId), entry.orgId],
    ["user", shortId(entry.userId), entry.userId],
  ].filter(([, value]) => Boolean(value));

  return (
    <Card className={cn("overflow-hidden rounded-lg border-l-4 shadow-sm", levelBorderClass[entry.level])}>
      <CardContent className="p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{formatLogDate(entry.timestamp)}</span>
              <RuntimeLogLevelBadge level={entry.level} />
              <Badge variant="outline">{entry.runtime}</Badge>
              <Badge variant="secondary">{parsed.family}</Badge>
              {entry.route ? <Badge variant="outline">{entry.route}</Badge> : null}
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <h2 className="break-words text-base font-semibold leading-6">{parsed.title}</h2>
              {parsed.message !== parsed.title ? (
                <p className="break-words text-sm leading-6 text-muted-foreground">{parsed.message}</p>
              ) : null}
              {entry.error?.message && entry.error.message !== entry.message ? (
                <p className="break-words text-sm leading-6">
                  {entry.error.name ? `${entry.error.name}: ` : ""}
                  {entry.error.message}
                </p>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {parsed.facts.map((fact) => (
                <Badge key={`${fact.label}:${fact.value}`} variant={fact.tone ?? "outline"}>
                  <span className="opacity-70">{fact.label}</span>
                  {fact.value}
                </Badge>
              ))}
            </div>

            {showIdentity ? (
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
                {identity.map(([label, value, fullValue]) => (
                  <div key={`${label}:${fullValue}`} className="min-w-0 rounded-md border bg-muted/30 px-2.5 py-2">
                    <div className="text-muted-foreground">{label}</div>
                    <div className="truncate font-medium" title={fullValue ?? undefined}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {actions ? <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">{actions}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function RuntimeLogDetails({ entry }: { entry: RuntimeLogDisplayEntry }) {
  const parsed = parseRuntimeLogEntry(entry);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 pb-4">
      <div className="rounded-lg border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <RuntimeLogLevelBadge level={entry.level} />
          <Badge variant="outline">{entry.runtime}</Badge>
          <Badge variant="secondary">{entry.eventCode}</Badge>
        </div>
        <h3 className="mt-3 break-words text-base font-semibold">{parsed.title}</h3>
        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">{parsed.message}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {parsed.drawerFacts.map((fact) => (
          <div key={`${fact.label}:${fact.value}`} className="min-w-0 rounded-md border bg-muted/30 px-3 py-2">
            <div className="text-xs text-muted-foreground">{fact.label}</div>
            <div className="truncate text-sm font-medium" title={fact.value}>
              {fact.value}
            </div>
          </div>
        ))}
      </div>

      {entry.error?.stack ? (
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Stack</div>
          <pre className="overflow-auto rounded-lg border bg-muted/30 p-3 text-xs leading-5">{entry.error.stack}</pre>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="text-sm font-medium">JSON</div>
        <pre className="overflow-auto rounded-lg border bg-muted/30 p-3 text-xs leading-5">
          {JSON.stringify(entry, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export function RuntimeLogStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: RuntimeLogLevel;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", tone ? `border-l-4 ${levelBorderClass[tone]}` : "")}>
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-2xl font-semibold">{value}</div>
    </div>
  );
}
