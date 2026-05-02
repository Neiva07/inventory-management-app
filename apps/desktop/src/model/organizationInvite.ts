import { and, eq, gt, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { invitationCodes, joinRequests, organizations } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";
import { Organization } from "./organization";

export interface InvitationCode {
  id: string;
  organizationId: string;
  code: string;
  expiresAt: number;
  usedAt?: number;
  usedBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface JoinRequest {
  id: string;
  organizationId: string;
  userId: string;
  message?: string;
  status: "pending" | "approved" | "denied";
  createdAt?: number;
  updatedAt?: number;
}

function generateInvitationCodeString(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

const mapInvitationCode = (
  row: typeof invitationCodes.$inferSelect
): InvitationCode => ({
  id: row.id,
  organizationId: row.organizationId,
  code: row.code,
  expiresAt: row.expiresAt,
  usedAt: row.usedAt ?? undefined,
  usedBy: row.usedBy ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapJoinRequest = (
  row: typeof joinRequests.$inferSelect
): JoinRequest => ({
  id: row.id,
  organizationId: row.organizationId,
  userId: row.userId,
  message: row.message ?? undefined,
  status: row.status as JoinRequest["status"],
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

/** Create an invitation code for an organization. */
export async function createInvitationCode(
  organizationId: string,
  expiresInDays: number = 30
): Promise<InvitationCode> {
  const db = createAppDb();
  const id = uuidv4();
  const code = generateInvitationCodeString();
  const now = Date.now();
  const expiresAt = now + expiresInDays * 24 * 60 * 60 * 1000;
  const row = {
    id,
    organizationId,
    code,
    expiresAt,
    usedAt: null as number | null,
    usedBy: null as string | null,
  };

  await db.insert(invitationCodes).values({
    ...row,
    createdAt: now,
    updatedAt: now,
  });

  await trackPendingSyncChange({
    organizationId,
    tableName: "invitation_codes",
    recordId: id,
    operation: "create",
    payload: row,
  });

  return { id, organizationId, code, expiresAt, createdAt: now, updatedAt: now };
}

/** Validate an invitation code (must exist and not be expired or already used). */
export async function validateInvitationCode(
  code: string
): Promise<InvitationCode | null> {
  const db = createAppDb();
  const now = Date.now();

  const rows = await db
    .select()
    .from(invitationCodes)
    .where(
      and(eq(invitationCodes.code, code), gt(invitationCodes.expiresAt, now))
    )
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  if (row.usedAt) {
    return null;
  }

  return mapInvitationCode(row);
}

/** Mark an invitation code as used. */
export async function useInvitationCode(
  codeId: string,
  usedBy?: string
): Promise<void> {
  const db = createAppDb();
  const now = Date.now();
  const rows = await db
    .select()
    .from(invitationCodes)
    .where(eq(invitationCodes.id, codeId))
    .limit(1);

  if (rows.length === 0) {
    return;
  }

  await db
    .update(invitationCodes)
    .set({ usedAt: now, usedBy: usedBy ?? null, updatedAt: now })
    .where(eq(invitationCodes.id, codeId));

  const row = rows[0];
  await trackPendingSyncChange({
    organizationId: row.organizationId,
    tableName: "invitation_codes",
    recordId: codeId,
    operation: "update",
    payload: {
      id: row.id,
      organizationId: row.organizationId,
      code: row.code,
      expiresAt: row.expiresAt,
      usedAt: now,
      usedBy: usedBy ?? null,
    },
  });
}

/** Search organizations by name prefix. */
export async function searchOrganizations(
  searchTerm: string
): Promise<Organization[]> {
  const db = createAppDb();

  const rows = await db
    .select()
    .from(organizations)
    .where(like(organizations.name, `${searchTerm}%`));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })) as Organization[];
}

/** Create a join request for an organization. */
export async function createJoinRequest(
  organizationId: string,
  userId: string,
  message?: string
): Promise<JoinRequest> {
  const db = createAppDb();
  const id = uuidv4();
  const now = Date.now();
  const row = {
    id,
    organizationId,
    userId,
    message: message ?? null,
    status: "pending" as const,
  };

  await db.insert(joinRequests).values({
    ...row,
    createdAt: now,
    updatedAt: now,
  });

  await trackPendingSyncChange({
    organizationId,
    tableName: "join_requests",
    recordId: id,
    operation: "create",
    payload: row,
  });

  return {
    id,
    organizationId,
    userId,
    message: message ?? undefined,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

/** Get all pending join requests for an organization. */
export async function getPendingJoinRequests(
  organizationId: string
): Promise<JoinRequest[]> {
  const db = createAppDb();

  const rows = await db
    .select()
    .from(joinRequests)
    .where(
      and(
        eq(joinRequests.organizationId, organizationId),
        eq(joinRequests.status, "pending")
      )
    );

  return rows.map(mapJoinRequest);
}

/** Approve or deny a join request. */
export async function respondToJoinRequest(
  requestId: string,
  status: "approved" | "denied"
): Promise<void> {
  const db = createAppDb();
  const rows = await db
    .select()
    .from(joinRequests)
    .where(eq(joinRequests.id, requestId))
    .limit(1);

  if (rows.length === 0) {
    return;
  }

  await db
    .update(joinRequests)
    .set({ status, updatedAt: Date.now() })
    .where(eq(joinRequests.id, requestId));

  const row = rows[0];
  await trackPendingSyncChange({
    organizationId: row.organizationId,
    tableName: "join_requests",
    recordId: requestId,
    operation: "update",
    payload: {
      id: row.id,
      organizationId: row.organizationId,
      userId: row.userId,
      message: row.message,
      status,
    },
  });
}

/** Get a single join request by ID. */
export async function getJoinRequest(
  joinRequestID: string
): Promise<JoinRequest | null> {
  const db = createAppDb();

  const rows = await db
    .select()
    .from(joinRequests)
    .where(eq(joinRequests.id, joinRequestID))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  return mapJoinRequest(rows[0]);
}
