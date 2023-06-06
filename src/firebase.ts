// Import the functions you need from the SDKs you need
import { initializeApp, setLogLevel } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { CACHE_SIZE_UNLIMITED, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyB2Ak1S0jr6IIvLDxf-P-cKkeNbZG9sp1E",
  authDomain: "inventory-management-app-8aee0.firebaseapp.com",
  projectId: "inventory-management-app-8aee0",
  storageBucket: "inventory-management-app-8aee0.appspot.com",
  messagingSenderId: "908617527974",
  appId: "1:908617527974:web:58cf25bea368d5d21bfa67",
  measurementId: "G-PVRX9LR0MG",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



initializeFirestore(app,
    {localCache:
      persistentLocalCache(/*settings*/{tabManager: persistentMultipleTabManager(), cacheSizeBytes: CACHE_SIZE_UNLIMITED}),
  });
  


  export const db = getFirestore(app);
