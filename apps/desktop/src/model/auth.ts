import { eq } from "drizzle-orm";
import { createAppDb } from "../db/client";
import { users } from "../db/schema";
import { Session } from "model/session";
import { fetchClerkUser } from "./clerk";

export interface User {
  id: string;
  organizationId?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
  createdAt?: number;
  updatedAt?: number;
}

/** Upsert user in local SQLite from Clerk session data. */
export const upsertUserFromSession = async (session: Session): Promise<User> => {
  const { user_id } = session;
  const clerkUser = await fetchClerkUser(user_id);

  const fullName = clerkUser.first_name
    ? `${clerkUser.first_name} ${clerkUser.last_name || ""}`.trim()
    : clerkUser.username || "";
  const mainEmailAddress = clerkUser.email_addresses?.find(
    (email) => email.id === clerkUser.primary_email_address_id
  );
  const mainPhoneNumber = clerkUser.phone_numbers?.find(
    (phone_number) => phone_number.id === clerkUser.primary_phone_number_id
  );

  const now = Date.now();
  const email = mainEmailAddress?.email_address || "";
  const name = fullName || "";
  const db = createAppDb();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, user_id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(users)
      .set({ email, fullName: name, updatedAt: now })
      .where(eq(users.id, user_id));
  } else {
    await db
      .insert(users)
      .values({ id: user_id, email, fullName: name, createdAt: now, updatedAt: now });
  }

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, user_id))
    .limit(1);

  const row = rows[0];

  return {
    id: row.id,
    fullName: row.fullName || "",
    firstName: clerkUser.first_name ?? "",
    lastName: clerkUser.last_name ?? "",
    email: row.email || "",
    phoneNumber: mainPhoneNumber?.phone_number || "",
    photoURL: clerkUser.image_url || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};
