import { NextResponse } from "next/server";
import { AuthError } from "@/lib/server-auth";

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error("API error:", error);

  return NextResponse.json(
    { error: "An unexpected error occurred." },
    { status: 500 },
  );
}