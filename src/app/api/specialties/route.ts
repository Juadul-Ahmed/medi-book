
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const specialties = await prisma.specialty.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ specialties });
  } catch (error) {
    console.error("Failed to fetch specialties:", error);

    return NextResponse.json(
      { error: "Unable to load medical specialties." },
      { status: 500 }
    );
  }
}
