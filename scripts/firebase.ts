import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: "inventory-management-app-8aee0",
  storageBucket: "inventory-management-app-8aee0.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: "G-PVRX9LR0MG",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
};

if (!firebaseConfig.apiKey || !firebaseConfig.messagingSenderId || !firebaseConfig.appId || !firebaseConfig.authDomain) {
  throw new Error('Missing required Firebase configuration environment variables');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 