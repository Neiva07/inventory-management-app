// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { Session } from 'model/session';
import type { UpdateInfo } from 'electron-updater';

contextBridge.exposeInMainWorld('electron', {
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
});

contextBridge.exposeInMainWorld('env', {
  LOGIN_URL: process.env.LOGIN_URL,
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
});

