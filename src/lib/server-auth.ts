
import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError("Authentication required.", 401);
  }

  return user;
}

export async function requireRole(
  allowedRoles: UserRole | UserRole[],
) {
  const user = await requireAuth();
  const roles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  // Read the role from the database rather than trusting
  // a client-provided value or an unverified session field.
  const databaseUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!databaseUser || !roles.includes(databaseUser.role)) {
    throw new AuthError("You do not have permission to perform this action.", 403);
  }

  return {
    ...user,
    role: databaseUser.role,
  };
}

export async function requireApprovedDoctor() {
  const user = await requireRole("DOCTOR");

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      approved: true,
      timezone: true,
    },
  });

  if (!doctorProfile || !doctorProfile.approved) {
    throw new AuthError(
      "An approved doctor account is required.",
      403,
    );
  }

  return {
    ...user,
    doctorProfile,
  };
}
