
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AuthError, requireApprovedDoctor } from "@/lib/server-auth";

const updateSchema = z.object({
  appointmentId: z.string().min(1),
  status: z.enum(["COMPLETED", "NO_SHOW"]),
});

export async function GET() {
  try {
    const doctor = await requireApprovedDoctor();
    const doctorId = doctor.doctorProfile.id;

    const [appointments, profile] = await Promise.all([
      prisma.appointment.findMany({
        where: { doctorId },
        orderBy: { startAt: "desc" },
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
      }),
      prisma.doctorProfile.findUnique({
        where: { id: doctorId },
        select: { timezone: true },
      }),
    ]);

    return NextResponse.json({
      appointments,
      timezone: profile?.timezone || "UTC",
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
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid appointment update." },
        { status: 400 },
      );
    }

    const { appointmentId, status } = parsed.data;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: doctor.doctorProfile.id,
      },
      select: {
        id: true,
        status: true,
        endAt: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 },
      );
    }

    if (appointment.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only confirmed appointments can be updated." },
        { status: 409 },
      );
    }

    if (appointment.endAt > new Date()) {
      return NextResponse.json(
        { error: "You can update the status after the appointment ends." },
        { status: 400 },
      );
    }

    const result = await prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        doctorId: doctor.doctorProfile.id,
        status: "CONFIRMED",
        endAt: { lte: new Date() },
      },
      data: { status },
    });

    if (result.count !== 1) {
      return NextResponse.json(
        { error: "Appointment changed. Refresh and try again." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      message: `Appointment marked ${status === "COMPLETED" ? "completed" : "as no-show"}.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    console.error("Update doctor appointment error:", error);

    return NextResponse.json(
      { error: "Could not update appointment." },
      { status: 500 },
    );
  }
}
