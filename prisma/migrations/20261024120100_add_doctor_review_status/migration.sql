-- CreateEnum
CREATE TYPE "DoctorReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "DoctorProfile" ADD COLUMN     "reviewStatus" "DoctorReviewStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "DoctorProfile_reviewStatus_idx" ON "DoctorProfile"("reviewStatus");
