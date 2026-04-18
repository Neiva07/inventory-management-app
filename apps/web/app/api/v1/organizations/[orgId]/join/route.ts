import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/errors";
import { db } from "@/lib/db/client";
import { invitationCodes, userMemberships, syncEvents } from "@/lib/db/schema";

interface RouteContext {
  params: Promise<{ orgId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await requireAuth();
    const { orgId } = await context.params;
    const { invitationCode, message } = await request.json();

    if (!invitationCode) {
      throw new ApiError(400, "Invitation code is required");
    }

    // Validate invitation code
    const codes = await db
      .select()
      .from(invitationCodes)
      .where(
        and(
          eq(invitationCodes.organizationId, orgId),
          eq(invitationCodes.code, invitationCode),
          gt(invitationCodes.expiresAt, Date.now()),
          isNull(invitationCodes.usedAt),
        ),
      )
      .limit(1);

    if (codes.length === 0) {
      throw new ApiError(400, "Invalid or expired invitation code");
    }

    // Check user doesn't already have a membership
    const existingMembership = await db
      .select({ id: userMemberships.id })
      .from(userMemberships)
      .where(
        and(
          eq(userMemberships.userId, userId),
          eq(userMemberships.organizationId, orgId),
          eq(userMemberships.status, "active"),
        ),
      )
      .limit(1);

    if (existingMembership.length > 0) {
      throw new ApiError(409, "User is already a member of this organization");
    }

    const now = Date.now();
    const membershipId = `${now}_${Math.random().toString(36).slice(2, 10)}`;

    // Mark invitation as used
    await db
      .update(invitationCodes)
      .set({ usedAt: now, usedBy: userId, updatedAt: now })
      .where(eq(invitationCodes.id, codes[0].id));

    // Create membership
    await db.insert(userMemberships).values({
      id: membershipId,
      userId,
      organizationId: orgId,
      role: "member",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Append sync event so other clients learn about the new membership
    await db.insert(syncEvents).values({
      id: `evt_${now}_${Math.random().toString(36).slice(2, 8)}`,
      tableName: "user_memberships",
      recordId: membershipId,
      operation: "create",
      scopeType: "organization",
      scopeId: orgId,
      payloadJson: JSON.stringify({
        id: membershipId,
        userId,
        organizationId: orgId,
        role: "member",
        status: "active",
        createdAt: now,
        updatedAt: now,
      }),
      clientId: null,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    void message; // message is for future join_requests audit trail

    return NextResponse.json({
      membershipId,
      organizationId: orgId,
      role: "member",
      status: "active",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
