
import { NextResponse } from "next/server";
import { formatInTimeZone } from "date-fns-tz";

import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/server-auth";

const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

class CancellationError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 409,
  ) {
    super(message);
    this.name = "CancellationError";
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

type RouteContext = {
  params: Promise<{
    appointmentId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const patient = await requireRole("PATIENT");
    const { appointmentId } = await context.params;

    if (!appointmentId?.trim()) {
      return NextResponse.json(
        { error: "Appointment ID is required." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const appointment = await tx.appointment.findFirst({
          where: {
            id: appointmentId,
            patientId: patient.id,
          },
          select: {
            id: true,
            patientId: true,
            status: true,
            startAt: true,
            doctor: {
              select: {
                userId: true,
                timezone: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (!appointment) {
          throw new CancellationError(
            "Appointment not found.",
            404,
          );
        }

        if (
          appointment.status !== "PENDING" &&
          appointment.status !== "CONFIRMED"
        ) {
          throw new CancellationError(
            "Only pending or confirmed appointments can be cancelled.",
            409,
          );
        }

        const now = new Date();
        const earliestAllowedStart = new Date(
          now.getTime() + CANCELLATION_WINDOW_MS,
        );

        if (appointment.startAt < earliestAllowedStart) {
          throw new CancellationError(
            "Appointments can only be cancelled at least 24 hours before their start time.",
            400,
          );
        }

        const update = await tx.appointment.updateMany({
          where: {
            id: appointment.id,
            patientId: patient.id,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
            startAt: {
              gte: earliestAllowedStart,
            },
          },
          data: {
            status: "CANCELLED",
            cancelledAt: now,
          },
        });

        if (update.count !== 1) {
          throw new CancellationError(
            "This appointment has changed. Refresh and try again.",
            409,
          );
        }

        const timezone = appointment.doctor.timezone || "UTC";
        const localDateTime = formatInTimeZone(
          appointment.startAt,
          timezone,
          "EEE, MMM d, yyyy 'at' HH:mm",
        );

        await tx.notification.createMany({
          data: [
            {
              userId: patient.id,
              appointmentId: appointment.id,
              type: "APPOINTMENT_CANCELLED",
              title: "Appointment cancelled",
              message: `Your appointment with Dr. ${appointment.doctor.user.name} for ${localDateTime} has been cancelled.`,
            },
            {
              userId: appointment.doctor.userId,
              appointmentId: appointment.id,
              type: "APPOINTMENT_CANCELLED",
              title: "Appointment cancelled by patient",
              message: `${patient.name} cancelled their appointment for ${localDateTime}.`,
            },
          ],
        });

        await tx.auditLog.create({
          data: {
            actorId: patient.id,
            action: "APPOINTMENT_CANCELLED",
            entityType: "Appointment",
            entityId: appointment.id,
            details: {
              previousStatus: appointment.status,
              newStatus: "CANCELLED",
              cancelledAt: now.toISOString(),
            },
          },
        });

        return {
          id: appointment.id,
          status: "CANCELLED" as const,
          cancelledAt: now.toISOString(),
          message: "Appointment cancelled successfully.",
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

    if (error instanceof CancellationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (getPrismaErrorCode(error) === "P2034") {
      return NextResponse.json(
        {
          error:
            "The appointment changed while you were cancelling it. Refresh and try again.",
        },
        { status: 409 },
      );
    }

    console.error("Cancel patient appointment error:", error);

    return NextResponse.json(
      { error: "Could not cancel the appointment. Please try again." },
      { status: 500 },
    );
  }
}
