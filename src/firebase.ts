import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { CACHE_SIZE_UNLIMITED, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const browserEnv =
  typeof window !== "undefined"
    ? (window as Window & { env?: Record<string, string | undefined> }).env
    : undefined;

const runtimeEnv = browserEnv ?? (process.env as Record<string, string | undefined>);

// Firebase configuration for browser and script runtimes.
export const firebaseConfig = {
  apiKey: runtimeEnv.FIREBASE_API_KEY,
  projectId: "inventory-management-app-8aee0",
  storageBucket: "inventory-management-app-8aee0.appspot.com",
  messagingSenderId: runtimeEnv.FIREBASE_MESSAGING_SENDER_ID,
  appId: runtimeEnv.FIREBASE_APP_ID,
  measurementId: "G-PVRX9LR0MG",
  authDomain: runtimeEnv.FIREBASE_AUTH_DOMAIN,
};

if (!firebaseConfig.apiKey || !firebaseConfig.messagingSenderId || !firebaseConfig.appId || !firebaseConfig.authDomain) {
  throw new Error('Missing required Firebase configuration environment variables');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

if (typeof window !== "undefined") {
  try {
    getAnalytics(app);
  } catch (error) {
    // Ignore analytics initialization errors in unsupported browser contexts.
    console.warn("Firebase analytics unavailable:", error);
  }
}

const firestore =
  typeof window !== "undefined"
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
          cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        }),
      })
    : getFirestore(app);

export const db = firestore;
