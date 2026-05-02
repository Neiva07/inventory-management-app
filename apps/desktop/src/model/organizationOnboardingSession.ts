import { and, desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { onboardingSessions } from "../db/schema";
import { trackUserScopedSyncChange } from "../db/syncTracking";

export type OnboardingStatus = "in_progress" | "completed";

export interface OrganizationOnboardingData {
  organization: {
    name: string;
    domain?: string;
    logo?: string;
    employeeCount?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    organizationPhoneNumber?: string;
    organizationEmail?: string;
    pocName?: string;
    pocRole?: string;
    pocPhoneNumber?: string;
    pocEmail?: string;
  };
  taxData?: {
    razaoSocial?: string;
    cnpj?: string;
    ie?: string;
    im?: string;
    a1Certificate?: string;
  };
  setup?: {
    enableNotifications?: boolean;
    enableAnalytics?: boolean;
  };
  cadastrosBasicos?: {
    units: { name: string; description?: string }[];
    categories: { name: string; description?: string }[];
    acceptedPaymentMethodIds: string[];
    skipped?: boolean;
  };
  invitations?: {
    email: string;
    role: string;
    name: string;
  }[];
}

interface OnboardingProgress {
  [stepId: string]: {
    completed: boolean;
    completedAt?: number;
    data?: Record<string, unknown>;
  };
}

interface OnboardingPayload {
  data: OrganizationOnboardingData;
  progress: OnboardingProgress;
  completedAt?: number;
  lastActivityAt: number;
}

export interface OrganizationOnboardingSession {
  id: string;
  userID: string;
  currentStep: number;
  data: OrganizationOnboardingData;
  status: OnboardingStatus;
  startedAt: number;
  completedAt?: number;
  lastActivityAt: number;
  progress: OnboardingProgress;
}

const parsePayload = (payloadJson: string | null): OnboardingPayload => {
  if (!payloadJson) {
    return {
      data: { organization: { name: "" } },
      progress: {},
      lastActivityAt: Date.now(),
    };
  }
  return JSON.parse(payloadJson) as OnboardingPayload;
};

const mapSession = (
  row: typeof onboardingSessions.$inferSelect
): OrganizationOnboardingSession => {
  const payload = parsePayload(row.payloadJson);
  return {
    id: row.id,
    userID: row.userId,
    currentStep: row.step,
    data: payload.data,
    status: row.status as OnboardingStatus,
    startedAt: row.createdAt,
    completedAt: payload.completedAt,
    lastActivityAt: payload.lastActivityAt,
    progress: payload.progress,
  };
};

const buildSessionRow = (args: {
  id: string;
  userId: string;
  status: OnboardingStatus;
  step: number;
  payloadJson: string;
}): {
  id: string;
  userId: string;
  organizationId: string | null;
  status: OnboardingStatus;
  step: number;
  payloadJson: string;
} => ({
  id: args.id,
  userId: args.userId,
  organizationId: null,
  status: args.status,
  step: args.step,
  payloadJson: args.payloadJson,
});

/** Create a new onboarding session for a user. */
export async function createOnboardingSession(
  userID: string
): Promise<OrganizationOnboardingSession> {
  const db = createAppDb();
  const id = uuidv4();
  const now = Date.now();

  const payload: OnboardingPayload = {
    data: { organization: { name: "" } },
    progress: {},
    lastActivityAt: now,
  };
  const payloadJson = JSON.stringify(payload);
  const row = buildSessionRow({
    id,
    userId: userID,
    status: "in_progress",
    step: 1,
    payloadJson,
  });

  await db.insert(onboardingSessions).values({
    ...row,
    createdAt: now,
    updatedAt: now,
  });

  await trackUserScopedSyncChange({
    userId: userID,
    tableName: "onboarding_sessions",
    recordId: id,
    operation: "create",
    payload: row,
  });

  return {
    id,
    userID,
    currentStep: 1,
    data: payload.data,
    status: "in_progress",
    startedAt: now,
    lastActivityAt: now,
    progress: {},
  };
}

/** Get an onboarding session by ID. */
export async function getOnboardingSession(
  sessionId: string
): Promise<OrganizationOnboardingSession | null> {
  const db = createAppDb();

  const rows = await db
    .select()
    .from(onboardingSessions)
    .where(eq(onboardingSessions.id, sessionId))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  return mapSession(rows[0]);
}

/** Update an onboarding session with partial data. */
export async function updateOnboardingSession(
  sessionId: string,
  updates: Partial<OrganizationOnboardingSession>
): Promise<OrganizationOnboardingSession> {
  const db = createAppDb();
  const now = Date.now();

  const existing = await getOnboardingSession(sessionId);
  if (!existing) {
    throw new Error("Onboarding session not found");
  }

  const mergedData = updates.data ?? existing.data;
  const mergedProgress = updates.progress ?? existing.progress;
  const completedAt = updates.completedAt ?? existing.completedAt;
  const lastActivityAt = now;

  const payload: OnboardingPayload = {
    data: mergedData,
    progress: mergedProgress,
    completedAt,
    lastActivityAt,
  };
  const payloadJson = JSON.stringify(payload);
  const row = buildSessionRow({
    id: sessionId,
    userId: existing.userID,
    status: updates.status ?? existing.status,
    step: updates.currentStep ?? existing.currentStep,
    payloadJson,
  });

  await db
    .update(onboardingSessions)
    .set({
      step: row.step,
      status: row.status,
      payloadJson,
      updatedAt: now,
    })
    .where(eq(onboardingSessions.id, sessionId));

  await trackUserScopedSyncChange({
    userId: existing.userID,
    tableName: "onboarding_sessions",
    recordId: sessionId,
    operation: "update",
    payload: row,
  });

  return {
    ...existing,
    ...updates,
    data: mergedData,
    progress: mergedProgress,
    completedAt,
    lastActivityAt,
  };
}

/** Mark an onboarding session as completed. */
export async function completeOnboardingSession(
  sessionId: string
): Promise<OrganizationOnboardingSession> {
  return await updateOnboardingSession(sessionId, {
    status: "completed",
    completedAt: Date.now(),
  });
}

/** Get the most recent active (in_progress) onboarding session for a user. */
export async function getActiveOnboardingSession(
  userID: string
): Promise<OrganizationOnboardingSession | null> {
  const db = createAppDb();

  const rows = await db
    .select()
    .from(onboardingSessions)
    .where(
      and(
        eq(onboardingSessions.userId, userID),
        eq(onboardingSessions.status, "in_progress")
      )
    )
    .orderBy(desc(onboardingSessions.updatedAt))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  return mapSession(rows[0]);
}

/** Delete an onboarding session. */
export async function deleteOnboardingSession(
  sessionId: string
): Promise<void> {
  const db = createAppDb();
  const rows = await db
    .select({ userId: onboardingSessions.userId })
    .from(onboardingSessions)
    .where(eq(onboardingSessions.id, sessionId))
    .limit(1);

  await db
    .delete(onboardingSessions)
    .where(eq(onboardingSessions.id, sessionId));

  await trackUserScopedSyncChange({
    userId: rows[0]?.userId,
    tableName: "onboarding_sessions",
    recordId: sessionId,
    operation: "delete",
    payload: {
      id: sessionId,
      userId: rows[0]?.userId,
    },
  });
}

/** Update the step of an onboarding session and record step progress. */
export async function updateOnboardingStep(
  sessionId: string,
  step: number,
  stepData?: Record<string, unknown>
): Promise<OrganizationOnboardingSession> {
  const existing = await getOnboardingSession(sessionId);
  if (!existing) {
    throw new Error("Onboarding session not found");
  }

  const stepId = `step_${step}`;
  const progressEntry: OnboardingProgress[string] = {
    completed: true,
    completedAt: Date.now(),
  };

  if (stepData !== undefined) {
    progressEntry.data = stepData;
  }

  const progress: OnboardingProgress = {
    ...existing.progress,
    [stepId]: progressEntry,
  };

  return await updateOnboardingSession(sessionId, {
    currentStep: step,
    progress,
  });
}

/** Merge additional data into the onboarding session payload. */
export async function updateOnboardingData(
  sessionId: string,
  data: Partial<OrganizationOnboardingData>
): Promise<OrganizationOnboardingSession> {
  const existing = await getOnboardingSession(sessionId);
  if (!existing) {
    throw new Error("Onboarding session not found");
  }

  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );

  return await updateOnboardingSession(sessionId, {
    data: {
      ...existing.data,
      ...cleanData,
    } as OrganizationOnboardingData,
  });
}
