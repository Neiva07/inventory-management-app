import { initializeApp, setLogLevel } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { CACHE_SIZE_UNLIMITED, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: window.env.FIREBASE_API_KEY,
  projectId: "inventory-management-app-8aee0",
  storageBucket: "inventory-management-app-8aee0.appspot.com",
  messagingSenderId: window.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: window.env.FIREBASE_APP_ID,
  measurementId: "G-PVRX9LR0MG",
  authDomain: window.env.FIREBASE_AUTH_DOMAIN,
};

if (!firebaseConfig.apiKey || !firebaseConfig.messagingSenderId || !firebaseConfig.appId || !firebaseConfig.authDomain) {
  throw new Error('Missing required Firebase configuration environment variables');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
const analytics = getAnalytics(app);

initializeFirestore(app,
  {
    localCache:
      persistentLocalCache(/*settings*/{ tabManager: persistentMultipleTabManager(), cacheSizeBytes: CACHE_SIZE_UNLIMITED }),
  });

export const db = getFirestore(app);
