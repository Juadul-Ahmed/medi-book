
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { AuthError, requireAuth } from "@/lib/server-auth";

const updateSchema = z.union([
  z.object({
    notificationId: z.string().trim().min(1),
  }),
  z.object({
    markAll: z.literal(true),
  }),
]);

export async function GET() {
  try {
    const user = await requireAuth();

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          appointmentId: true,
          readAt: true,
          createdAt: true,
        },
      }),

      prisma.notification.count({
        where: {
          userId: user.id,
          readAt: null,
        },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Load notifications error:", error);

    return NextResponse.json(
      { error: "Could not load notifications." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();

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
        {
          error:
            "Provide either a notificationId or markAll: true.",
        },
        { status: 400 },
      );
    }

    if ("markAll" in parsed.data) {
      const result = await prisma.notification.updateMany({
        where: {
          userId: user.id,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "All notifications marked as read.",
        updatedCount: result.count,
      });
    }

    const { notificationId } = parsed.data;

    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    if (result.count === 0) {
      // Check whether the notification belongs to this user and
      // was already read. Never reveal another user's notification.
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: user.id,
        },
        select: {
          id: true,
          readAt: true,
        },
      });

      if (!notification) {
        return NextResponse.json(
          { error: "Notification not found." },
          { status: 404 },
        );
      }
    }

    return NextResponse.json({
      message: "Notification marked as read.",
      notificationId,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Update notification error:", error);

    return NextResponse.json(
      { error: "Could not update the notification." },
      { status: 500 },
    );
  }
}
