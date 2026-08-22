CREATE TYPE "PersonalDataExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED', 'EXPIRED');

CREATE TABLE "PersonalDataExport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PersonalDataExportStatus" NOT NULL DEFAULT 'PENDING',
    "storageKey" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "errorCode" TEXT,
    CONSTRAINT "PersonalDataExport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PersonalDataExport_userId_requestedAt_idx" ON "PersonalDataExport"("userId", "requestedAt");
CREATE INDEX "PersonalDataExport_status_requestedAt_idx" ON "PersonalDataExport"("status", "requestedAt");
ALTER TABLE "PersonalDataExport" ADD CONSTRAINT "PersonalDataExport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
