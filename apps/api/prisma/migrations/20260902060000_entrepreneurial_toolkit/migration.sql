-- CreateTable
CREATE TABLE "ProjectDesignThinking" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "iterations" JSONB NOT NULL,
    "activeIterationIndex" INTEGER NOT NULL DEFAULT 0,
    "completion" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "ProjectDesignThinking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectBusinessPlan" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "completion" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "ProjectBusinessPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFinance" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MGA',
    "startingCash" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "initialInvestments" JSONB NOT NULL,
    "revenues" JSONB NOT NULL,
    "fixedCosts" JSONB NOT NULL,
    "variableCosts" JSONB NOT NULL,
    "projectionYears" INTEGER NOT NULL DEFAULT 3,
    "completion" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "ProjectFinance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPitch" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "selectedFormat" TEXT NOT NULL DEFAULT 'three_minutes',
    "slides" JSONB NOT NULL,
    "completion" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "ProjectPitch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDesignThinking_projectId_key" ON "ProjectDesignThinking"("projectId");

-- CreateIndex
CREATE INDEX "ProjectDesignThinking_completion_idx" ON "ProjectDesignThinking"("completion");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBusinessPlan_projectId_key" ON "ProjectBusinessPlan"("projectId");

-- CreateIndex
CREATE INDEX "ProjectBusinessPlan_completion_idx" ON "ProjectBusinessPlan"("completion");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFinance_projectId_key" ON "ProjectFinance"("projectId");

-- CreateIndex
CREATE INDEX "ProjectFinance_completion_idx" ON "ProjectFinance"("completion");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPitch_projectId_key" ON "ProjectPitch"("projectId");

-- CreateIndex
CREATE INDEX "ProjectPitch_completion_idx" ON "ProjectPitch"("completion");

-- AddForeignKey
ALTER TABLE "ProjectDesignThinking" ADD CONSTRAINT "ProjectDesignThinking_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDesignThinking" ADD CONSTRAINT "ProjectDesignThinking_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBusinessPlan" ADD CONSTRAINT "ProjectBusinessPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBusinessPlan" ADD CONSTRAINT "ProjectBusinessPlan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFinance" ADD CONSTRAINT "ProjectFinance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFinance" ADD CONSTRAINT "ProjectFinance_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPitch" ADD CONSTRAINT "ProjectPitch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPitch" ADD CONSTRAINT "ProjectPitch_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
