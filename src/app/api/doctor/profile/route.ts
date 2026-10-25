
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/server-auth";
import { doctorProfileUpdateSchema } from "@/lib/validations/doctor";

export async function GET() {
  try {
    const doctor = await requireRole("DOCTOR");

    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: doctor.id },
      select: {
        id: true,
        specialtyId: true,
        licenseNumber: true,
        bio: true,
        consultationFee: true,
        timezone: true,
        approved: true,
        reviewStatus: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        specialty: {
          select: { name: true },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Doctor profile not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      profile: {
        ...profile,
        consultationFee: profile.consultationFee.toString(),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Doctor profile fetch failed.");
    return NextResponse.json(
      { error: "Could not load your profile." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const doctor = await requireRole("DOCTOR");
    const body: unknown = await request.json();
    const parsed = doctorProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid profile information.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const values = parsed.data;

    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: values.timezone,
      });
    } catch {
      return NextResponse.json(
        { error: "Enter a valid timezone." },
        { status: 400 },
      );
    }

    const specialty = await prisma.specialty.findUnique({
      where: { id: values.specialtyId },
      select: { id: true },
    });

    if (!specialty) {
      return NextResponse.json(
        { error: "The selected specialty does not exist." },
        { status: 400 },
      );
    }

    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctor.id },
      select: { id: true },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Doctor profile not found." },
        { status: 404 },
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: doctor.id },
        data: { name: values.name },
      }),
      prisma.doctorProfile.update({
        where: { userId: doctor.id },
        data: {
          specialtyId: values.specialtyId,
          bio: values.bio || null,
          consultationFee: values.consultationFee,
          timezone: values.timezone,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Profile updated successfully.",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Doctor profile update failed.");
    return NextResponse.json(
      { error: "Could not update your profile." },
      { status: 500 },
    );
  }
}
