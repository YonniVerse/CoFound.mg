-- B-05 : suivi privé des projets par une organisation partenaire
CREATE TABLE "ProjectWatch" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectWatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectWatch_organizationId_projectId_key"
    ON "ProjectWatch"("organizationId", "projectId");

CREATE INDEX "ProjectWatch_organizationId_updatedAt_idx"
    ON "ProjectWatch"("organizationId", "updatedAt");

ALTER TABLE "ProjectWatch"
    ADD CONSTRAINT "ProjectWatch_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectWatch"
    ADD CONSTRAINT "ProjectWatch_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
