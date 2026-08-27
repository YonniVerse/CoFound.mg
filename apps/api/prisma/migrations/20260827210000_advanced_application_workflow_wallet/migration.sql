-- Advanced opportunity application workflow
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'REVIEWING';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'SHORTLISTED';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'INTERVIEW';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'WAITLISTED';

ALTER TABLE "OpportunityApplication" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "OpportunityApplication" ADD COLUMN IF NOT EXISTS "shortlistedAt" TIMESTAMP(3);
ALTER TABLE "OpportunityApplication" ADD COLUMN IF NOT EXISTS "interviewAt" TIMESTAMP(3);
ALTER TABLE "OpportunityApplication" ADD COLUMN IF NOT EXISTS "waitlistedAt" TIMESTAMP(3);

-- Fictitious wallet is owned by one organization OR one project, never by a user account.
CREATE TYPE "WalletOwnerType" AS ENUM ('ORGANIZATION', 'PROJECT');
CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT', 'DEBIT');

CREATE TABLE "Wallet" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "projectId" TEXT,
  "ownerType" "WalletOwnerType" NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MGA',
  "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WalletTransaction" (
  "id" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "type" "WalletTransactionType" NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "currency" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "referenceType" TEXT,
  "referenceId" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Wallet_organizationId_key" ON "Wallet"("organizationId");
CREATE UNIQUE INDEX "Wallet_projectId_key" ON "Wallet"("projectId");
CREATE INDEX "Wallet_ownerType_idx" ON "Wallet"("ownerType");
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");

ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
