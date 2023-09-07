import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
  authProvider: string;
  providerId: string;
  createdAt?: number;
  updatedAt?: number;
  deleted: {
    date: number;
    isDeleted: boolean;
  };
}

const USERS_COLLECTION = "users"

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;

    const dbUser = await getDoc(doc(db, USERS_COLLECTION, user.uid));
    if (!dbUser.exists()) {
      await setDoc(doc(db, USERS_COLLECTION, user.uid), {
        id: user.uid,
        name: user.displayName,
        photoURL: user.photoURL,
        authProvider: "google",
        email: user.email,
        createdAt: Date.now(),
        deleted: {
          isDeleted: false,
        },
      } as User)
      return {
        user: await getDoc(doc(db, USERS_COLLECTION, user.uid)), isNewUser: true
      };
    }

    return { user: dbUser, isNewUser: false }
  } catch (err) {
    console.log("auth config", auth.config)
    console.log("emulator config", auth.emulatorConfig)
    console.error("Sign in with Google failed", err);
    throw err;
  }
};


export const logout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.log("Failed to signout", err);
    throw err;
  }
}

