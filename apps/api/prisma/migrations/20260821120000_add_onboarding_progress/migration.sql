-- AlterTable
ALTER TABLE "TalentProfile"
  ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "onboardingCompletedSteps" JSONB,
  ADD COLUMN "onboardingUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
