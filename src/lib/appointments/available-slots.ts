import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";

type AvailabilityDatabase = Pick<
  typeof prisma,
  "doctorProfile" | "availabilityRule" | "availabilityException" | "appointment"
>;

type ScheduleWindow = {
  startTime: string;
  endTime: string;
};

export type AvailableAppointmentSlot = {
  startAt: string;
  endAt: string;
  localTime: string;
};

export class SlotAvailabilityError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 500,
  ) {
    super(message);
    this.name = "SlotAvailabilityError";
  }
}

export function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T12:00:00.000Z`);

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function nextDate(date: string) {
  const result = new Date(`${date}T12:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + 1);
  return result.toISOString().slice(0, 10);
}

function timeToMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export async function getAvailableSlots(
  db: AvailabilityDatabase,
  doctorId: string,
  date: string,
) {
  if (!isValidDateOnly(date)) {
    throw new SlotAvailabilityError("Please provide a valid date.", 400);
  }

  const doctor = await db.doctorProfile.findFirst({
    where: {
      id: doctorId,
      approved: true,
      reviewStatus: "APPROVED",
    },
    select: {
      id: true,
      timezone: true,
    },
  });

  if (!doctor) {
    throw new SlotAvailabilityError(
      "This doctor is unavailable for booking.",
      404,
    );
  }

  const timezone = doctor.timezone || "UTC";

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
    }).format(new Date());
  } catch {
    throw new SlotAvailabilityError(
      "The doctor's time zone is incorrectly configured.",
      500,
    );
  }

  const today = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");

  if (date < today) {
    throw new SlotAvailabilityError(
      "Choose today or a future date.",
      400,
    );
  }

  // The selected date represents the calendar date in the doctor's
  // time zone, so calculate its weekday from the date string.
  const dayOfWeek = new Date(`${date}T12:00:00.000Z`).getUTCDay();
  const databaseDate = new Date(`${date}T00:00:00.000Z`);

  const [rules, exceptions] = await Promise.all([
    db.availabilityRule.findMany({
      where: {
        doctorId: doctor.id,
        dayOfWeek,
      },
      select: {
        startTime: true,
        endTime: true,
      },
      orderBy: {
        startTime: "asc",
      },
    }),

    db.availabilityException.findMany({
      where: {
        doctorId: doctor.id,
        date: databaseDate,
      },
      select: {
        isAvailable: true,
        startTime: true,
        endTime: true,
      },
    }),
  ]);

  let windows: ScheduleWindow[] = rules;

  // An unavailable exception closes the date.
  if (exceptions.some((exception) => !exception.isAvailable)) {
    windows = [];
  } else {
    // Available exceptions with explicit hours override weekly hours.
    const specialWindows: ScheduleWindow[] = exceptions.flatMap(
      (exception) => {
        if (
          !exception.isAvailable ||
          !exception.startTime ||
          !exception.endTime
        ) {
          return [];
        }

        return [
          {
            startTime: exception.startTime,
            endTime: exception.endTime,
          },
        ];
      },
    );

    if (specialWindows.length > 0) {
      windows = specialWindows;
    }
  }

  // Bound the appointment query to this calendar date in the doctor's
  // time zone. The actual elapsed day may be 23 or 25 hours around DST.
  const dayStart = fromZonedTime(
    `${date}T00:00:00`,
    timezone,
  );

  const dayEnd = fromZonedTime(
    `${nextDate(date)}T00:00:00`,
    timezone,
  );

  const existingAppointments = await db.appointment.findMany({
    where: {
      doctorId: doctor.id,
      status: {
         notIn: ["CANCELLED", "REJECTED"],
      },
      startAt: {
        lt: dayEnd,
      },
      endAt: {
        gt: dayStart,
      },
    },
    select: {
      startAt: true,
      endAt: true,
    },
  });

  const now = Date.now();
  const slotDurationMs = 30 * 60 * 1000;
  const uniqueSlots = new Map<string, AvailableAppointmentSlot>();

  for (const window of windows) {
    const startMinute = timeToMinutes(window.startTime);
    const endMinute = timeToMinutes(window.endTime);

    if (
      startMinute === null ||
      endMinute === null ||
      startMinute >= endMinute
    ) {
      continue;
    }

    for (
      let minute = startMinute;
      minute + 30 <= endMinute;
      minute += 30
    ) {
      const localTime = minutesToTime(minute);
      const localDateTime = `${date}T${localTime}`;

      let startAt: Date;

      try {
        startAt = fromZonedTime(
          `${localDateTime}:00`,
          timezone,
        );
      } catch {
        continue;
      }

      if (!Number.isFinite(startAt.getTime())) {
        continue;
      }

      // Skip nonexistent local times during daylight-saving transitions.
      const roundTrip = formatInTimeZone(
        startAt,
        timezone,
        "yyyy-MM-dd'T'HH:mm",
      );

      if (roundTrip !== localDateTime) {
        continue;
      }

      const endAt = new Date(startAt.getTime() + slotDurationMs);

      if (startAt.getTime() <= now) {
        continue;
      }

      // Check overlap, not just identical start times.
      const isOccupied = existingAppointments.some(
        (appointment) =>
          appointment.startAt < endAt &&
          appointment.endAt > startAt,
      );

      if (isOccupied) {
        continue;
      }

      const startIso = startAt.toISOString();

      uniqueSlots.set(startIso, {
        startAt: startIso,
        endAt: endAt.toISOString(),
        localTime,
      });
    }
  }

  const slots = [...uniqueSlots.values()].sort((a, b) =>
    a.startAt.localeCompare(b.startAt),
  );

  return {
    timezone,
    slots,
  };
}