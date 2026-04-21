import { NextRequest, NextResponse } from "next/server";
import { and, eq, like, notInArray, sql } from "drizzle-orm";
import { requireRequestAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { db } from "@/lib/db/client";
import { organizations, userMemberships } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireRequestAuth(request);
    const query = request.nextUrl.searchParams.get("q") ?? "";

    if (query.length < 2) {
      return NextResponse.json({ organizations: [] });
    }

    // Get orgs the user already belongs to
    const userOrgIds = await db
      .select({ orgId: userMemberships.organizationId })
      .from(userMemberships)
      .where(and(eq(userMemberships.userId, userId), eq(userMemberships.status, "active")));

    const excludeIds = userOrgIds.map((r) => r.orgId);

    // Search active orgs by name, excluding user's current orgs
    const baseConditions = and(
      like(organizations.name, `%${query}%`),
      eq(organizations.status, "active"),
    );

    const whereClause = excludeIds.length > 0
      ? and(baseConditions, notInArray(organizations.id, excludeIds))
      : baseConditions;

    const results = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        memberCount: sql<number>`(SELECT COUNT(*) FROM user_memberships WHERE organization_id = ${organizations.id} AND status = 'active')`,
      })
      .from(organizations)
      .where(whereClause)
      .limit(20);

    return NextResponse.json({ organizations: results });
  } catch (error) {
    return handleApiError(error);
  }
}
