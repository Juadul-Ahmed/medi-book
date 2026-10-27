
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/server-auth";

const appointmentStatuses = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
] as const;

type AppointmentStatus = (typeof appointmentStatuses)[number];

function isAppointmentStatus(
  value: string,
): value is AppointmentStatus {
  return appointmentStatuses.some((status) => status === value);
}

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() ?? "";
    const requestedStatus = searchParams.get("status") ?? "ALL";

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
    );

    const pageSize = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("pageSize") ?? "20", 10) || 20,
      ),
    );

    if (
      requestedStatus !== "ALL" &&
      !isAppointmentStatus(requestedStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid appointment status." },
        { status: 400 },
      );
    }

    const where = {
      ...(requestedStatus !== "ALL"
        ? { status: requestedStatus as AppointmentStatus }
        : {}),
      ...(search
        ? {
            OR: [
              {
                patient: {
                  is: {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        email: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    ],
                  },
                },
              },
              {
                doctor: {
                  is: {
                    user: {
                      is: {
                        OR: [
                          {
                            name: {
                              contains: search,
                              mode: "insensitive" as const,
                            },
                          },
                          {
                            email: {
                              contains: search,
                              mode: "insensitive" as const,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [appointments, total, statusCounts] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              timezone: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              specialty: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          startAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      prisma.appointment.count({ where }),

      prisma.appointment.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
      }),
    ]);

    const counts = Object.fromEntries(
      appointmentStatuses.map((status) => [status, 0]),
    ) as Record<AppointmentStatus, number>;

    for (const item of statusCounts) {
      counts[item.status] = item._count._all;
    }

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      counts: {
        total: Object.values(counts).reduce(
          (sum, count) => sum + count,
          0,
        ),
        ...counts,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Failed to fetch admin appointments:", error);

    return NextResponse.json(
      { error: "Unable to load appointments." },
      { status: 500 },
    );
  }
}
