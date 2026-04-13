// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { Session } from 'model/session';
import type { UpdateInfo } from 'electron-updater';

const electronApi = {
  onAuthSessionReceived: (callback: (session: Session) => void) => {
    ipcRenderer.on('auth-session-received', (event, session) => callback(session));
  },
  fetchClerkUser: (user_id: string) => ipcRenderer.invoke('fetch-clerk-user', user_id),
  clerkLogout: (sessionId: string) => ipcRenderer.invoke('clerk-logout', sessionId),
  openExternal: (url: string) => ipcRenderer.invoke('open-external-url', url),
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
    ipcRenderer.on('update-available', (_, info) => callback(info));
  },
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
    ipcRenderer.on('update-downloaded', (_, info) => callback(info));
  },
  onUpdateError: (callback: (error: Error) => void) => {
    ipcRenderer.on('update-error', (_, error) => callback(error));
  },
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
};

const resolveLocalDbUrl = (): string => {
  const buildTimeUrl = process.env.TURSO_LOCAL_DATABASE_URL;
  if (buildTimeUrl) {
    return buildTimeUrl;
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
};

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
