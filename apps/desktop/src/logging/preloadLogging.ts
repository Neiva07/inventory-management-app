import { ipcRenderer } from "electron";
import {
  formatConsoleArgs,
  makeRuntimeId,
  RUNTIME_EVENT_CODES,
  sanitizeError,
  type RuntimeLogLevel,
} from "@stockify/runtime-logging";
import { runtimeLogChannels } from "./channels";

type ConsoleMethod = "debug" | "info" | "warn" | "error";

const runtimeInstanceId = makeRuntimeId("preload");
const consoleLevels: Record<ConsoleMethod, RuntimeLogLevel> = {
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error",
};
const consoleEventCodes: Record<ConsoleMethod, string> = {
  debug: RUNTIME_EVENT_CODES.consoleDebug,
  info: RUNTIME_EVENT_CODES.consoleInfo,
  warn: RUNTIME_EVENT_CODES.consoleWarn,
  error: RUNTIME_EVENT_CODES.consoleError,
};

export const emitPreloadRuntimeLog = (input: {
  level: RuntimeLogLevel;
  eventCode: string;
  message: string;
  payload?: Record<string, unknown>;
  error?: unknown;
}): void => {
  ipcRenderer.send(runtimeLogChannels.emit, {
    ...input,
    runtime: "preload",
    runtimeInstanceId,
    timestamp: Date.now(),
    error: sanitizeError(input.error),
  });
};

export const installPreloadRuntimeLogging = (): void => {
  (Object.keys(consoleLevels) as ConsoleMethod[]).forEach((method) => {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      original(...args);
      const formatted = formatConsoleArgs(args);
      emitPreloadRuntimeLog({
        level: consoleLevels[method],
        eventCode: consoleEventCodes[method],
        message: formatted.message,
        payload: formatted.payload,
        error: formatted.error,
      });
    };
  });

  window.addEventListener("error", (event) => {
    emitPreloadRuntimeLog({
      level: "error",
      eventCode: "preload.window_error",
      message: event.message,
      error: event.error,
      payload: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const error = sanitizeError(event.reason);
    emitPreloadRuntimeLog({
      level: "error",
      eventCode: "preload.unhandled_rejection",
      message: error?.message ?? "Unhandled preload promise rejection",
      error,
    });
  });

  emitPreloadRuntimeLog({
    level: "info",
    eventCode: RUNTIME_EVENT_CODES.preloadReady,
    message: "Preload runtime ready",
  });
};
