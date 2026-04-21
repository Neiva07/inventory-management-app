export const runtimeLogChannels = {
  emit: "runtime-log:emit",
  setContext: "runtime-log:set-context",
  getInfo: "runtime-log:get-info",
  exportDiagnostics: "runtime-log:export-diagnostics",
  getLaunchContext: "runtime-log:get-launch-context",
  elevateNextLaunch: "runtime-log:elevate-next-launch",
} as const;
