import { NextResponse } from "next/server";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/server-auth";
import {
  getAvailableSlots,
  SlotAvailabilityError,
} from "@/lib/appointments/available-slots";

class BookingError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 409,
  ) {
    super(message);
    this.name = "BookingError";
  }
}

const bookingSchema = z.object({
  doctorId: z.string().trim().min(1).max(100),
  startAt: z.string().refine((value) => {
    const date = new Date(value);

    return Number.isFinite(date.getTime()) && date.toISOString() === value;
  }, "Select a valid appointment time."),
  reason: z.string().trim().max(1000).optional(),
});

function getPrismaErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;

  return typeof code === "string" ? code : undefined;
}

function getNextCalendarDate(date: string): string {
  const nextDate = new Date(`${date}T12:00:00.000Z`);

  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  return nextDate.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const patient = await requireRole("PATIENT");

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid booking information.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { doctorId, startAt: startAtString, reason } = parsed.data;

    const requestedStart = new Date(startAtString);

    const appointment = await prisma.$transaction(
      async (tx) => {
        const doctor = await tx.doctorProfile.findFirst({
          where: {
            id: doctorId,
            approved: true,
            reviewStatus: "APPROVED",
          },
          select: {
            id: true,
            userId: true,
            timezone: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!doctor) {
          throw new BookingError(
            "This doctor is not available for booking.",
            404,
          );
        }

        const timezone = doctor.timezone || "UTC";

        // Determine the requested calendar date in the doctor's time zone.
        const appointmentDate = formatInTimeZone(
          requestedStart,
          timezone,
          "yyyy-MM-dd",
        );

        // Calculate the exact start and end of that local calendar day.
        const nextDate = getNextCalendarDate(appointmentDate);

        const dayStart = fromZonedTime(`${appointmentDate}T00:00:00`, timezone);

        const dayEnd = fromZonedTime(`${nextDate}T00:00:00`, timezone);

        // RULE: One non-cancelled appointment per patient per day.
        // This check applies across all doctors, using the selected
        // doctor's time zone to define the calendar day.
        const existingPatientAppointment = await tx.appointment.findFirst({
          where: {
            patientId: patient.id,
            status: {
              not: "CANCELLED",
            },
            startAt: {
              gte: dayStart,
              lt: dayEnd,
            },
          },
          select: {
            id: true,
            startAt: true,
            status: true,
          },
        });

        if (existingPatientAppointment) {
          throw new BookingError(
            "You already have an appointment that day. Each patient can book only one appointment per day. Please choose another date.",
            409,
          );
        }

        // Recheck the doctor's available slots in this transaction.
        const availability = await getAvailableSlots(
          tx,
          doctor.id,
          appointmentDate,
        );

        const selectedSlot = availability.slots.find(
          (slot) => slot.startAt === startAtString,
        );

        if (!selectedSlot) {
          throw new BookingError(
            "This time slot is no longer available. Refresh the available slots and choose another time.",
            409,
          );
        }

        const startAt = new Date(selectedSlot.startAt);
        const endAt = new Date(selectedSlot.endAt);

        // The server determines the appointment duration.
        if (endAt.getTime() - startAt.getTime() !== 30 * 60 * 1000) {
          throw new BookingError(
            "The selected slot is invalid. Please choose another time.",
            409,
          );
        }

        // Successful appointments are confirmed immediately.
        const created = await tx.appointment.create({
          data: {
            patientId: patient.id,
            doctorId: doctor.id,
            startAt,
            endAt,
            status: "PENDING",
            reason: reason || null,
          },
          select: {
            id: true,
            startAt: true,
            endAt: true,
            status: true,
            reason: true,
          },
        });

        const localDateTime = formatInTimeZone(
          startAt,
          timezone,
          "EEE, MMM d, yyyy 'at' HH:mm",
        );

        // Notify both the patient and doctor.
        await tx.notification.createMany({
          data: [
            {
              userId: patient.id,
              appointmentId: created.id,
              type: "GENERAL",
              title: "Appointment request submitted",
              message: `Your appointment request with Dr. ${doctor.user.name} for ${localDateTime} is waiting for the doctor's confirmation.`,
            },
            {
              userId: doctor.userId,
              appointmentId: created.id,
              type: "GENERAL",
              title: "New appointment request",
              message: `${patient.name} requested an appointment for ${localDateTime}. Please review the request.`,
            },
          ],
        });

        // Record the successful booking in the audit log.
        await tx.auditLog.create({
          data: {
            actorId: patient.id,
            action: "APPOINTMENT_CREATED",
            entityType: "Appointment",
            entityId: created.id,
            details: {
              doctorId: doctor.id,
              startAt: created.startAt.toISOString(),
              endAt: created.endAt.toISOString(),
            },
          },
        });

        return {
          ...created,
          timezone,
          doctorName: doctor.user.name,
        };
      },
      {
        isolationLevel: "Serializable",
      },
    );

    return NextResponse.json(
      {
        message: "Appointment booked and confirmed successfully.",
        appointment,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (
      error instanceof BookingError ||
      error instanceof SlotAvailabilityError
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    const prismaCode = getPrismaErrorCode(error);

    if (prismaCode === "P2034" || prismaCode === "P2002") {
      return NextResponse.json(
        {
          error:
            "A booking conflict occurred. Refresh the available slots and check your existing appointments before trying again.",
        },
        { status: 409 },
      );
    }

    console.error("Create appointment error:", error);

    return NextResponse.json(
      {
        error: "Could not book the appointment. Please try again.",
      },
      { status: 500 },
    );
  }
}
