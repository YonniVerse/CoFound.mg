-- M-08 : retour « pas intéressé » et exclusion des suggestions futures
CREATE TABLE "DreamMatchExclusion" (
    "id" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DreamMatchExclusion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DreamMatchExclusion_seekerId_candidateId_key"
    ON "DreamMatchExclusion"("seekerId", "candidateId");

CREATE INDEX "DreamMatchExclusion_seekerId_idx"
    ON "DreamMatchExclusion"("seekerId");

ALTER TABLE "DreamMatchExclusion"
    ADD CONSTRAINT "DreamMatchExclusion_seekerId_fkey"
    FOREIGN KEY ("seekerId") REFERENCES "TalentProfile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DreamMatchExclusion"
    ADD CONSTRAINT "DreamMatchExclusion_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "TalentProfile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
