
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/server-auth";

type RouteContext = {
  params: Promise<{ accountId: string }>;
};

type StatusRequest = {
  action?: unknown;
  reason?: unknown;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const admin = await requireRole("ADMIN");
    const { accountId } = await params;

    let body: StatusRequest;

    try {
      body = (await request.json()) as StatusRequest;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    if (body.action !== "BLOCK" && body.action !== "UNBLOCK") {
      return NextResponse.json(
        { error: "Action must be BLOCK or UNBLOCK." },
        { status: 400 },
      );
    }

    let reason: string | null = null;

    if (body.reason !== undefined && body.reason !== null) {
      if (typeof body.reason !== "string") {
        return NextResponse.json(
          { error: "Reason must be a string." },
          { status: 400 },
        );
      }

      reason = body.reason.trim();

      if (reason.length > 500) {
        return NextResponse.json(
          { error: "Reason cannot exceed 500 characters." },
          { status: 400 },
        );
      }

      if (!reason) {
        reason = null;
      }
    }

    if (accountId === admin.id) {
      return NextResponse.json(
        { error: "You cannot change your own account status." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: accountId },
        select: {
          id: true,
          role: true,
          isBlocked: true,
        },
      });

      if (!target) {
        return { error: "Account not found.", status: 404 } as const;
      }

      if (target.role !== "PATIENT" && target.role !== "DOCTOR") {
        return {
          error: "Only patient and doctor accounts can be changed.",
          status: 403,
        } as const;
      }

      const shouldBlock = body.action === "BLOCK";

      if (target.isBlocked === shouldBlock) {
        return {
          error: shouldBlock
            ? "This account is already blocked."
            : "This account is not blocked.",
          status: 409,
        } as const;
      }

      await tx.user.update({
        where: { id: target.id },
        data: {
          isBlocked: shouldBlock,
          blockedAt: shouldBlock ? new Date() : null,
          blockedReason: shouldBlock ? reason : null,
        },
      });

      if (shouldBlock) {
        // Revoke existing sessions so the user must sign in again.
        await tx.session.deleteMany({
          where: { userId: target.id },
        });
      }

      await tx.auditLog.create({
        data: {
          action: shouldBlock ? "USER_BLOCKED" : "USER_UNBLOCKED",
          entityType: "User",
          entityId: target.id,
          details: {
            role: target.role,
            reason: shouldBlock ? reason : null,
            changedBy: admin.id,
          },
        },
      });

      return {
        success: true,
        accountId: target.id,
        isBlocked: shouldBlock,
      } as const;
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Failed to update account status:", error);

    return NextResponse.json(
      { error: "Unable to update account status." },
      { status: 500 },
    );
  }
}
