
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), true);

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const oldName = "20261024114836_add_doctor_review_status";
  const newName = "20261024120100_add_doctor_review_status";

  try {
    const rows = await prisma.$queryRaw<
      Array<{
        migration_name: string;
        finished_at: Date | null;
        rolled_back_at: Date | null;
      }>
    >`
      SELECT migration_name, finished_at, rolled_back_at
      FROM public."_prisma_migrations"
      WHERE migration_name = ${oldName}
         OR migration_name = ${newName}
    `;

    const oldRow = rows.find(
      (row) => row.migration_name === oldName,
    );

    if (!oldRow) {
      throw new Error(
        "The original migration record was not found. No changes made.",
      );
    }

    if (
      !oldRow.finished_at ||
      oldRow.rolled_back_at !== null
    ) {
      throw new Error(
        "The migration is not recorded as successfully applied. No changes made.",
      );
    }

    if (rows.some((row) => row.migration_name === newName)) {
      throw new Error(
        "The new migration name already exists in the database. No changes made.",
      );
    }

    const updated = await prisma.$executeRaw`
      UPDATE public."_prisma_migrations"
      SET migration_name = ${newName}
      WHERE migration_name = ${oldName}
        AND finished_at IS NOT NULL
        AND rolled_back_at IS NULL
    `;

    if (updated !== 1) {
      throw new Error(
        `Expected to update one migration record, but updated ${updated}.`,
      );
    }

    console.log("Migration history updated successfully.");
    console.log(`${oldName} -> ${newName}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Migration repair failed:", error);
  process.exitCode = 1;
});
