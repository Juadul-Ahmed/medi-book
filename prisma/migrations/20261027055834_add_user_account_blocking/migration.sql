-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'USER_BLOCKED';
ALTER TYPE "AuditAction" ADD VALUE 'USER_UNBLOCKED';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "blockedReason" TEXT,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "user_role_isBlocked_idx" ON "user"("role", "isBlocked");
