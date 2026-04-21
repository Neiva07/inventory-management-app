"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeftIcon, DownloadIcon, RefreshCcwIcon } from "lucide-react";
import type { LaunchSummary } from "@stockify/runtime-logging";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import {
  RuntimeLogDetails,
  RuntimeLogEntryCard,
  RuntimeLogLevelBadge,
  RuntimeLogStat,
  countByLevel,
  formatDuration,
  formatLogDate,
  highestLevel,
  shortId,
  type RuntimeLogDisplayEntry,
} from "../runtime-log-ui";

interface LaunchResponse {
  summary: LaunchSummary;
  entries: RuntimeLogDisplayEntry[];
}

export function RuntimeLogLaunchClient({ launchId }: { launchId: string }) {
  const [data, setData] = React.useState<LaunchResponse | null>(null);
  const [selectedEntry, setSelectedEntry] = React.useState<RuntimeLogDisplayEntry | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/runtime-logs/launches/${encodeURIComponent(launchId)}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load launch");
      }
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load launch");
    } finally {
      setLoading(false);
    }
  }, [launchId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const exportLaunch = () => {
    window.open(`/api/v1/runtime-logs/launches/${encodeURIComponent(launchId)}/export`, "_blank", "noopener,noreferrer");
  };

  const levelCounts = React.useMemo(() => countByLevel(data?.entries ?? []), [data?.entries]);
  const topLevel = React.useMemo(() => highestLevel(data?.entries ?? []), [data?.entries]);
  const runtimeCounts = React.useMemo(() => {
    return (data?.entries ?? []).reduce<Record<string, number>>((counts, entry) => {
      counts[entry.runtime] = (counts[entry.runtime] ?? 0) + 1;
      return counts;
    }, {});
  }, [data?.entries]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/dev/logs" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ArrowLeftIcon data-icon="inline-start" />
            Logs
          </Link>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {topLevel ? <RuntimeLogLevelBadge level={topLevel} /> : null}
              <Badge variant="outline">launch</Badge>
              {data?.summary?.finalOrgId ? <Badge variant="secondary">org {shortId(data.summary.finalOrgId)}</Badge> : null}
            </div>
            <h1 className="break-all text-3xl font-semibold tracking-tight">{launchId}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCcwIcon data-icon="inline-start" />
            Refresh
          </Button>
          <Button onClick={exportLaunch}>
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      {data?.summary ? (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <RuntimeLogStat label="Events" value={data.entries.length} tone={topLevel ?? undefined} />
            <RuntimeLogStat label="Errors" value={levelCounts.error + levelCounts.fatal} tone={levelCounts.error + levelCounts.fatal ? "error" : undefined} />
            <RuntimeLogStat label="Warnings" value={levelCounts.warn} tone={levelCounts.warn ? "warn" : undefined} />
            <RuntimeLogStat label="Offline" value={formatDuration(data.summary.offlineDurationMs)} tone={data.summary.endedOffline ? "warn" : undefined} />
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-1.5">
                  <CardTitle>Launch Summary</CardTitle>
                  <CardDescription>
                    {formatLogDate(data.summary.firstSeenAt)} to {formatLogDate(data.summary.lastSeenAt)}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(runtimeCounts).map(([runtime, count]) => (
                    <Badge key={runtime} variant="outline">{runtime} {count}</Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
              <SummaryItem label="Device" value={data.summary.deviceId} />
              <SummaryItem label="App" value={data.summary.appVersion} />
              <SummaryItem label="Platform" value={`${data.summary.platform}/${data.summary.arch}`} />
              <SummaryItem label="User" value={data.summary.finalUserId ?? "pre-auth"} />
              <SummaryItem label="Org" value={data.summary.finalOrgId ?? "none"} />
              <SummaryItem label="Started Offline" value={String(data.summary.startedOffline ?? "unknown")} />
              <SummaryItem label="Ended Offline" value={String(data.summary.endedOffline ?? "unknown")} />
              <SummaryItem label="Transitions" value={String(data.summary.transitionCount)} />
              <SummaryItem label="Online" value={formatDuration(data.summary.onlineDurationMs)} />
              <SummaryItem label="Longest Offline" value={formatDuration(data.summary.longestOfflineStreakMs)} />
              <SummaryItem label="Location" value={[data.summary.city, data.summary.region, data.summary.countryCode].filter(Boolean).join(", ") || "unknown"} />
              <SummaryItem label="Network" value={data.summary.networkProvider ?? data.summary.asn ?? "unknown"} />
            </CardContent>
          </Card>
        </>
      ) : null}

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Timeline</h2>
          <p className="text-sm text-muted-foreground">Events are ordered from launch start to latest observation.</p>
        </div>

        {data?.entries.map((entry) => (
          <RuntimeLogEntryCard
            key={entry.id}
            entry={entry}
            showIdentity={false}
            actions={(
              <Button variant="outline" size="sm" onClick={() => setSelectedEntry(entry)}>
                Inspect
              </Button>
            )}
          />
        ))}
      </div>

      <Drawer open={selectedEntry !== null} onOpenChange={(open) => !open && setSelectedEntry(null)} direction="right">
        <DrawerContent className="flex w-full flex-col sm:max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Timeline Entry</DrawerTitle>
          </DrawerHeader>
          {selectedEntry ? <RuntimeLogDetails entry={selectedEntry} /> : null}
        </DrawerContent>
      </Drawer>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-medium">{value}</div>
    </div>
  );
}
