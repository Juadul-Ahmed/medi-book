
import { loadEnvConfig } from "@next/env";

// Load the same local environment files used by Next.js.
loadEnvConfig(process.cwd(), true);

async function main() {
  // Import Prisma only after loading environment variables.
  const { prisma } = await import("../src/lib/prisma");

  try {
    const migrations = await prisma.$queryRaw<
      Array<{
        migration_name: string;
        started_at: Date;
        finished_at: Date | null;
        rolled_back_at: Date | null;
      }>
    >`
      SELECT
        migration_name,
        started_at,
        finished_at,
        rolled_back_at
      FROM public."_prisma_migrations"
      ORDER BY started_at;
    `;

    const tables = await prisma.$queryRaw<
      Array<{ table_name: string; exists: boolean }>
    >`
      SELECT
        table_name,
        to_regclass('public."' || table_name || '"') IS NOT NULL AS exists
      FROM (
        VALUES
          ('DoctorProfile'),
          ('Appointment'),
          ('_prisma_migrations')
      ) AS requested(table_name);
    `;

    const enumValues = await prisma.$queryRaw<
      Array<{ enum_name: string; enum_value: string }>
    >`
      SELECT
        t.typname AS enum_name,
        e.enumlabel AS enum_value
      FROM pg_type t
      JOIN pg_enum e ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typname IN (
          'AppointmentStatus',
          'DoctorReviewStatus'
        )
      ORDER BY t.typname, e.enumsortorder;
    `;

    console.log("\n=== Migration history ===");
    console.table(migrations);

    console.log("\n=== Database tables ===");
    console.table(tables);

    console.log("\n=== Appointment and doctor review enums ===");
    console.table(enumValues);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Could not inspect migration state:", error);
  process.exitCode = 1;
});
