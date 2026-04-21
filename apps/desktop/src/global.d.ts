import { Session } from "model/session";
import { ClerkUser } from "model/clerk";
import type { UpdateInfo } from 'electron-updater';
import type { RuntimeLaunchContext, RuntimeLogContextUpdate } from "@stockify/runtime-logging";

declare global {
  interface Window {
    electron: {
      fetchClerkUser: (user_id: string) => Promise<ClerkUser>;
      onAuthSessionReceived: (callback: (session: Session) => void) => void;
      clerkLogout: (sessionId: string) => Promise<boolean>;
      openExternal: (url: string) => void;
      onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
      onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;
      onUpdateError: (callback: (error: Error) => void) => void;
      downloadUpdate: () => Promise<void>;
      installUpdate: () => Promise<void>;
      emitRuntimeLog: (event: unknown) => Promise<boolean>;
      setRuntimeLogContext: (context: RuntimeLogContextUpdate) => Promise<boolean>;
      getRuntimeInfo: () => Promise<RuntimeLaunchContext>;
      exportDiagnostics: (options: { scope: "current-launch" | "last-24h" }) => Promise<{ filePath: string | null }>;
      getLaunchContext: () => Promise<RuntimeLaunchContext>;
      elevateRuntimeLogVerbosityForNextLaunch: () => Promise<void>;
    };
    env: {
      LOGIN_URL: string;
      TURSO_DATABASE_URL: string;
      TURSO_LOCAL_DATABASE_URL: string;
      TURSO_AUTH_TOKEN: string;
      SYNC_API_URL: string;
    }
  }
}
