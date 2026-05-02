import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { createAppDb } from "../db/client";
import { userMemberships } from "../db/schema";
import { trackPendingSyncChange } from "../db/syncTracking";

export type UserRole = "admin" | "manager" | "operator" | "viewer";

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, string>;
}

export interface UserMembership {
  id: string;
  userID: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  status: "active" | "inactive" | "suspended";
  invitedBy?: string;
  invitedAt?: number;
  joinedAt: number;
  updatedAt: number;
}

export interface CreateMembershipData {
  userID: string;
  organizationId: string;
  role: UserRole;
  invitedBy?: string;
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [{ resource: "*", action: "*" }],
  manager: [
    { resource: "products", action: "*" },
    { resource: "suppliers", action: "*" },
    { resource: "customers", action: "*" },
    { resource: "orders", action: "*" },
    { resource: "inbound_orders", action: "*" },
    { resource: "supplier_bills", action: "*" },
    { resource: "installment_payments", action: "*" },
    { resource: "product_categories", action: "*" },
    { resource: "units", action: "*" },
    { resource: "users", action: "read" },
    { resource: "organizations", action: "read" },
  ],
  operator: [
    { resource: "products", action: "read" },
    { resource: "products", action: "update" },
    { resource: "suppliers", action: "read" },
    { resource: "suppliers", action: "update" },
    { resource: "customers", action: "read" },
    { resource: "customers", action: "update" },
    { resource: "orders", action: "create" },
    { resource: "orders", action: "read" },
    { resource: "orders", action: "update" },
    { resource: "inbound_orders", action: "create" },
    { resource: "inbound_orders", action: "read" },
    { resource: "inbound_orders", action: "update" },
    { resource: "supplier_bills", action: "read" },
    { resource: "installment_payments", action: "read" },
    { resource: "product_categories", action: "read" },
    { resource: "units", action: "read" },
  ],
  viewer: [
    { resource: "products", action: "read" },
    { resource: "suppliers", action: "read" },
    { resource: "customers", action: "read" },
    { resource: "orders", action: "read" },
    { resource: "inbound_orders", action: "read" },
    { resource: "supplier_bills", action: "read" },
    { resource: "installment_payments", action: "read" },
    { resource: "product_categories", action: "read" },
    { resource: "units", action: "read" },
  ],
};

const mapRow = (row: typeof userMemberships.$inferSelect): UserMembership => ({
  id: row.id,
  userID: row.userId,
  organizationId: row.organizationId,
  role: row.role as UserRole,
  permissions: ROLE_PERMISSIONS[row.role as UserRole] ?? [],
  status: row.status as UserMembership["status"],
  joinedAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const createUserMembership = async (data: CreateMembershipData): Promise<UserMembership> => {
  const db = createAppDb();
  const membershipId = uuidv4();
  const now = Date.now();
  const row = {
    id: membershipId,
    userId: data.userID,
    organizationId: data.organizationId,
    role: data.role,
    status: "active",
  };

  await db.insert(userMemberships).values({
    ...row,
    createdAt: now,
    updatedAt: now,
  });

  await trackPendingSyncChange({
    organizationId: data.organizationId,
    tableName: "user_memberships",
    recordId: membershipId,
    operation: "create",
    payload: row,
  });

  return {
    id: membershipId,
    ...data,
    permissions: ROLE_PERMISSIONS[data.role],
    status: "active",
    joinedAt: now,
    updatedAt: now,
  };
};

export const getUserMembership = async (
  userID: string,
  organizationId?: string
): Promise<UserMembership | null> => {
  const db = createAppDb();

  const filters = [
    eq(userMemberships.userId, userID),
    eq(userMemberships.status, "active"),
  ];

  if (organizationId) {
    filters.push(eq(userMemberships.organizationId, organizationId));
  }

  const rows = await db
    .select()
    .from(userMemberships)
    .where(and(...filters))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  return mapRow(rows[0]);
};

export const getUserMemberships = async (userID: string): Promise<UserMembership[]> => {
  const db = createAppDb();
  const rows = await db
    .select()
    .from(userMemberships)
    .where(
      and(
        eq(userMemberships.userId, userID),
        eq(userMemberships.status, "active")
      )
    );

  return rows.map(mapRow);
};

export const updateUserMembership = async (
  membershipId: string,
  data: Partial<UserMembership>
): Promise<UserMembership> => {
  const db = createAppDb();
  const now = Date.now();

  await db
    .update(userMemberships)
    .set({
      role: data.role,
      status: data.status,
      updatedAt: now,
    })
    .where(eq(userMemberships.id, membershipId));

  const rows = await db
    .select()
    .from(userMemberships)
    .where(eq(userMemberships.id, membershipId))
    .limit(1);

  if (rows.length === 0) {
    throw new Error("Membership not found");
  }

  const row = rows[0];

  await trackPendingSyncChange({
    organizationId: row.organizationId,
    tableName: "user_memberships",
    recordId: row.id,
    operation: "update",
    payload: {
      id: row.id,
      userId: row.userId,
      organizationId: row.organizationId,
      role: row.role,
      status: row.status,
    },
  });

  return mapRow(row);
};

export const deleteUserMembership = async (membershipId: string): Promise<void> => {
  const db = createAppDb();
  const rows = await db
    .select({ organizationId: userMemberships.organizationId })
    .from(userMemberships)
    .where(eq(userMemberships.id, membershipId))
    .limit(1);

  await db.delete(userMemberships).where(eq(userMemberships.id, membershipId));

  await trackPendingSyncChange({
    organizationId: rows[0]?.organizationId,
    tableName: "user_memberships",
    recordId: membershipId,
    operation: "delete",
    payload: { id: membershipId },
  });
};

export const getOrganizationMembers = async (organizationId: string): Promise<UserMembership[]> => {
  const db = createAppDb();
  const rows = await db
    .select()
    .from(userMemberships)
    .where(
      and(
        eq(userMemberships.organizationId, organizationId),
        eq(userMemberships.status, "active")
      )
    );

  return rows.map(mapRow);
};

/** Check whether a user has a specific permission within an organization. */
export const checkPermission = async (
  userID: string,
  organizationId: string,
  resource: string,
  action: string
): Promise<boolean> => {
  const membership = await getUserMembership(userID, organizationId);

  if (!membership) {
    return false;
  }

  return membership.permissions.some((permission) => {
    if (permission.resource === "*" && permission.action === "*") {
      return true;
    }
    if (permission.resource === "*" && permission.action === action) {
      return true;
    }
    if (permission.resource === resource && permission.action === "*") {
      return true;
    }
    return permission.resource === resource && permission.action === action;
  });
};
