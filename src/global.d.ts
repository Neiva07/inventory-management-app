import { Session } from "model/session";
import { ClerkUser } from "model/clerkUser.types";

export {};

declare global {
  interface Window {
    electron: {
      fetchClerkUser: (user_id: string) => Promise<ClerkUser>;
      onAuthSessionReceived: (callback: (session: Session) => void) => void;
      clerkLogout: (sessionId: string) => Promise<boolean>;
      openExternal: (url: string) => void;
    };
    env: {
      LOGIN_URL: string;
      FIREBASE_API_KEY: string;
      FIREBASE_MESSAGING_SENDER_ID: string;
      FIREBASE_APP_ID: string;
      FIREBASE_AUTH_DOMAIN: string;
    }
  }
}
