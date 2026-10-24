import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const user = await requireRole("ADMIN");

    return NextResponse.json({
      message: "Admin access verified.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}