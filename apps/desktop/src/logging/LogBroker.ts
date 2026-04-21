import axios from "axios";
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { createClient, type Client } from "@libsql/client";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { appendFile, readdir, rm, stat, writeFile } from "fs/promises";
import path from "path";
import {
  formatConsoleArgs,
  isPublicIngestEventAllowed,
  makeRuntimeId,
  normalizeRuntimeLogEvent,
  RUNTIME_EVENT_CODES,
  RUNTIME_LOG_LIMITS,
  sanitizeError,
  sanitizePayload,
  truncateUtf8,
  type RuntimeLaunchContext,
  type RuntimeLogContextUpdate,
  type RuntimeLogError,
  type RuntimeLogEvent,
  type RuntimeLogIngestRequest,
  type RuntimeLogLevel,
  type RuntimeLogRuntime,
} from "@stockify/runtime-logging";
import { runtimeLogChannels } from "./channels";

type ConsoleMethod = "debug" | "info" | "warn" | "error";

interface RuntimeLogInput {
  level: RuntimeLogLevel;
  runtime: RuntimeLogRuntime;
  runtimeInstanceId: string;
  eventCode: string;
  message: string;
  timestamp?: number;
  payload?: Record<string, unknown>;
  error?: RuntimeLogError | Error | unknown;
}

interface StoredState {
  deviceId?: string;
  nextLaunchVerbosity?: RuntimeLogLevel;
}

interface ConnectivityRollup {
  startedOffline: boolean | null;
  endedOffline: boolean | null;
  transitionCount: number;
  offlineDurationMs: number;
  onlineDurationMs: number;
  longestOfflineStreakMs: number;
  lastConnectivityChangeAt: number | null;
  lastKnownConnectivityState: "online" | "offline" | null;
}

interface LocalOutboxStats {
  pendingRows: number;
  pendingBytes: number;
}

const consoleEventCodes: Record<ConsoleMethod, string> = {
  debug: RUNTIME_EVENT_CODES.consoleDebug,
  info: RUNTIME_EVENT_CODES.consoleInfo,
  warn: RUNTIME_EVENT_CODES.consoleWarn,
  error: RUNTIME_EVENT_CODES.consoleError,
};

const consoleLevels: Record<ConsoleMethod, RuntimeLogLevel> = {
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error",
};

export interface DiagnosticsExportOptions {
  scope: "current-launch" | "last-24h";
}

export class LogBroker {
  private readonly launchId = makeRuntimeId("launch");
  private readonly mainRuntimeInstanceId = makeRuntimeId("main");
  private readonly startedAt = Date.now();
  private readonly originalConsole: Record<ConsoleMethod, (...args: unknown[]) => void>;
  private readonly syncApiUrl = process.env.SYNC_API_URL;
  private readonly memoryQueue: RuntimeLogEvent[] = [];
  private readonly context: Omit<RuntimeLaunchContext, "deviceId" | "launchId"> & { sessionId?: string | null };
  private readonly connectivityRollup: ConnectivityRollup = {
    startedOffline: null,
    endedOffline: null,
    transitionCount: 0,
    offlineDurationMs: 0,
    onlineDurationMs: 0,
    longestOfflineStreakMs: 0,
    lastConnectivityChangeAt: null,
    lastKnownConnectivityState: null,
  };

  private deviceId = "pending";
  private localClient: Client | null = null;
  private storageReady: Promise<void> | null = null;
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;
  private lastEventKey: string | null = null;
  private lastEventId: string | null = null;
  private lastBackpressureAt = 0;
  private consolePatched = false;

  constructor() {
    this.originalConsole = {
      debug: console.debug.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    };

    this.context = {
      appVersion: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      isPackaged: app.isPackaged,
      authState: "pre_auth",
      userId: null,
      orgId: null,
      membershipRole: null,
      route: null,
      syncClientId: null,
      connectivity: null,
      sessionId: null,
    };
  }

