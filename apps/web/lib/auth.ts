import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "./db/client";
import { userMemberships } from "./db/schema";
import { ApiError } from "./errors";

const getBearerToken = (request: Request): string | null => {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
};

const getDesktopSessionId = (request: Request): string | null => {
  return request.headers.get("x-desktop-session-id")?.trim() || getBearerToken(request);
};

export const isLocalApiMode = (): boolean => {
  const databaseUrl = process.env.TURSO_DATABASE_URL?.trim() ?? "";
  return process.env.NODE_ENV !== "production" || !databaseUrl || databaseUrl.startsWith("file:");
};

const isLocalhostRequest = (request: Request): boolean => {
  const host = request.headers.get("host") ?? request.headers.get("x-forwarded-host") ?? "";
  const hostname = host.split(":")[0]?.replace(/^\[|\]$/g, "");
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
};

export const isLocalDevelopmentRequest = (request: Request): boolean => {
  return isLocalApiMode() && isLocalhostRequest(request);
};

const requireClerkSecret = (): string => {
  const secret = process.env.CLERK_SECRET_KEY ?? process.env.CLERK_API_SECRET_KEY;
  if (!secret) {
    throw new ApiError(500, "Clerk secret is not configured");
  }
  return secret;
};

const getUserIdFromDesktopSessionId = async (sessionId: string): Promise<string | null> => {
  const response = await fetch(`https://api.clerk.com/v1/sessions/${encodeURIComponent(sessionId)}`, {
    headers: {
      Authorization: `Bearer ${requireClerkSecret()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const session = (await response.json()) as { user_id?: string; status?: string };
  if (!session.user_id || session.status !== "active") {
    return null;
  }

  return session.user_id;
};

/** Extracts and validates the authenticated user from the Clerk session. */
export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  return { userId };
}

/** Extracts auth from Clerk cookies, desktop bearer session, or local dev headers. */
export async function requireRequestAuth(request: Request): Promise<{ userId: string }> {
  const authResult = await auth().catch(() => null);
  if (authResult?.userId) {
    return { userId: authResult.userId };
  }

  if (isLocalDevelopmentRequest(request)) {
    const localUserId = request.headers.get("x-local-user-id")?.trim();
    if (localUserId) {
      return { userId: localUserId };
    }
  }

  const desktopSessionId = getDesktopSessionId(request);
  if (!desktopSessionId) {
    throw new ApiError(401, "Unauthorized");
  }

  const userId = await getUserIdFromDesktopSessionId(desktopSessionId);
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
