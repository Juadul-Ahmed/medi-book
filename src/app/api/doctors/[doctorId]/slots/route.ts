import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAvailableSlots,
  isValidDateOnly,
  SlotAvailabilityError,
} from "@/lib/appointments/available-slots";

type RouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { doctorId } = await params;
    const url = new URL(request.url);
    const date = url.searchParams.get("date");

    if (!date || !isValidDateOnly(date)) {
      return NextResponse.json(
        { error: "Provide a valid date in YYYY-MM-DD format." },
        { status: 400 },
      );
    }

    const result = await getAvailableSlots(
      prisma,
      doctorId,
      date,
    );

    return NextResponse.json({
      doctorId,
      date,
      timezone: result.timezone,
      slots: result.slots,
    });
  } catch (error) {
    if (error instanceof SlotAvailabilityError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Load appointment slots error:", error);

    return NextResponse.json(
      { error: "Could not load available appointment slots." },
      { status: 500 },
    );
  }
}