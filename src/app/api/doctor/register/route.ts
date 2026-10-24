
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { doctorRegistrationSchema } from "@/lib/validations/doctor";

export async function POST(request: Request) {
  let createdUserId: string | undefined;

  try {
    const body: unknown = await request.json();
    const parsed = doctorRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid registration information.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const values = parsed.data;
    const email = values.email.toLowerCase();
    const licenseNumber = values.licenseNumber;

    // Validate the timezone.
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

    // Confirm the specialty exists before creating the account.
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

    // Check for existing email or license.
    const [existingUser, existingLicense] = await Promise.all([
      prisma.user.findUnique({
        where: { email },
        select: { id: true },
      }),
      prisma.doctorProfile.findUnique({
        where: { licenseNumber },
        select: { id: true },
      }),
    ]);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    if (existingLicense) {
      return NextResponse.json(
        { error: "This license number is already registered." },
        { status: 409 },
      );
    }

    // Better Auth securely hashes the password.
    // Never accept a role from the public request.
    const result = await auth.api.signUpEmail({
      body: {
        name: values.name,
        email,
        password: values.password,
      },
    });

    createdUserId = result.user.id;

    // Assign the role and create the pending profile atomically.
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: result.user.id },
        data: { role: "DOCTOR" },
      });

      await tx.doctorProfile.create({
        data: {
          userId: result.user.id,
          specialtyId: values.specialtyId,
          licenseNumber,
          bio: values.bio || null,
          consultationFee: values.consultationFee,
          timezone: values.timezone,
          approved: false,
          approvedAt: null,
          approvedById: null,
        },
      });
    });

    return NextResponse.json(
      {
        message:
          "Doctor registration submitted successfully. Your account is awaiting admin approval.",
      },
      { status: 201 },
    );
  } catch (error) {
    // If profile creation fails after signup, remove the newly
    // created user so an incomplete account is not left behind.
    if (createdUserId) {
      try {
        await prisma.user.delete({
          where: { id: createdUserId },
        });
      } catch (cleanupError) {
        console.error(
          "Failed to clean up incomplete doctor registration:",
          cleanupError,
        );
      }
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "The email or license number is already registered." },
        { status: 409 },
      );
    }

    console.error("Doctor registration failed:", error);

    return NextResponse.json(
      { error: "Doctor registration could not be completed." },
      { status: 500 },
    );
  }
}
