-- B-08 : motif obligatoire pour le rejet d'une candidature à une opportunité
ALTER TABLE "OpportunityApplication"
    ADD COLUMN "rejectionReason" TEXT;
