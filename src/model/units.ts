import { and, asc, eq, isNull, like } from "drizzle-orm";
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
  deleted?: {
    date: Date | number;
    isDeleted: boolean;
  };
}

const UNIT_COLLECTION = COLLECTION_NAMES.UNITS;

export const getUnits = async (userID: string, name = "", organizationId?: string) => {
  const db = createAppDb();
  const scopeOrganizationId = resolveOrganizationId({ userID, organizationId });

  const rows = await db
    .select()
    .from(units)
    .where(and(eq(units.organizationId, scopeOrganizationId), isNull(units.deletedAt), like(units.name, `${name}%`)))
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
    deleted: {
      isDeleted: row.deletedAt !== null,
      date: row.deletedAt ?? 0,
    },
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

  await db.insert(units).values({
    id,
    publicId,
    userId: userID,
    organizationId,
    name: unitInfo.name ?? "",
    description: unitInfo.description ?? "",
    status: unitInfo.status ?? "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  });

  await trackPendingSyncChange({
    organizationId,
    tableName: "units",
    recordId: id,
    operation: "create",
    payload: unitInfo,
  });
};

export const updateUnit = async (id: string, unitInfo: Partial<Unit>) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: units.organizationId }).from(units).where(eq(units.id, id)).limit(1);

  await db
    .update(units)
    .set({
      name: unitInfo.name,
      description: unitInfo.description,
      updatedAt: Date.now(),
    })
    .where(eq(units.id, id));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "units",
    recordId: id,
    operation: "update",
    payload: unitInfo,
  });
};

export const deleteUnit = async (id: string) => {
  const db = createAppDb();
  const existing = await db.select({ organizationId: units.organizationId }).from(units).where(eq(units.id, id)).limit(1);

  await db
    .update(units)
    .set({
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    })
    .where(eq(units.id, id));

  await trackPendingSyncChange({
    organizationId: existing[0]?.organizationId,
    tableName: "units",
    recordId: id,
    operation: "delete",
    payload: { id },
  });
};
