import { eq } from "drizzle-orm";
import { createAppDb } from "../db/client";
import { onboardingSessions, organizations, userMemberships } from "../db/schema";

/**
 * Dev-only: wipe a user back to a fresh onboarding state.
 *
 * Deletes the user's memberships, any organizations they created (cascades
 * remove units/categories/products/etc.), and any onboarding sessions. After
 * calling this and reloading the app, the user lands in OrganizationSelection
 * and can start the onboarding flow from scratch.
 */
export const resetUserOnboarding = async (userID: string): Promise<void> => {
  const db = createAppDb();

  await db.delete(userMemberships).where(eq(userMemberships.userId, userID));
  await db.delete(organizations).where(eq(organizations.createdBy, userID));
  await db.delete(onboardingSessions).where(eq(onboardingSessions.userId, userID));
};
