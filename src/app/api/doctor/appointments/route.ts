import { NextResponse } from "next/server";
import { formatInTimeZone } from "date-fns-tz";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { AuthError, requireApprovedDoctor } from "@/lib/server-auth";

const updateSchema = z.object({
  appointmentId: z.string().min(1),
  status: z.enum(["CONFIRMED", "REJECTED", "COMPLETED", "NO_SHOW"]),
});

class AppointmentActionError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 409,
  ) {
    super(message);
    this.name = "AppointmentActionError";
  }
}

function getPrismaErrorCode(error: unknown): string | undefined {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

export async function GET() {
  try {
    const doctor = await requireApprovedDoctor();
    const doctorId = doctor.doctorProfile.id;

    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      orderBy: [{ startAt: "desc" }, { id: "asc" }],
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        reason: true,
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      appointments,
      timezone: doctor.doctorProfile.timezone || "UTC",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Load doctor appointments error:", error);

    return NextResponse.json(
      { error: "Could not load appointments." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const doctor = await requireApprovedDoctor();

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid appointment update." },
        { status: 400 },
      );
    }

    const { appointmentId, status } = parsed.data;
    const doctorId = doctor.doctorProfile.id;
    const now = new Date();

    const result = await prisma.$transaction(
      async (tx) => {
        const appointment = await tx.appointment.findFirst({
          where: {
            id: appointmentId,
            doctorId,
          },
          select: {
            id: true,
            patientId: true,
            startAt: true,
            endAt: true,
            status: true,
          },
        });

        if (!appointment) {
          throw new AppointmentActionError(
            "Appointment not found.",
            404,
          );
        }

        const timezone = doctor.doctorProfile.timezone || "UTC";

        const localDateTime = formatInTimeZone(
          appointment.startAt,
          timezone,
          "EEE, MMM d, yyyy 'at' HH:mm",
        );

        // CONFIRM or REJECT: only pending requests can be decided.
        if (status === "CONFIRMED" || status === "REJECTED") {
          if (appointment.status !== "PENDING") {
            throw new AppointmentActionError(
              "Only pending appointment requests can be confirmed or rejected.",
              409,
            );
          }

          // Conditional update prevents two requests from deciding
          // the same pending appointment at the same time.
          const update = await tx.appointment.updateMany({
            where: {
              id: appointmentId,
              doctorId,
              status: "PENDING",
            },
            data: { status },
          });

          if (update.count !== 1) {
            throw new AppointmentActionError(
              "This appointment has already been updated. Refresh and try again.",
              409,
            );
          }

          const confirmed = status === "CONFIRMED";

          await tx.notification.create({
            data: {
              userId: appointment.patientId,
              appointmentId: appointment.id,
              type: confirmed
                ? "APPOINTMENT_CONFIRMED"
                : "APPOINTMENT_REJECTED",
              title: confirmed
                ? "Appointment confirmed"
                : "Appointment request rejected",
              message: confirmed
                ? `Your appointment for ${localDateTime} has been confirmed by the doctor.`
                : `Your appointment request for ${localDateTime} was rejected by the doctor. You may choose another available time.`,
            },
          });

          await tx.auditLog.create({
            data: {
              actorId: doctor.id,
              action: "APPOINTMENT_UPDATED",
              entityType: "Appointment",
              entityId: appointment.id,
              details: {
                previousStatus: "PENDING",
                newStatus: status,
              },
            },
          });

          return {
            message: confirmed
              ? "Appointment confirmed successfully."
              : "Appointment rejected successfully.",
            status,
          };
        }

        // COMPLETED or NO_SHOW: only after a confirmed appointment ends.
        if (appointment.status !== "CONFIRMED") {
          throw new AppointmentActionError(
            "Only confirmed appointments can be marked completed or no-show.",
            409,
          );
        }

        if (appointment.endAt > now) {
          throw new AppointmentActionError(
            "You can update the status after the appointment ends.",
            400,
          );
        }

        const update = await tx.appointment.updateMany({
          where: {
            id: appointmentId,
            doctorId,
            status: "CONFIRMED",
            endAt: { lte: now },
          },
          data: { status },
        });

        if (update.count !== 1) {
          throw new AppointmentActionError(
            "Appointment changed. Refresh and try again.",
            409,
          );
        }

        await tx.auditLog.create({
          data: {
            actorId: doctor.id,
            action: "APPOINTMENT_UPDATED",
            entityType: "Appointment",
            entityId: appointment.id,
            details: {
              previousStatus: "CONFIRMED",
              newStatus: status,
            },
          },
        });

        return {
          message:
            status === "COMPLETED"
              ? "Appointment marked completed."
              : "Appointment marked as no-show.",
          status,
        };
      },
      {
        isolationLevel: "Serializable",
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof AppointmentActionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const code = getPrismaErrorCode(error);

    if (code === "P2034") {
      return NextResponse.json(
        { error: "The appointment changed. Refresh and try again." },
        { status: 409 },
      );
    }

    console.error("Update doctor appointment error:", error);

    return NextResponse.json(
      { error: "Could not update appointment." },
      { status: 500 },
    );
  }
}