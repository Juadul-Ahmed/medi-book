import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Check if DIRECT_URL is present (boolean only, never value)
  results.directUrlPresent = Boolean(process.env.DIRECT_URL);

  // 2. Test direct prisma query inside API runtime
  try {
    const user = await prisma.user.findFirst({
      select: { id: true },
    });
    results.prismaQueryOk = true;
    results.userFound = Boolean(user);
  } catch (err: any) {
    results.prismaQueryOk = false;
    results.prismaErrorCode = err.code;
    results.prismaErrorMessage = err.message;
  }

  await prisma.$disconnect().catch(() => {});
  return NextResponse.json(results);
}
