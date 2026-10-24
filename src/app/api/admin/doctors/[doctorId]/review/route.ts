
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/server-auth";

type RouteContext = {
  params: Promise<{ doctorId: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const admin = await requireRole("ADMIN");
    const { doctorId } = await context.params;

    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("decision" in body) ||
      (body.decision !== "APPROVED" && body.decision !== "REJECTED")
    ) {
      return NextResponse.json(
        { error: 'Decision must be "APPROVED" or "REJECTED".' },
        { status: 400 }
      );
    }

    const decision = body.decision;
    const approved = decision === "APPROVED";

    const result = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctorProfile.findUnique({
        where: { id: doctorId },
        select: {
          id: true,
          userId: true,
          reviewStatus: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!doctor) {
        throw new Error("DOCTOR_APPLICATION_NOT_FOUND");
      }

      if (doctor.reviewStatus !== "PENDING") {
        throw new Error("DOCTOR_APPLICATION_ALREADY_REVIEWED");
      }

      // Conditional update prevents two admins from reviewing
      // the same pending application at the same time.
      const updated = await tx.doctorProfile.updateMany({
        where: {
          id: doctorId,
          reviewStatus: "PENDING",
        },
        data: {
          approved,
          reviewStatus: decision,
          approvedAt: approved ? new Date() : null,
          approvedById: admin.id,
        },
      });

      if (updated.count !== 1) {
        throw new Error("DOCTOR_APPLICATION_ALREADY_REVIEWED");
      }

      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: approved ? "DOCTOR_APPROVED" : "DOCTOR_REJECTED",
          entityType: "DoctorProfile",
          entityId: doctor.id,
          details: {
            decision,
            doctorUserId: doctor.userId,
          },
        },
      });

      await tx.notification.create({
        data: {
          userId: doctor.userId,
          type: approved ? "DOCTOR_APPROVED" : "GENERAL",
          title: approved
            ? "Your doctor account has been approved"
            : "Your doctor application was rejected",
          message: approved
            ? "Your doctor account is now approved. You can sign in and continue setting up your services."
            : "Your doctor application was not approved. Please contact the administration for more information.",
        },
      });

      return {
        doctorId: doctor.id,
        doctorName: doctor.user.name,
        decision,
      };
    });

    return NextResponse.json({
      message: approved
        ? "Doctor application approved successfully."
        : "Doctor application rejected successfully.",
      application: result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof Error) {
      if (error.message === "DOCTOR_APPLICATION_NOT_FOUND") {
        return NextResponse.json(
          { error: "Doctor application not found." },
          { status: 404 }
        );
      }

      if (error.message === "DOCTOR_APPLICATION_ALREADY_REVIEWED") {
        return NextResponse.json(
          { error: "This application has already been reviewed." },
          { status: 409 }
        );
      }
    }

    console.error("Failed to review doctor application:", error);

    return NextResponse.json(
      { error: "Unable to review doctor application." },
      { status: 500 }
    );
  }
}
