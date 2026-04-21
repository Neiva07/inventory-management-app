"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowRightIcon, RefreshCcwIcon, SearchIcon } from "lucide-react";
import type { RuntimeLogLevel, RuntimeLogRuntime } from "@stockify/runtime-logging";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  RuntimeLogDetails,
  RuntimeLogEntryCard,
  RuntimeLogStat,
  countByLevel,
  highestLevel,
  type RuntimeLogDisplayEntry,
} from "./runtime-log-ui";

type RuntimeLogRow = RuntimeLogDisplayEntry & {
  ingestLane?: string;
  rawIp?: string | null;
  countryCode?: string | null;
  region?: string | null;
  city?: string | null;
};

const runtimeOptions: RuntimeLogRuntime[] = ["main", "preload", "renderer"];
const levelOptions: RuntimeLogLevel[] = ["debug", "info", "warn", "error", "fatal"];

const emptyFilters = {
  query: "",
  orgId: "",
  userId: "",
  appVersion: "",
  deviceId: "",
  launchId: "",
  countryCode: "",
  region: "",
  city: "",
};

export function RuntimeLogsClient() {
  const [filters, setFilters] = React.useState(emptyFilters);
  const [runtime, setRuntime] = React.useState<RuntimeLogRuntime[]>([]);
  const [level, setLevel] = React.useState<RuntimeLogLevel[]>(["warn", "error", "fatal"]);
  const [rows, setRows] = React.useState<RuntimeLogRow[]>([]);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [selectedRow, setSelectedRow] = React.useState<RuntimeLogRow | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const toggleRuntime = (value: RuntimeLogRuntime) => {
    setRuntime((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const toggleLevel = (value: RuntimeLogLevel) => {
    setLevel((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const load = React.useCallback(async (cursor?: string | null, append = false) => {
    setLoading(true);
    setError(null);

    const body = {
      ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value.trim().length > 0)),
      runtime: runtime.length ? runtime : undefined,
      level: level.length ? level : undefined,
      cursor: cursor ?? undefined,
      limit: 100,
    };

    try {
      const response = await fetch("/api/v1/runtime-logs/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to query runtime logs");
      }
      setRows((current) => append ? [...current, ...payload.entries] : payload.entries);
      setNextCursor(payload.nextCursor ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to query runtime logs");
    } finally {
      setLoading(false);
    }
  }, [filters, level, runtime]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const levelCounts = React.useMemo(() => countByLevel(rows), [rows]);
  const launchCount = React.useMemo(() => new Set(rows.map((row) => row.launchId)).size, [rows]);
  const deviceCount = React.useMemo(() => new Set(rows.map((row) => row.deviceId)).size, [rows]);
  const topLevel = React.useMemo(() => highestLevel(rows), [rows]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Runtime Logs</h1>
        <p className="text-sm text-muted-foreground">
          Search desktop launch timelines across startup, auth, connectivity, and runtime failures.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <RuntimeLogStat label="Loaded" value={rows.length} tone={topLevel ?? undefined} />
        <RuntimeLogStat label="Errors" value={levelCounts.error + levelCounts.fatal} tone={levelCounts.error + levelCounts.fatal ? "error" : undefined} />
        <RuntimeLogStat label="Warnings" value={levelCounts.warn} tone={levelCounts.warn ? "warn" : undefined} />
        <RuntimeLogStat label="Launches" value={`${launchCount} / ${deviceCount} devices`} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1.5">
              <CardTitle>Search</CardTitle>
              <CardDescription>Defaults to the last 30 days. Leave fields blank to broaden results.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {level.length ? <Badge variant="secondary">{level.length} levels</Badge> : <Badge variant="outline">all levels</Badge>}
              {runtime.length ? <Badge variant="secondary">{runtime.length} runtimes</Badge> : <Badge variant="outline">all runtimes</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Text search" value={filters.query} onChange={(event) => updateFilter("query", event.target.value)} />
            <Input placeholder="Org ID" value={filters.orgId} onChange={(event) => updateFilter("orgId", event.target.value)} />
            <Input placeholder="User ID" value={filters.userId} onChange={(event) => updateFilter("userId", event.target.value)} />
            <Input placeholder="App version" value={filters.appVersion} onChange={(event) => updateFilter("appVersion", event.target.value)} />
            <Input placeholder="Device ID" value={filters.deviceId} onChange={(event) => updateFilter("deviceId", event.target.value)} />
            <Input placeholder="Launch ID" value={filters.launchId} onChange={(event) => updateFilter("launchId", event.target.value)} />
            <Input placeholder="Country" value={filters.countryCode} onChange={(event) => updateFilter("countryCode", event.target.value)} />
            <Input placeholder="Region" value={filters.region} onChange={(event) => updateFilter("region", event.target.value)} />
            <Input placeholder="City" value={filters.city} onChange={(event) => updateFilter("city", event.target.value)} />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {runtimeOptions.map((option) => (
                <Button
                  key={option}
                  variant={runtime.includes(option) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleRuntime(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {levelOptions.map((option) => (
                <Button
                  key={option}
                  variant={level.includes(option) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleLevel(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
            <Button onClick={() => load()} disabled={loading}>
              {loading ? <RefreshCcwIcon data-icon="inline-start" /> : <SearchIcon data-icon="inline-start" />}
              {loading ? "Loading" : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Entries</h2>
            <p className="text-sm text-muted-foreground">Newest events first, grouped by severity, runtime, route, and parsed failure details.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive">{levelCounts.fatal + levelCounts.error} error</Badge>
            <Badge variant="default">{levelCounts.warn} warn</Badge>
            <Badge variant="secondary">{levelCounts.info} info</Badge>
            <Badge variant="outline">{levelCounts.debug} debug</Badge>
          </div>
        </div>

        {rows.map((row) => (
          <RuntimeLogEntryCard
            key={row.id}
            entry={row}
            actions={(
              <>
                <Button variant="outline" size="sm" onClick={() => setSelectedRow(row)}>
                  Inspect
                </Button>
                <Link
                  href={`/dev/logs/${encodeURIComponent(row.launchId)}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Launch
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </>
            )}
          />
        ))}

        {!rows.length && !loading ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">No runtime logs matched the current filters.</CardContent>
          </Card>
        ) : null}
      </div>

      {nextCursor ? (
        <Button variant="outline" disabled={loading} onClick={() => load(nextCursor, true)}>
          Load More
        </Button>
      ) : null}

      <Drawer open={selectedRow !== null} onOpenChange={(open) => !open && setSelectedRow(null)} direction="right">
        <DrawerContent className="flex w-full flex-col sm:max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Runtime Log Entry</DrawerTitle>
          </DrawerHeader>
          {selectedRow ? <RuntimeLogDetails entry={selectedRow} /> : null}
        </DrawerContent>
      </Drawer>
    </main>
  );
}
