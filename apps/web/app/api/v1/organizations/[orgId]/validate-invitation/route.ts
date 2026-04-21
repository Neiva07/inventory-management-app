import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { requireRequestAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { db } from "@/lib/db/client";
import { invitationCodes, organizations } from "@/lib/db/schema";

interface RouteContext {
  params: Promise<{ orgId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await requireRequestAuth(request);
    const { orgId } = await context.params;
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(invitationCodes)
      .where(
        and(
          eq(invitationCodes.organizationId, orgId),
          eq(invitationCodes.code, code),
          gt(invitationCodes.expiresAt, Date.now()),
          isNull(invitationCodes.usedAt),
        ),
      )
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ valid: false });
    }

    const org = await db
      .select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    return NextResponse.json({
      valid: true,
      organizationId: orgId,
      organizationName: org[0]?.name ?? null,
      expiresAt: rows[0].expiresAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
