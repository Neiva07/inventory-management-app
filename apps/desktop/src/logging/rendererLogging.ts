import {
  formatConsoleArgs,
  makeRuntimeId,
  RUNTIME_EVENT_CODES,
  sanitizeError,
  type RuntimeConnectivityState,
  type RuntimeLogLevel,
} from "@stockify/runtime-logging";

type ConsoleMethod = "debug" | "info" | "warn" | "error";

const runtimeInstanceId = makeRuntimeId("renderer");
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

const getConnection = (): Partial<RuntimeConnectivityState> => {
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
      type?: string;
    };
  };

  return {
    navigatorOnLine: navigator.onLine,
    effectiveType: nav.connection?.effectiveType,
    downlink: nav.connection?.downlink,
    rtt: nav.connection?.rtt,
    saveData: nav.connection?.saveData,
    connectionType: nav.connection?.type,
  };
};

const emitRendererRuntimeLog = (input: {
  level: RuntimeLogLevel;
  eventCode: string;
  message: string;
  payload?: Record<string, unknown>;
  error?: unknown;
}): void => {
  void window.electron?.emitRuntimeLog({
    ...input,
    runtime: "renderer",
    runtimeInstanceId,
    timestamp: Date.now(),
    error: sanitizeError(input.error),
  });
};

const emitConnectivity = (eventCode: string, online: boolean): void => {
  const state: RuntimeConnectivityState = {
    online,
    observedAt: Date.now(),
    ...getConnection(),
  };

  void window.electron?.setRuntimeLogContext({ connectivity: state });
  emitRendererRuntimeLog({
    level: "info",
    eventCode,
    message: online ? "Connectivity is online" : "Connectivity is offline",
    payload: {
      online,
      ...getConnection(),
    },
  });
};

export const installRendererRuntimeLogging = (): void => {
  (Object.keys(consoleLevels) as ConsoleMethod[]).forEach((method) => {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      original(...args);
      const formatted = formatConsoleArgs(args);
      emitRendererRuntimeLog({
        level: consoleLevels[method],
        eventCode: consoleEventCodes[method],
        message: formatted.message,
        payload: formatted.payload,
        error: formatted.error,
      });
    };
  });

  window.addEventListener("error", (event) => {
    emitRendererRuntimeLog({
      level: "error",
      eventCode: RUNTIME_EVENT_CODES.rendererWindowError,
      message: event.message,
      error: event.error,
      payload: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const error = sanitizeError(event.reason);
    emitRendererRuntimeLog({
      level: "error",
      eventCode: RUNTIME_EVENT_CODES.rendererUnhandledRejection,
      message: error?.message ?? "Unhandled renderer promise rejection",
      error,
    });
  });

  window.addEventListener("online", () => emitConnectivity(RUNTIME_EVENT_CODES.connectivityOnline, true));
  window.addEventListener("offline", () => emitConnectivity(RUNTIME_EVENT_CODES.connectivityOffline, false));

  emitRendererRuntimeLog({
    level: "info",
    eventCode: RUNTIME_EVENT_CODES.rendererBoot,
    message: "Renderer runtime booted",
    payload: {
      online: navigator.onLine,
      ...getConnection(),
    },
  });
  emitConnectivity(RUNTIME_EVENT_CODES.connectivityChanged, navigator.onLine);
};
