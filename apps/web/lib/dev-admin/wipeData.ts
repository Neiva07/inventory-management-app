import { client } from "@/lib/db/client";
import {
  completeReset,
  getResetState,
  markResetFailed,
  setResetInProgress,
} from "@/lib/sync/resetControl";

export const wipeAllDataTables = [
  "sync_events",
  "runtime_log_entries",
  "runtime_log_launches",
  "runtime_log_meta",
  "installment_payments",
  "supplier_bills",
  "inbound_order_payments",
  "inbound_order_items",
  "inbound_order",
  "order_items",
  "orders",
  "product_variants",
  "products",
  "supplier_product_categories",
  "suppliers",
  "customers",
  "product_categories",
  "units",
  "join_requests",
  "invitation_codes",
  "onboarding_sessions",
  "app_settings",
  "user_memberships",
  "organizations",
  "users",
] as const;

export interface ClerkUserDeleteFailure {
  userId: string;
  error: string;
}

export interface WipeAllDataResult {
  resetGeneration: number;
  wipedAt: number;
  tables: Array<{
    name: string;
    rowsAffected: number;
  }>;
  clerkUsersDeleted: number;
  clerkUserDeleteFailures: ClerkUserDeleteFailure[];
}

const getClerkSecret = (): string | null =>
  process.env.CLERK_SECRET_KEY ?? process.env.CLERK_API_SECRET_KEY ?? null;

const getAppClerkUserIds = async (): Promise<string[]> => {
  const result = await client.execute("SELECT users_id FROM users");
  return result.rows
    .map((row) => row.users_id)
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
};

const deleteClerkUser = async (
  userId: string,
  clerkSecret: string,
): Promise<ClerkUserDeleteFailure | null> => {
  const response = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${clerkSecret}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (response.ok) {
    return null;
  }

  const body = await response.text().catch(() => "");
  return {
    userId,
    error: body || `Clerk returned ${response.status}`,
  };
};

const deleteClerkUsers = async (
  userIds: string[],
): Promise<{ deleted: number; failures: ClerkUserDeleteFailure[] }> => {
  if (!userIds.length) {
    return { deleted: 0, failures: [] };
  }

  const clerkSecret = getClerkSecret();
  if (!clerkSecret) {
    return {
      deleted: 0,
      failures: userIds.map((userId) => ({
        userId,
        error: "Clerk secret is not configured",
      })),
    };
  }

  let deleted = 0;
  const failures: ClerkUserDeleteFailure[] = [];

  for (const userId of userIds) {
    try {
      const failure = await deleteClerkUser(userId, clerkSecret);
      if (failure) {
        failures.push(failure);
      } else {
        deleted += 1;
      }
    } catch (error) {
      failures.push({
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { deleted, failures };
};

const wipeDatabaseTables = async (): Promise<WipeAllDataResult["tables"]> => {
  const results = await client.batch(
    wipeAllDataTables.map((tableName) => ({
      sql: `DELETE FROM ${tableName}`,
      args: [],
    })),
    "write",
  );

  return wipeAllDataTables.map((tableName, index) => ({
    name: tableName,
    rowsAffected: results[index]?.rowsAffected ?? 0,
  }));
};

export const wipeAllData = async (): Promise<WipeAllDataResult> => {
  const wipedAt = Date.now();
  await setResetInProgress(wipedAt);

  try {
    const clerkUserIds = await getAppClerkUserIds();
    const tables = await wipeDatabaseTables();
    const clerkResult = await deleteClerkUsers(clerkUserIds);
    await completeReset(wipedAt);

    return {
      resetGeneration: wipedAt,
      wipedAt,
      tables,
      clerkUsersDeleted: clerkResult.deleted,
      clerkUserDeleteFailures: clerkResult.failures,
    };
  } catch (error) {
    await markResetFailed(error);
    throw error;
  }
};

export const getResetGeneration = async (): Promise<number> => {
  return (await getResetState()).resetGeneration;
};
