import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "../db/client";
import { syncControl } from "../db/schema";

const resetGenerationKey = "global_reset_generation";
const resetInProgressKey = "global_reset_in_progress";
const resetStartedAtKey = "global_reset_started_at";
const resetCompletedAtKey = "global_reset_completed_at";
const resetLastErrorKey = "global_reset_last_error";

export interface SyncResetState {
  resetGeneration: number;
  resetInProgress: boolean;
}

const now = () => Date.now();

const parseNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const parseBoolean = (value: unknown): boolean => {
  return value === true || value === "true" || value === "1" || value === 1;
};

const getControlValue = async (id: string): Promise<string | null> => {
  const rows = await db.select().from(syncControl).where(eq(syncControl.id, id)).limit(1);
  return rows[0]?.value ?? null;
};

const setControlValue = async (id: string, value: string, timestamp = now()): Promise<void> => {
  await db
    .insert(syncControl)
    .values({ id, value, updatedAt: timestamp })
    .onConflictDoUpdate({
      target: syncControl.id,
      set: { value, updatedAt: timestamp },
    });
};

export const getResetState = async (): Promise<SyncResetState> => {
  const [generation, inProgress] = await Promise.all([
    getControlValue(resetGenerationKey),
    getControlValue(resetInProgressKey),
  ]);

  return {
    resetGeneration: parseNumber(generation),
    resetInProgress: parseBoolean(inProgress),
  };
};

export const setResetInProgress = async (timestamp = now()): Promise<void> => {
  await Promise.all([
    setControlValue(resetInProgressKey, "true", timestamp),
    setControlValue(resetStartedAtKey, String(timestamp), timestamp),
    setControlValue(resetLastErrorKey, "", timestamp),
  ]);
};

export const completeReset = async (generation: number): Promise<void> => {
  const timestamp = now();
  await Promise.all([
    setControlValue(resetGenerationKey, String(generation), timestamp),
    setControlValue(resetInProgressKey, "false", timestamp),
    setControlValue(resetCompletedAtKey, String(timestamp), timestamp),
    setControlValue(resetLastErrorKey, "", timestamp),
  ]);
};

export const markResetFailed = async (error: unknown): Promise<void> => {
  const message = error instanceof Error ? error.message : String(error);
  await setControlValue(resetLastErrorKey, message.slice(0, 2000));
};

export const parseClientResetGeneration = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const getResetRequiredResponse = async (
  clientResetGeneration: unknown,
): Promise<NextResponse | null> => {
  const resetState = await getResetState();
  const parsedClientGeneration = parseClientResetGeneration(clientResetGeneration);

  if (
    resetState.resetInProgress ||
    parsedClientGeneration === null ||
    parsedClientGeneration < resetState.resetGeneration
  ) {
    return NextResponse.json(
      {
        code: "reset_required",
        resetGeneration: resetState.resetGeneration,
      },
      { status: 409 },
    );
  }

  return null;
};
