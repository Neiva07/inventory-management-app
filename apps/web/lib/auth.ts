import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "./db/client";
import { userMemberships } from "./db/schema";
import { ApiError } from "./errors";

/** Extracts and validates the authenticated user from the Clerk session. */
export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  return { userId };
}

/** Verifies the user has an active membership in the given organization. */
export async function requireOrgMembership(userId: string, organizationId: string): Promise<void> {
  const rows = await db
    .select({ id: userMemberships.id })
    .from(userMemberships)
    .where(
      and(
        eq(userMemberships.userId, userId),
        eq(userMemberships.organizationId, organizationId),
        eq(userMemberships.status, "active"),
      ),
    )
    .limit(1);

  if (rows.length === 0) {
    throw new ApiError(403, "User does not have access to this organization");
  }
}
