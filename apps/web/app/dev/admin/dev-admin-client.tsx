"use client";

import Link from "next/link";
import * as React from "react";
import { AlertTriangleIcon, DatabaseZapIcon, Loader2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const confirmationText = "RESET CLOUD ENVIRONMENT";

interface WipeResponse {
  resetGeneration: number;
  wipedAt: number;
  tables: Array<{
    name: string;
    rowsAffected: number;
  }>;
  clerkUsersDeleted: number;
  clerkUserDeleteFailures: Array<{
    userId: string;
    error: string;
  }>;
}

export function DevAdminClient() {
  const [confirmation, setConfirmation] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<WipeResponse | null>(null);

  const canSubmit = confirmation === confirmationText && !loading;

  const wipeAllData = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/v1/dev-admin/wipe-all-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to wipe data");
      }
      setResult(payload);
      setConfirmation("");
    } catch (wipeError) {
      setError(wipeError instanceof Error ? wipeError.message : "Failed to wipe data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 py-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Dev Admin</h1>
            <Badge variant="destructive">destructive</Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Internal operations for development and support. Actions here affect the server database used by sync clients.
          </p>
        </div>
        <Link href="/dev/logs" className={buttonVariants({ variant: "outline" })}>
          Runtime logs
        </Link>
      </div>

      <Card className="border-destructive/40">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-destructive/10 p-2 text-destructive">
              <DatabaseZapIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Reset Cloud Environment</CardTitle>
              <CardDescription>
                Deletes app data, sync logs, runtime logs, and every Clerk user referenced by the app users table.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <div className="flex gap-2">
              <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="space-y-1">
                <p className="font-medium text-destructive">This resets the whole cloud environment.</p>
                <p className="text-muted-foreground">
                  Sync is locked during the reset. Desktop devices must wipe local data and relaunch before they can push or pull again.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="wipe-confirmation">
                Type {confirmationText} to confirm
              </label>
              <Input
                id="wipe-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={confirmationText}
                autoComplete="off"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              disabled={!canSubmit}
              onClick={() => void wipeAllData()}
            >
              {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <DatabaseZapIcon className="h-4 w-4" />}
              Reset environment
            </Button>
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="rounded-md border bg-muted/30 p-4">
                <p className="text-sm font-medium">
                  Reset at {new Date(result.wipedAt).toLocaleString()}
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <div className="rounded-md border bg-background px-3 py-2 text-sm">
                    <p className="text-xs text-muted-foreground">Reset generation</p>
                    <p className="font-mono text-xs">{result.resetGeneration}</p>
                  </div>
                  <div className="rounded-md border bg-background px-3 py-2 text-sm">
                    <p className="text-xs text-muted-foreground">Clerk users deleted</p>
                    <p className="font-semibold">{result.clerkUsersDeleted}</p>
                  </div>
                  <div className="rounded-md border bg-background px-3 py-2 text-sm">
                    <p className="text-xs text-muted-foreground">Clerk delete failures</p>
                    <p className="font-semibold">{result.clerkUserDeleteFailures.length}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {result.tables.map((table) => (
                    <div key={table.name} className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm">
                    <span className="font-mono text-xs">{table.name}</span>
                    <Badge variant={table.rowsAffected ? "secondary" : "outline"}>
                      {table.rowsAffected}
                    </Badge>
                    </div>
                  ))}
                </div>
                {result.clerkUserDeleteFailures.length > 0 ? (
                  <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {result.clerkUserDeleteFailures.length} Clerk users could not be deleted. Check server logs for the full response.
                  </div>
                ) : null}
              </div>
            ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
