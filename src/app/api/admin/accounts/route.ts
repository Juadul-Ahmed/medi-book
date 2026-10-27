
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/server-auth";
import type { UserRole } from "@/generated/prisma/client";

const allowedRoles = ["PATIENT", "DOCTOR"] as const;

type AccountRole = (typeof allowedRoles)[number];

function isAccountRole(role: string): role is AccountRole {
  return allowedRoles.some((allowedRole) => allowedRole === role);
}

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const requestedRole = searchParams.get("role") ?? "ALL";

    if (requestedRole !== "ALL" && !isAccountRole(requestedRole)) {
      return NextResponse.json(
        { error: "Invalid account role." },
        { status: 400 },
      );
    }

    const roleFilter: UserRole | { in: UserRole[] } =
      requestedRole === "ALL"
        ? { in: [...allowedRoles] }
        : requestedRole;

    const users = await prisma.user.findMany({
      where: {
        role: roleFilter,
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isBlocked: true,
        blockedAt: true,
        blockedReason: true,
        doctorProfile: {
          select: {
            id: true,
            approved: true,
            reviewStatus: true,
            specialty: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({
      accounts: users,
      limit: 100,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Failed to fetch admin accounts:", error);

    return NextResponse.json(
      { error: "Unable to load accounts." },
      { status: 500 },
    );
  }
}
