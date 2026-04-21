import { and, asc, eq, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { makeQuerySnapshot } from "../db/firestoreCompat";
import { resolveOrganizationId } from "../db/scope";
import { units } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { generatePublicId } from "../lib/publicId";
import { COLLECTION_NAMES } from "./index";

export interface Unit {
  name: string;
  description: string;
  id: string;
  publicId: string;
  createdAt?: Date | number;
  updatedAt?: Date | number;
  userID: string;
  organizationId?: string;
  status?: string;
}

const UNIT_COLLECTION = COLLECTION_NAMES.UNITS;

export const getUnits = async (userID: string, name = "", organizationId?: string) => {
  const db = createAppDb();
  const scopeOrganizationId = resolveOrganizationId({ userID, organizationId });

  const rows = await db
    .select()
    .from(units)
    .where(and(eq(units.organizationId, scopeOrganizationId), like(units.name, `${name}%`)))
    .orderBy(asc(units.name));

  const unitRows: Unit[] = rows.map((row) => ({
    id: row.id,
    publicId: row.publicId ?? "",
    name: row.name,
    description: row.description ?? "",
    userID: row.userId,
    organizationId: row.organizationId,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return makeQuerySnapshot(unitRows);
};

export const createUnit = async (unitInfo: Partial<Unit>) => {
  const db = createAppDb();
  const id = uuidv4();
  const publicId = await generatePublicId(UNIT_COLLECTION);
  const timestamp = Date.now();

  const userID = unitInfo.userID ?? "";
  const organizationId = resolveOrganizationId({ userID, organizationId: unitInfo.organizationId });

  const row = {
    id,
    publicId,
    userId: userID,
    organizationId,
    name: unitInfo.name ?? "",
    description: unitInfo.description ?? "",
    status: unitInfo.status ?? "active",
  };

  await db.insert(units).values({
    ...row,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await trackPendingSyncChange({
    organizationId,
    tableName: "units",
    recordId: id,
    operation: "create",
    payload: row,
  });
};

export const updateUnit = async (id: string, unitInfo: Partial<Unit>) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: units.organizationId }).from(units).where(eq(units.id, id)).limit(1);

  const changes = {
    name: unitInfo.name,
    description: unitInfo.description,
  };

  await db
    .update(units)
    .set({
      ...changes,
      updatedAt: Date.now(),
    })
    .where(eq(units.id, id));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "units",
    recordId: id,
    operation: "update",
    payload: changes,
  });
};

export const deleteUnit = async (id: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: units.organizationId }).from(units).where(eq(units.id, id)).limit(1);

  await db.delete(units).where(eq(units.id, id));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "units",
    recordId: id,
    operation: "delete",
    payload: { id },
  });
};
