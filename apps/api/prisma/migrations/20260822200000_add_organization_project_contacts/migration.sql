-- B-09 : un seul contact partenaire par organisation et projet
CREATE TABLE "OrganizationProjectContact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationProjectContact_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrganizationProjectContact_organizationId_projectId_key"
    ON "OrganizationProjectContact"("organizationId", "projectId");

CREATE INDEX "OrganizationProjectContact_projectId_createdAt_idx"
    ON "OrganizationProjectContact"("projectId", "createdAt");

ALTER TABLE "OrganizationProjectContact"
    ADD CONSTRAINT "OrganizationProjectContact_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizationProjectContact"
    ADD CONSTRAINT "OrganizationProjectContact_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
