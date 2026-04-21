// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { Session } from 'model/session';
import type { UpdateInfo } from 'electron-updater';
import type { RuntimeLogContextUpdate } from '@stockify/runtime-logging';
import { installPreloadRuntimeLogging, emitPreloadRuntimeLog } from './logging/preloadLogging';
import { runtimeLogChannels } from './logging/channels';

installPreloadRuntimeLogging();

const invokeWithLogging = async <T>(channel: string, ...args: unknown[]): Promise<T> => {
  try {
    return await ipcRenderer.invoke(channel, ...args) as T;
  } catch (error) {
    emitPreloadRuntimeLog({
      level: 'error',
      eventCode: 'bridge.ipc_error',
      message: `IPC invoke failed: ${channel}`,
      payload: { channel },
      error,
    });
    throw error;
  }
};

const electronApi = {
  onAuthSessionReceived: (callback: (session: Session) => void) => {
    ipcRenderer.on('auth-session-received', (event, session) => callback(session));
  },
  fetchClerkUser: (user_id: string) => invokeWithLogging('fetch-clerk-user', user_id),
  clerkLogout: (sessionId: string) => invokeWithLogging('clerk-logout', sessionId),
  openExternal: (url: string) => invokeWithLogging('open-external-url', url),
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
    ipcRenderer.on('update-available', (_, info) => callback(info));
  },
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
    ipcRenderer.on('update-downloaded', (_, info) => callback(info));
  },
  onUpdateError: (callback: (error: Error) => void) => {
    ipcRenderer.on('update-error', (_, error) => callback(error));
  },
  downloadUpdate: () => invokeWithLogging('download-update'),
  installUpdate: () => invokeWithLogging('install-update'),
  emitRuntimeLog: (event: unknown) => invokeWithLogging(runtimeLogChannels.emit, event),
  setRuntimeLogContext: (context: RuntimeLogContextUpdate) => invokeWithLogging(runtimeLogChannels.setContext, context),
  getRuntimeInfo: () => invokeWithLogging(runtimeLogChannels.getInfo),
  exportDiagnostics: (options: { scope: 'current-launch' | 'last-24h' }) =>
    invokeWithLogging(runtimeLogChannels.exportDiagnostics, options),
  getLaunchContext: () => invokeWithLogging(runtimeLogChannels.getLaunchContext),
  elevateRuntimeLogVerbosityForNextLaunch: () => invokeWithLogging(runtimeLogChannels.elevateNextLaunch),
};

const resolveLocalDbUrl = (): string => {
  const buildTimeUrl = process.env.TURSO_LOCAL_DATABASE_URL;
  if (buildTimeUrl) {
    return buildTimeUrl;
  }
  // In dev, use the project-local path so drizzle-kit/studio and the app
  // share the same database. In production (packaged), use the user-data
  // directory since the app bundle is read-only.
  if (process.env.NODE_ENV !== 'production') {
    return 'file:./data/stockify.db';
  }
  const userDataPath = ipcRenderer.sendSync('get-user-data-path') as string;
  const sep = userDataPath.includes('\\') ? '\\' : '/';
  return `file:${userDataPath}${sep}stockify.db`;
};

const envApi = {
  LOGIN_URL: process.env.LOGIN_URL,
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
  TURSO_LOCAL_DATABASE_URL: resolveLocalDbUrl(),
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  SYNC_API_URL: process.env.SYNC_API_URL,
};

try {
  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld('electron', electronApi);
    contextBridge.exposeInMainWorld('env', envApi);
  } else {
    const preloadWindow = window as unknown as {
      electron?: typeof electronApi;
      env?: typeof envApi;
    };

    preloadWindow.electron = electronApi;
    preloadWindow.env = envApi;
  }
} catch (error) {
  emitPreloadRuntimeLog({
    level: 'fatal',
    eventCode: 'bridge.exposure_failed',
    message: 'Failed to expose Electron preload bridge',
    error,
  });
  throw error;
}
