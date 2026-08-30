-- CreateEnum
CREATE TYPE "OrganizationPlan" AS ENUM ('INCUBATOR_STARTER', 'INCUBATOR_GROWTH', 'COMPANY_STARTER', 'COMPANY_GROWTH', 'NGO_PROGRAM', 'FREE');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('FREE', 'TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CohortStatus" AS ENUM ('PLANNED', 'OPEN', 'CLOSED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "cohortId" TEXT,
ADD COLUMN     "programId" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "billingStatus" "BillingStatus" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "cohortsLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "opportunitiesLimit" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "plan" "OrganizationPlan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "programsLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seatsLimit" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cohort" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "status" "CohortStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Program_organizationId_status_idx" ON "Program"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Program_organizationId_name_key" ON "Program"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Cohort_programId_status_idx" ON "Cohort"("programId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Cohort_programId_name_key" ON "Cohort"("programId", "name");

-- CreateIndex
CREATE INDEX "Opportunity_organizationId_programId_cohortId_idx" ON "Opportunity"("organizationId", "programId", "cohortId");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