  start(): void {
    this.patchMainConsole();
    this.registerIpcHandlers();
    this.captureProcessFailures();
    this.startUploadLoop();

    this.record({
      level: "info",
      runtime: "main",
      runtimeInstanceId: this.mainRuntimeInstanceId,
      eventCode: RUNTIME_EVENT_CODES.appStartup,
      message: "Electron main process started",
      payload: {
        appVersion: this.context.appVersion,
        platform: this.context.platform,
        arch: this.context.arch,
        isPackaged: this.context.isPackaged,
      },
    });

    app.whenReady()
      .then(async () => {
        await this.ensureStorage();
        this.record({
          level: "info",
          runtime: "main",
          runtimeInstanceId: this.mainRuntimeInstanceId,
          eventCode: RUNTIME_EVENT_CODES.appReady,
          message: "Electron app ready",
        });
        await this.flushUploads();
      })
      .catch((error) => {
        this.originalConsole.error("Failed to initialize runtime log storage:", error);
      });

    app.on("before-quit", () => {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }
      void this.flushUploads();
    });
  }

  attachWindow(window: BrowserWindow): void {
    window.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
      this.record({
        level: "error",
        runtime: "main",
        runtimeInstanceId: this.mainRuntimeInstanceId,
        eventCode: "renderer.load_failed",
        message: `Renderer failed to load: ${errorDescription}`,
        payload: { code: errorCode, url: validatedURL },
      });
    });

    window.webContents.on("render-process-gone", (_event, details) => {
      this.record({
        level: "fatal",
        runtime: "main",
        runtimeInstanceId: this.mainRuntimeInstanceId,
        eventCode: "renderer.process_gone",
        message: `Renderer process gone: ${details.reason}`,
        payload: { reason: details.reason, exitCode: details.exitCode },
      });
    });
  }

  log(level: RuntimeLogLevel, eventCode: string, message: string, payload?: Record<string, unknown>, error?: unknown): void {
    this.record({
      level,
      runtime: "main",
      runtimeInstanceId: this.mainRuntimeInstanceId,
      eventCode,
      message,
      payload,
      error,
    });
  }

  getLaunchContext(): RuntimeLaunchContext {
    return {
      deviceId: this.deviceId,
      launchId: this.launchId,
      appVersion: this.context.appVersion,
      platform: this.context.platform,
      arch: this.context.arch,
      isPackaged: this.context.isPackaged,
      userId: this.context.userId,
      orgId: this.context.orgId,
      membershipRole: this.context.membershipRole,
      route: this.context.route,
      authState: this.context.authState,
      syncClientId: this.context.syncClientId,
      connectivity: this.context.connectivity,
    };
  }

  setContext(update: RuntimeLogContextUpdate): void {
    if ("sessionId" in update) {
      this.context.sessionId = update.sessionId ?? null;
    }

    if ("authState" in update && update.authState) {
      this.context.authState = update.authState;
    }

    if ("userId" in update) {
      this.context.userId = update.userId ?? null;
    }

    if ("orgId" in update) {
      this.context.orgId = update.orgId ?? null;
    }

    if ("membershipRole" in update) {
      this.context.membershipRole = update.membershipRole ?? null;
    }

    if ("route" in update) {
      this.context.route = update.route ?? null;
    }

    if ("syncClientId" in update) {
      this.context.syncClientId = update.syncClientId ?? null;
    }

    if ("connectivity" in update) {
      this.context.connectivity = update.connectivity ?? null;
    }

    if (this.context.authState === "logged_out") {
      this.context.userId = null;
      this.context.orgId = null;
      this.context.membershipRole = null;
      this.context.sessionId = null;
    }

    void this.flushUploads();
  }

  async exportDiagnostics(options: DiagnosticsExportOptions): Promise<{ filePath: string | null }> {
    await this.ensureStorage();
    const client = this.localClient;
    if (!client) {
      return { filePath: null };
    }

    const now = Date.now();
    const defaultName =
      options.scope === "current-launch"
        ? `stockify-runtime-${this.launchId}.json`
        : `stockify-runtime-last-24h-${now}.json`;
    const result = await dialog.showSaveDialog({
      title: "Export runtime diagnostics",
      defaultPath: defaultName,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (result.canceled || !result.filePath) {
      return { filePath: null };
    }

    const query =
      options.scope === "current-launch"
        ? {
            sql: "SELECT event_json FROM local_runtime_logs WHERE launch_id = ? ORDER BY event_ts ASC",
            args: [this.launchId],
          }
        : {
            sql: "SELECT event_json FROM local_runtime_logs WHERE event_ts >= ? ORDER BY event_ts ASC",
            args: [now - 24 * 60 * 60 * 1000],
          };

    const rows = await client.execute(query);
    const events = rows.rows
      .map((row) => (typeof row.event_json === "string" ? JSON.parse(row.event_json) as RuntimeLogEvent : null))
      .filter(Boolean);

    await writeFile(
      result.filePath,
      JSON.stringify(
        {
          exportedAt: now,
          scope: options.scope,
          launchContext: this.getLaunchContext(),
          events,
        },
        null,
        2,
      ),
      "utf8",
    );

    this.record({
      level: "info",
      runtime: "main",
      runtimeInstanceId: this.mainRuntimeInstanceId,
      eventCode: RUNTIME_EVENT_CODES.diagnosticsExport,
      message: "Runtime diagnostics exported",
      payload: { scope: options.scope, eventCount: events.length },
    });

    return { filePath: result.filePath };
  }

  async elevateVerbosityForNextLaunch(): Promise<void> {
    await this.ensureStorage();
    const state = this.readState();
    state.nextLaunchVerbosity = "debug";
    this.writeState(state);
    this.record({
      level: "info",
      runtime: "main",
      runtimeInstanceId: this.mainRuntimeInstanceId,
      eventCode: "diagnostics.verbosity_elevated",
      message: "Runtime log verbosity elevated for next launch",
    });
  }

  private record(input: RuntimeLogInput): RuntimeLogEvent {
    const timestamp = input.timestamp ?? Date.now();
    const payload = sanitizePayload(this.withConnectivityRollup(input));
    const event: RuntimeLogEvent = {
      id: makeRuntimeId("log"),
      timestamp,
      level: input.level,
      runtime: input.runtime,
      runtimeInstanceId: input.runtimeInstanceId,
      eventCode: truncateUtf8(input.eventCode, 256),
      message: truncateUtf8(input.message, RUNTIME_LOG_LIMITS.messageMaxBytes),
      payload,
      error: sanitizeError(input.error),
      route: this.context.route,
      deviceId: this.deviceId,
      launchId: this.launchId,
      syncClientId: this.context.syncClientId,
      appVersion: this.context.appVersion,
      platform: this.context.platform,
      arch: this.context.arch,
      isPackaged: this.context.isPackaged,
      authState: this.context.authState,
      userId: this.context.userId,
      orgId: this.context.orgId,
      membershipRole: this.context.membershipRole,
      repeatCount: 1,
    };

    const normalized = normalizeRuntimeLogEvent(event) ?? event;
    const dedupeKey = this.getDedupeKey(normalized);
    if (dedupeKey === this.lastEventKey && this.lastEventId) {
      const queuedEvent = this.memoryQueue.find((event) => event.id === this.lastEventId);
      if (queuedEvent) {
        queuedEvent.repeatCount = (queuedEvent.repeatCount ?? 1) + 1;
        queuedEvent.timestamp = normalized.timestamp;
      } else {
        normalized.id = this.lastEventId;
        void this.updateRepeatedEvent(normalized);
      }
      return normalized;
    }

    this.lastEventKey = dedupeKey;
    this.lastEventId = normalized.id;
    if (this.localClient) {
      void this.persistEventNow(normalized);
    } else {
      this.memoryQueue.push(normalized);
    }

    if (input.level === "warn" || input.level === "error" || input.level === "fatal") {
      void this.flushUploads();
    }

    return normalized;
  }

  private withConnectivityRollup(input: RuntimeLogInput): Record<string, unknown> | undefined {
    const payload = input.payload ? { ...input.payload } : {};
    if (!input.eventCode.startsWith("connectivity.")) {
      return Object.keys(payload).length ? payload : undefined;
    }

    const online = typeof payload.online === "boolean" ? payload.online : null;
    const observedAt = input.timestamp ?? Date.now();
    if (online !== null) {
      this.updateConnectivityRollup(online, observedAt);
      payload.rollup = { ...this.connectivityRollup };
    }

    return payload;
  }

  private updateConnectivityRollup(online: boolean, observedAt: number): void {
    const nextState = online ? "online" : "offline";
    const previousState = this.connectivityRollup.lastKnownConnectivityState;
    const previousAt = this.connectivityRollup.lastConnectivityChangeAt ?? observedAt;

    if (this.connectivityRollup.startedOffline === null) {
      this.connectivityRollup.startedOffline = !online;
    }

    if (previousState && previousState !== nextState) {
      const duration = Math.max(0, observedAt - previousAt);
      if (previousState === "offline") {
        this.connectivityRollup.offlineDurationMs += duration;
        this.connectivityRollup.longestOfflineStreakMs = Math.max(
          this.connectivityRollup.longestOfflineStreakMs,
          duration,
        );
      } else {
        this.connectivityRollup.onlineDurationMs += duration;
      }
      this.connectivityRollup.transitionCount += 1;
    }

    this.connectivityRollup.endedOffline = !online;
    this.connectivityRollup.lastConnectivityChangeAt = observedAt;
    this.connectivityRollup.lastKnownConnectivityState = nextState;
  }

  private getDedupeKey(event: RuntimeLogEvent): string {
    return JSON.stringify({
      level: event.level,
      runtime: event.runtime,
      runtimeInstanceId: event.runtimeInstanceId,
      eventCode: event.eventCode,
      message: event.message,
      route: event.route,
      error: event.error?.message,
    });
  }

  private async updateRepeatedEvent(event: RuntimeLogEvent): Promise<void> {
    await this.ensureStorage();
    const client = this.localClient;
    if (!client) {
      return;
    }
    const current = await client.execute({
      sql: "SELECT event_json FROM local_runtime_logs WHERE id = ? LIMIT 1",
      args: [event.id],
    });
    const previousJson = current.rows[0]?.event_json;
    const previous = typeof previousJson === "string" ? JSON.parse(previousJson) as RuntimeLogEvent : event;
    const repeated = {
      ...previous,
      repeatCount: (previous.repeatCount ?? 1) + 1,
      timestamp: event.timestamp,
    };

    await client.execute({
      sql: "UPDATE local_runtime_logs SET event_ts = ?, event_json = ?, repeat_count = ? WHERE id = ?",
      args: [repeated.timestamp, JSON.stringify(repeated), repeated.repeatCount ?? 1, repeated.id],
    });
  }

  private async persistEventNow(event: RuntimeLogEvent): Promise<void> {
    const client = this.localClient;
    if (!client) {
      return;
    }

    const serialized = JSON.stringify(event);
    const stats = await this.getOutboxStats();
    const suppressUpload =
      (stats.pendingRows >= RUNTIME_LOG_LIMITS.localOutboxMaxRows ||
        stats.pendingBytes >= RUNTIME_LOG_LIMITS.localOutboxMaxBytes) &&
      (event.level === "debug" || event.level === "info");

    await client.execute({
      sql: `
        INSERT OR REPLACE INTO local_runtime_logs (
          id,
          launch_id,
          event_ts,
          level,
          runtime,
          event_code,
          event_json,
          repeat_count,
          uploaded_public_at,
          uploaded_auth_at,
          upload_suppressed,
          bytes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)
      `,
      args: [
        event.id,
        event.launchId,
        event.timestamp,
        event.level,
        event.runtime,
        event.eventCode,
        serialized,
        event.repeatCount ?? 1,
        Number(suppressUpload),
        Buffer.byteLength(serialized, "utf8"),
      ],
    });

    await this.writeRawLog(event);
    if (suppressUpload) {
      this.maybeEmitBackpressure(stats);
    }
  }

  private async getOutboxStats(): Promise<LocalOutboxStats> {
    const client = this.localClient;
    if (!client) {
      return { pendingRows: 0, pendingBytes: 0 };
    }

    const result = await client.execute(`
      SELECT COUNT(*) AS pending_rows, COALESCE(SUM(bytes), 0) AS pending_bytes
      FROM local_runtime_logs
      WHERE upload_suppressed = 0
        AND (uploaded_public_at IS NULL OR uploaded_auth_at IS NULL)
    `);
    const row = (result.rows[0] ?? {}) as Record<string, unknown>;
    return {
      pendingRows: Number(row.pending_rows ?? 0),
      pendingBytes: Number(row.pending_bytes ?? 0),
    };
  }

  private maybeEmitBackpressure(stats: LocalOutboxStats): void {
    const now = Date.now();
    if (now - this.lastBackpressureAt < 60_000) {
      return;
    }
    this.lastBackpressureAt = now;
    this.record({
      level: "warn",
      runtime: "main",
      runtimeInstanceId: this.mainRuntimeInstanceId,
      eventCode: RUNTIME_EVENT_CODES.logBackpressure,
      message: "Runtime log outbox is over cap; debug/info uploads are degraded to local-only",
      payload: { pendingRows: stats.pendingRows, pendingBytes: stats.pendingBytes },
    });
  }

  private async ensureStorage(): Promise<void> {
    if (this.storageReady) {
      return this.storageReady;
    }

    this.storageReady = (async () => {
      const userData = app.getPath("userData");
      mkdirSync(userData, { recursive: true });

      const state = this.readState();
      this.deviceId = state.deviceId ?? makeRuntimeId("device");
      if (!state.deviceId) {
        this.writeState({ ...state, deviceId: this.deviceId });
      }

      const dbPath = path.join(userData, "runtime-logs.db");
      this.localClient = createClient({ url: `file:${dbPath}` });
      await this.localClient.execute(`
        CREATE TABLE IF NOT EXISTS local_runtime_logs (
          id TEXT PRIMARY KEY,
          launch_id TEXT NOT NULL,
          event_ts INTEGER NOT NULL,
          level TEXT NOT NULL,
          runtime TEXT NOT NULL,
          event_code TEXT NOT NULL,
          event_json TEXT NOT NULL,
          repeat_count INTEGER NOT NULL DEFAULT 1,
          uploaded_public_at INTEGER,
          uploaded_auth_at INTEGER,
          upload_suppressed INTEGER NOT NULL DEFAULT 0,
          bytes INTEGER NOT NULL DEFAULT 0
        )
      `);
      await this.localClient.execute(
        "CREATE INDEX IF NOT EXISTS local_runtime_logs_outbox_idx ON local_runtime_logs(upload_suppressed, uploaded_public_at, uploaded_auth_at, event_ts)",
      );
      await this.localClient.execute(
        "CREATE INDEX IF NOT EXISTS local_runtime_logs_launch_idx ON local_runtime_logs(launch_id, event_ts)",
      );

      const queued = this.memoryQueue.splice(0);
      for (const event of queued) {
        event.deviceId = this.deviceId;
        await this.persistEventNow(event);
      }

      await this.pruneRawLogs();
    })();

    return this.storageReady;
  }

  private readState(): StoredState {
    try {
      const statePath = this.getStatePath();
      if (!existsSync(statePath)) {
        return {};
      }
      return JSON.parse(readFileSync(statePath, "utf8")) as StoredState;
    } catch {
      return {};
    }
  }

  private writeState(state: StoredState): void {
    const statePath = this.getStatePath();
    mkdirSync(path.dirname(statePath), { recursive: true });
    writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
  }

  private getStatePath(): string {
    return path.join(app.getPath("userData"), "runtime-logging-state.json");
  }

  private async writeRawLog(event: RuntimeLogEvent): Promise<void> {
    const userData = app.getPath("userData");
    const date = new Date(event.timestamp).toISOString().slice(0, 10);
    const dir = path.join(userData, "logs", date);
    mkdirSync(dir, { recursive: true });
    await appendFile(path.join(dir, `${this.launchId}.ndjson`), `${JSON.stringify(event)}\n`, "utf8");
  }

  private async pruneRawLogs(): Promise<void> {
    const root = path.join(app.getPath("userData"), "logs");
    if (!existsSync(root)) {
      return;
    }

    const now = Date.now();
    const maxAge = RUNTIME_LOG_LIMITS.localRawRetentionDays * 24 * 60 * 60 * 1000;
    const files: Array<{ filePath: string; mtimeMs: number; size: number }> = [];

    for (const day of await readdir(root)) {
      const dayPath = path.join(root, day);
      const dayStat = await stat(dayPath);
      if (!dayStat.isDirectory()) {
        continue;
      }

      for (const file of await readdir(dayPath)) {
        const filePath = path.join(dayPath, file);
        const fileStat = await stat(filePath);
        if (!fileStat.isFile()) {
          continue;
        }
        if (now - fileStat.mtimeMs > maxAge) {
          await rm(filePath, { force: true });
          continue;
        }
        files.push({ filePath, mtimeMs: fileStat.mtimeMs, size: fileStat.size });
      }
    }

    let totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    const ordered = files.sort((a, b) => a.mtimeMs - b.mtimeMs);
    for (const file of ordered) {
      if (totalBytes <= RUNTIME_LOG_LIMITS.localRawRetentionBytes) {
        break;
      }
      await rm(file.filePath, { force: true });
      totalBytes -= file.size;
    }
  }

  private registerIpcHandlers(): void {
    ipcMain.on(runtimeLogChannels.emit, (_event, input: RuntimeLogInput) => {
      this.record(input);
    });

    ipcMain.handle(runtimeLogChannels.emit, (_event, input: RuntimeLogInput) => {
      this.record(input);
      return true;
    });

    ipcMain.handle(runtimeLogChannels.setContext, (_event, update: RuntimeLogContextUpdate) => {
      this.setContext(update);
      return true;
    });

    ipcMain.handle(runtimeLogChannels.getInfo, () => this.getLaunchContext());
    ipcMain.handle(runtimeLogChannels.getLaunchContext, () => this.getLaunchContext());
    ipcMain.handle(runtimeLogChannels.exportDiagnostics, (_event, options: DiagnosticsExportOptions) =>
      this.exportDiagnostics(options),
    );
    ipcMain.handle(runtimeLogChannels.elevateNextLaunch, () => this.elevateVerbosityForNextLaunch());
  }

  private patchMainConsole(): void {
    if (this.consolePatched) {
      return;
    }
    this.consolePatched = true;

    (Object.keys(consoleEventCodes) as ConsoleMethod[]).forEach((method) => {
      const original = this.originalConsole[method];
      console[method] = (...args: unknown[]) => {
        original(...args);
        const formatted = formatConsoleArgs(args);
        this.record({
          level: consoleLevels[method],
          runtime: "main",
          runtimeInstanceId: this.mainRuntimeInstanceId,
          eventCode: consoleEventCodes[method],
          message: formatted.message,
          payload: formatted.payload,
          error: formatted.error,
        });
      };
    });
  }

  private captureProcessFailures(): void {
    process.on("uncaughtException", (error) => {
      this.record({
        level: "fatal",
        runtime: "main",
        runtimeInstanceId: this.mainRuntimeInstanceId,
        eventCode: RUNTIME_EVENT_CODES.runtimeUncaughtException,
        message: error.message,
        error,
      });
      this.originalConsole.error("Uncaught exception:", error);
    });

    process.on("unhandledRejection", (reason) => {
      const sanitized = sanitizeError(reason);
      this.record({
        level: "fatal",
        runtime: "main",
        runtimeInstanceId: this.mainRuntimeInstanceId,
        eventCode: RUNTIME_EVENT_CODES.runtimeUnhandledRejection,
        message: sanitized?.message ?? "Unhandled promise rejection",
        error: sanitized,
      });
      this.originalConsole.error("Unhandled rejection:", reason);
    });
  }

  private startUploadLoop(): void {
    if (this.flushTimer) {
      return;
    }
    this.flushTimer = setInterval(() => {
      void this.flushUploads();
    }, RUNTIME_LOG_LIMITS.flushIntervalMs);
  }

  private async flushUploads(): Promise<void> {
    if (!this.syncApiUrl || this.isFlushing || !app.isReady()) {
      return;
    }
    this.isFlushing = true;
    try {
      await this.ensureStorage();
      if (this.context.authState === "authenticated" && this.context.sessionId) {
        await this.flushLane("authenticated");
      } else {
        await this.flushLane("public");
      }
    } catch (error) {
      this.originalConsole.warn("Runtime log upload failed:", error);
    } finally {
      this.isFlushing = false;
    }
  }

  private async flushLane(lane: "public" | "authenticated"): Promise<void> {
    const client = this.localClient;
    if (!client || !this.syncApiUrl) {
      return;
    }

    const maxRows = lane === "public" ? RUNTIME_LOG_LIMITS.publicBatchSize : RUNTIME_LOG_LIMITS.batchSize;
    const uploadedColumn = lane === "public" ? "uploaded_public_at" : "uploaded_auth_at";
    const result = await client.execute({
      sql: `
        SELECT id, event_json
        FROM local_runtime_logs
        WHERE upload_suppressed = 0
          AND ${uploadedColumn} IS NULL
        ORDER BY
          CASE level WHEN 'fatal' THEN 0 WHEN 'error' THEN 1 WHEN 'warn' THEN 2 WHEN 'info' THEN 3 ELSE 4 END,
          event_ts ASC
        LIMIT ?
      `,
      args: [maxRows],
    });

    const allEvents = result.rows
      .map((row) => (typeof row.event_json === "string" ? JSON.parse(row.event_json) as RuntimeLogEvent : null))
      .filter((event): event is RuntimeLogEvent => Boolean(event));
    const events = lane === "public" ? allEvents.filter(isPublicIngestEventAllowed) : allEvents;

    if (!events.length) {
      if (lane === "public" && allEvents.length) {
        return;
      }
      return;
    }

    const endpoint = lane === "public" ? "/api/v1/runtime-logs/public-ingest" : "/api/v1/runtime-logs/ingest";
    const body: RuntimeLogIngestRequest = {
      deviceId: this.deviceId,
      launchId: this.launchId,
      appVersion: this.context.appVersion,
      platform: this.context.platform,
      arch: this.context.arch,
      isPackaged: this.context.isPackaged,
      events,
    };

    await axios.post(`${this.syncApiUrl}${endpoint}`, body, {
      timeout: 10_000,
      headers:
        lane === "authenticated" && this.context.sessionId
          ? { Authorization: `Bearer ${this.context.sessionId}` }
          : undefined,
    });

    const now = Date.now();
    for (const event of events) {
      await client.execute({
        sql: `UPDATE local_runtime_logs SET ${uploadedColumn} = ? WHERE id = ?`,
        args: [now, event.id],
      });
    }
  }
}

export const runtimeLogBroker = new LogBroker();
