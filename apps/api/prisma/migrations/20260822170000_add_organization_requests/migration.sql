-- B-01 : demandes publiques d’accès organisationnel
CREATE TYPE "OrganizationRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "OrganizationRequest" (
    "id" TEXT NOT NULL,
    "organizationType" "OrganizationType" NOT NULL,
    "organizationName" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'MG',
    "region" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT NOT NULL,
    "sectorsOfInterest" JSONB NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactRole" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "supportingDocuments" JSONB NOT NULL,
    "status" "OrganizationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "decisionReason" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedOrganizationId" TEXT,
    CONSTRAINT "OrganizationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrganizationRequest_status_createdAt_idx"
    ON "OrganizationRequest"("status", "createdAt");

CREATE INDEX "OrganizationRequest_contactEmail_organizationName_status_idx"
    ON "OrganizationRequest"("contactEmail", "organizationName", "status");

CREATE UNIQUE INDEX "OrganizationRequest_approvedOrganizationId_key"
    ON "OrganizationRequest"("approvedOrganizationId");

ALTER TABLE "OrganizationRequest"
    ADD CONSTRAINT "OrganizationRequest_approvedOrganizationId_fkey"
    FOREIGN KEY ("approvedOrganizationId") REFERENCES "Organization"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OrganizationRequest"
    ADD CONSTRAINT "OrganizationRequest_sectorsOfInterest_check"
    CHECK (jsonb_typeof("sectorsOfInterest") = 'array');

ALTER TABLE "OrganizationRequest"
    ADD CONSTRAINT "OrganizationRequest_supportingDocuments_check"
    CHECK (jsonb_typeof("supportingDocuments") = 'array');

ALTER TABLE "OrganizationRequest"
    ADD CONSTRAINT "OrganizationRequest_countryCode_check"
    CHECK (char_length("countryCode") = 2);
