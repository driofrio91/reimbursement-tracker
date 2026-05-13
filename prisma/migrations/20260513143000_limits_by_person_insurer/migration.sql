-- Create annual reimbursement limits by person + insurer + year
CREATE TABLE "PersonAnnualReimbursementLimit" (
  "id" UUID NOT NULL,
  "personId" UUID NOT NULL,
  "insurerId" UUID NOT NULL,
  "year" INTEGER NOT NULL,
  "annualLimitAmount" DECIMAL(10,2) NOT NULL DEFAULT 1500,
  "reimbursedAccumulated" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PersonAnnualReimbursementLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PersonAnnualReimbursementLimit_personId_insurerId_year_key"
  ON "PersonAnnualReimbursementLimit"("personId", "insurerId", "year");

CREATE INDEX "PersonAnnualReimbursementLimit_year_idx"
  ON "PersonAnnualReimbursementLimit"("year");

ALTER TABLE "PersonAnnualReimbursementLimit"
  ADD CONSTRAINT "PersonAnnualReimbursementLimit_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PersonAnnualReimbursementLimit"
  ADD CONSTRAINT "PersonAnnualReimbursementLimit_insurerId_fkey"
  FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Move invoice ownership from user to person + insurer
ALTER TABLE "Invoice" ADD COLUMN "personId" UUID;
ALTER TABLE "Invoice" ADD COLUMN "insurerId" UUID;

UPDATE "Invoice" i
SET "personId" = s."personId",
    "insurerId" = s."insurerId"
FROM "ReimbursableService" s
WHERE i."serviceId" = s."id";

ALTER TABLE "Invoice"
  ADD CONSTRAINT "Invoice_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Invoice"
  ADD CONSTRAINT "Invoice_insurerId_fkey"
  FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Invoice_personId_idx" ON "Invoice"("personId");
CREATE INDEX "Invoice_insurerId_idx" ON "Invoice"("insurerId");

DROP INDEX IF EXISTS "Invoice_userId_idx";
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_userId_fkey";
ALTER TABLE "Invoice" DROP COLUMN IF EXISTS "userId";

-- Remove service-user business relation
DROP INDEX IF EXISTS "ReimbursableService_userId_idx";
ALTER TABLE "ReimbursableService" DROP CONSTRAINT IF EXISTS "ReimbursableService_userId_fkey";
ALTER TABLE "ReimbursableService" DROP COLUMN IF EXISTS "userId";

-- Remove old annual limits by user
DROP TABLE IF EXISTS "UserAnnualReimbursementLimit";
