import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/server-auth";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const ruleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timePattern),
  endTime: z.string().regex(timePattern),
});

const rulesSchema = z.object({
  rules: z.array(ruleSchema).max(42),
});

type Rule = z.infer<typeof ruleSchema>;

function validateRules(rules: Rule[]) {
  const byDay = new Map<number, Rule[]>();

  for (const rule of rules) {
    const start = rule.startTime.split(":").reduce(
      (hours, part, index) =>
        hours + Number(part) * (index === 0 ? 60 : 1),
      0,
    );

    const end = rule.endTime.split(":").reduce(
      (hours, part, index) =>
        hours + Number(part) * (index === 0 ? 60 : 1),
      0,
    );

    if (start >= end) {
      return "End time must be later than start time.";
    }

    if (start % 30 !== 0 || end % 30 !== 0) {
      return "Working hours must use 30-minute time increments.";
    }

    if (end - start < 30) {
      return "Each working period must be at least 30 minutes.";
    }

    const dayRules = byDay.get(rule.dayOfWeek) ?? [];
    dayRules.push(rule);
    byDay.set(rule.dayOfWeek, dayRules);
  }

  for (const dayRules of byDay.values()) {
    dayRules.sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (let i = 1; i < dayRules.length; i++) {
      if (dayRules[i].startTime < dayRules[i - 1].endTime) {
        return "Working periods on the same day cannot overlap.";
      }
    }
  }

  return null;
}

export async function GET() {
  try {
    const user = await requireRole("DOCTOR");

    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        timezone: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Doctor profile not found." },
        { status: 404 },
      );
    }

    const rules = await prisma.availabilityRule.findMany({
      where: { doctorId: profile.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({
      rules,
      timezone: profile.timezone,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Load availability error:", error);

    return NextResponse.json(
      { error: "Could not load availability." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireRole("DOCTOR");
    const body = await request.json();
    const parsed = rulesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid availability data.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const validationError = validateRules(parsed.data.rules);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 },
      );
    }

    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Doctor profile not found." },
        { status: 404 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.availabilityRule.deleteMany({
        where: { doctorId: profile.id },
      });

      if (parsed.data.rules.length > 0) {
        await tx.availabilityRule.createMany({
          data: parsed.data.rules.map((rule) => ({
            ...rule,
            doctorId: profile.id,
          })),
        });
      }
    });

    return NextResponse.json({
      message: "Availability saved successfully.",
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

    console.error("Save availability error:", error);

    return NextResponse.json(
      { error: "Could not save availability." },
      { status: 500 },
    );
  }
}