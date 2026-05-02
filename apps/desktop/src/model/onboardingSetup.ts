import { inArray } from "drizzle-orm";
import { createAppDb } from "../db/client";
import { joinRequests, productCategories, units } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { UserRole } from "./userMembership";

interface OnboardingInvitation {
  email: string;
  name: string;
  role: string;
}

export interface CadastrosBasicosPayload {
  units: { name: string; description?: string }[];
  categories: { name: string; description?: string }[];
  acceptedPaymentMethodIds: string[];
  skipped?: boolean;
}

const sanitizeKey = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "_");

const buildPublicId = (prefix: string, userID: string, key: string): string =>
  `${prefix}-${sanitizeKey(userID).slice(0, 8)}-${sanitizeKey(key)}`.slice(0, 40);

const normalizeRole = (role: string): UserRole => {
  if (role === "admin" || role === "manager" || role === "operator" || role === "viewer") {
    return role;
  }
  return "viewer";
};

export const persistOnboardingTeamInvitations = async (
  organizationId: string,
  invitedBy: string,
  invitations: OnboardingInvitation[]
): Promise<void> => {
  const now = Date.now();
  const db = createAppDb();

  const dedupedInvites = Array.from(
    new Map(
      invitations
        .filter((invitation) => invitation.email?.trim())
        .map((invitation) => [invitation.email.trim().toLowerCase(), invitation])
    ).values()
  );

  if (dedupedInvites.length === 0) {
    return;
  }

  const rows = dedupedInvites.map((invitation) => {
    const normalizedEmail = invitation.email.trim().toLowerCase();
    const invitationId =
      `onb_${sanitizeKey(organizationId).slice(0, 20)}_${sanitizeKey(normalizedEmail).slice(0, 20)}`;

    return {
      id: invitationId,
      organizationId,
      userId: invitedBy,
      message: `Convite enviado no onboarding para a função ${normalizeRole(invitation.role)}.`,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
  });

  const existingRows = await db
    .select({ id: joinRequests.id })
    .from(joinRequests)
    .where(inArray(joinRequests.id, rows.map((row) => row.id)));
  const existingIds = new Set(existingRows.map((row) => row.id));

  for (const row of rows) {
    await db
      .insert(joinRequests)
      .values(row)
      .onConflictDoUpdate({
        target: joinRequests.id,
        set: {
          message: row.message,
          status: row.status,
          updatedAt: now,
        },
      });

    await trackPendingSyncChange({
      organizationId,
      tableName: "join_requests",
      recordId: row.id,
      operation: existingIds.has(row.id) ? "update" : "create",
      payload: {
        id: row.id,
        organizationId: row.organizationId,
        userId: row.userId,
        message: row.message,
        status: row.status,
      },
    });
  }
};

export const seedCadastrosBasicos = async (
  userID: string,
  organizationId: string,
  payload: CadastrosBasicosPayload
): Promise<void> => {
  const db = createAppDb();
  const now = Date.now();

  const trimmedUnits = payload.units
    .map((unit) => ({
      name: unit.name.trim(),
      description: unit.description?.trim() || undefined,
    }))
    .filter((unit) => unit.name.length > 0);

  const trimmedCategories = payload.categories
    .map((category) => ({
      name: category.name.trim(),
      description: category.description?.trim() || undefined,
    }))
    .filter((category) => category.name.length > 0);

  if (trimmedUnits.length > 0) {
    const unitRows = trimmedUnits.map((unit, index) => {
      const key = `${sanitizeKey(unit.name)}_${index}`;
      return {
        id: `unit_${sanitizeKey(organizationId).slice(0, 20)}_${key}`,
        publicId: buildPublicId("unit", userID, key),
        userId: userID,
        organizationId,
        name: unit.name,
        description: unit.description,
        status: "active",
        createdAt: now,
        updatedAt: now,
      };
    });

    const existingUnitRows = await db
      .select({ id: units.id })
      .from(units)
      .where(inArray(units.id, unitRows.map((row) => row.id)));
    const existingUnitIds = new Set(existingUnitRows.map((row) => row.id));

    await db.insert(units).values(unitRows).onConflictDoNothing({ target: units.id });

    for (const row of unitRows) {
      await trackPendingSyncChange({
        organizationId,
        tableName: "units",
        recordId: row.id,
        operation: existingUnitIds.has(row.id) ? "update" : "create",
        payload: {
          id: row.id,
          publicId: row.publicId,
          userId: row.userId,
          organizationId: row.organizationId,
          name: row.name,
          description: row.description,
          status: row.status,
        },
      });
    }
  }

  if (trimmedCategories.length > 0) {
    const categoryRows = trimmedCategories.map((category, index) => {
      const key = `${sanitizeKey(category.name)}_${index}`;
      return {
        id: `pcat_${sanitizeKey(organizationId).slice(0, 20)}_${key}`,
        publicId: buildPublicId("pcat", userID, key),
        userId: userID,
        organizationId,
        name: category.name,
        description: category.description,
        status: "active",
        createdAt: now,
        updatedAt: now,
      };
    });

    const existingCategoryRows = await db
      .select({ id: productCategories.id })
      .from(productCategories)
      .where(inArray(productCategories.id, categoryRows.map((row) => row.id)));
    const existingCategoryIds = new Set(existingCategoryRows.map((row) => row.id));

    await db
      .insert(productCategories)
      .values(categoryRows)
      .onConflictDoNothing({ target: productCategories.id });

    for (const row of categoryRows) {
      await trackPendingSyncChange({
        organizationId,
        tableName: "product_categories",
        recordId: row.id,
        operation: existingCategoryIds.has(row.id) ? "update" : "create",
        payload: {
          id: row.id,
          publicId: row.publicId,
          userId: row.userId,
          organizationId: row.organizationId,
          name: row.name,
          description: row.description,
          status: row.status,
        },
      });
    }
  }
};
