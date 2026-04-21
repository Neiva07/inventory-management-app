import { auth, currentUser } from "@clerk/nextjs/server";
import { isLocalApiMode, isLocalDevelopmentRequest } from "@/lib/auth";
import { ApiError } from "@/lib/errors";

interface RuntimeLogAccess {
  userId: string;
  internal: boolean;
}

const getBearerToken = (request: Request): string | null => {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
};

export const isRuntimeLogsLocalDevelopmentRequest = (request: Request): boolean => {
  return isLocalDevelopmentRequest(request);
};

const getAllowedEngineerEmails = (): string[] => {
  return (process.env.RUNTIME_LOGS_ENGINEER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const isAllowlistedEngineerEmail = (email: string): boolean => {
  const allowed = getAllowedEngineerEmails();
  return allowed.includes("*") || allowed.includes(email.toLowerCase());
};

export const requireRuntimeLogsAccess = async (request: Request): Promise<RuntimeLogAccess> => {
  const configuredApiKey = process.env.RUNTIME_LOGS_INTERNAL_API_KEY;
  const providedApiKey = request.headers.get("x-internal-api-key") ?? getBearerToken(request);

  if (configuredApiKey && providedApiKey && providedApiKey === configuredApiKey) {
    return { userId: "internal-api-key", internal: true };
  }

  if (isRuntimeLogsLocalDevelopmentRequest(request)) {
    return { userId: "local-dev", internal: true };
  }

  const { userId } = await auth();
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await currentUser();
  const emails = user?.emailAddresses.map((email) => email.emailAddress.toLowerCase()) ?? [];
  if (!emails.some(isAllowlistedEngineerEmail)) {
    throw new ApiError(403, "Runtime log access is restricted");
  }

  return { userId, internal: false };
};

export const requireRuntimeLogsPageAccess = async (): Promise<{ userId: string }> => {
  if (isLocalApiMode()) {
    return { userId: "local-dev" };
  }

  const { userId } = await auth();
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await currentUser();
  const emails = user?.emailAddresses.map((email) => email.emailAddress.toLowerCase()) ?? [];
  if (!emails.some(isAllowlistedEngineerEmail)) {
    throw new ApiError(403, "Runtime log access is restricted");
  }

  return { userId };
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

export const requireRuntimeLogsDesktopAuth = async (request: Request): Promise<{ userId: string }> => {
  const authResult = await auth().catch(() => null);
  if (authResult?.userId) {
    return { userId: authResult.userId };
  }

  if (isRuntimeLogsLocalDevelopmentRequest(request)) {
    return { userId: "local-desktop" };
  }

  const bearerToken = getBearerToken(request);
  if (!bearerToken) {
    throw new ApiError(401, "Unauthorized");
  }

  const userId = await getUserIdFromDesktopSessionId(bearerToken);
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  return { userId };
};
