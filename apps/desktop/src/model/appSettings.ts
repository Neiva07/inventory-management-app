import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { appSettings } from "../db/schema";
import { trackUserScopedSyncChange } from "../db/syncTracking";

export type UILayout = "navbar" | "sidebar";

export interface AppSettings {
  user_id: string;
  layout: UILayout;
  theme?: "light" | "dark";
  language?: string;
  timezone?: string;
  notifications?: boolean;
  navigationMode?: 'tab' | 'enter';
}

/** Get app settings for a user. */
export async function getAppSettings(
  user_id: string
): Promise<AppSettings | null> {
  const db = createAppDb();

  const rows = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.userId, user_id))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const parsed = JSON.parse(row.settingsJson) as Omit<AppSettings, "user_id">;
  return { ...parsed, user_id: row.userId };
}

/** Upsert app settings for a user (insert or update on conflict). */
export async function setAppSettings(settings: AppSettings): Promise<void> {
  const db = createAppDb();
  const now = Date.now();

  const { user_id, ...settingsData } = settings;
  const settingsJson = JSON.stringify(settingsData);
  const existing = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.userId, user_id))
    .limit(1);
  const operation = existing.length > 0 ? "update" : "create";
  const id = existing[0]?.id ?? uuidv4();

  await db
    .insert(appSettings)
    .values({
      id,
      userId: user_id,
      settingsJson,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: appSettings.userId,
      set: {
        settingsJson,
        updatedAt: now,
      },
    });

  await trackUserScopedSyncChange({
    userId: user_id,
    tableName: "app_settings",
    recordId: id,
    operation,
    payload: {
      id,
      userId: user_id,
      organizationId: existing[0]?.organizationId ?? null,
      settingsJson,
    },
  });
}
