// No more GoogleAuthProvider or signInWithPopup imports.
import { signOut } from "firebase/auth";
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
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
  createdAt?: number;
  updatedAt?: number;
  deleted: {
    date?: number;
    isDeleted: boolean;
  };
}

const USERS_COLLECTION = "users"

// Upsert user in Firebase from session
import { Session } from "model/session";
import { fetchClerkUser } from "./clerk";

export const upsertUserFromSession = async (session: Session): Promise<User> => {
  const { user_id } = session;
  // Fetch user info from Clerk API
    const clerkUser = await fetchClerkUser(user_id);
    console.log("CLERK USER",clerkUser);
    const fullName = clerkUser.first_name ? `${clerkUser.first_name} ${clerkUser.last_name || ''}`.trim() : clerkUser.username || '';
    const mainEmailAddress = clerkUser.email_addresses?.find(email => email.id === clerkUser.primary_email_address_id);
    const mainPhoneNumber = clerkUser.phone_numbers?.find(phone_number => phone_number.id === clerkUser.primary_phone_number_id);

  const userRef = doc(db, USERS_COLLECTION, user_id);
  const dbUser = await getDoc(userRef);
  const userData: User = {
    id: user_id,
    fullName: fullName || '',
    firstName: clerkUser.first_name,
    lastName: clerkUser.last_name,
    email: mainEmailAddress?.email_address || '',
    phoneNumber: mainPhoneNumber?.phone_number || '',
    photoURL: clerkUser.image_url || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deleted: {
      isDeleted: false,
    },
  };
  if (!dbUser.exists()) {
    await setDoc(userRef, userData);
    return userData;
  } else {
    await setDoc(userRef, { ...dbUser.data(), ...userData, updatedAt: Date.now() });
    return { ...dbUser.data(), ...userData, updatedAt: Date.now() } as User;
  }

};
