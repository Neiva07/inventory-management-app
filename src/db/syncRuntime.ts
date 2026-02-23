import { SyncEngine } from "./syncEngine";
import { replicatePendingChangesToCloud } from "./syncTransport";

let runtimeEngine: SyncEngine | null = null;

export const startSyncRuntime = (): SyncEngine => {
  if (runtimeEngine) {
    return runtimeEngine;
  }

  runtimeEngine = new SyncEngine({
    transport: replicatePendingChangesToCloud,
  });
  runtimeEngine.start();
  return runtimeEngine;
};

export const stopSyncRuntime = (): void => {
  if (!runtimeEngine) {
    return;
  }

  runtimeEngine.stop();
  runtimeEngine = null;
};
