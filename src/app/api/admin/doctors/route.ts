
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/server-auth";

export async function GET() {
  try {
    await requireRole("ADMIN");

    const doctors = await prisma.doctorProfile.findMany({
      where: {
        reviewStatus: "PENDING",
      },
      select: {
        id: true,
        licenseNumber: true,
        bio: true,
        consultationFee: true,
        timezone: true,
        reviewStatus: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        specialty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      doctors: doctors.map((doctor) => ({
        ...doctor,
        consultationFee: doctor.consultationFee.toString(),
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Failed to fetch doctor applications:", error);

    return NextResponse.json(
      { error: "Unable to load doctor applications." },
      { status: 500 }
    );
  }
}
