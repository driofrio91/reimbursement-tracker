-- Add annual reimbursement limits table per user and year.
CREATE TABLE "UserAnnualReimbursementLimit" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "year" INTEGER NOT NULL,
  "annualLimitAmount" DECIMAL(10,2) NOT NULL DEFAULT 1500,
  "reimbursedAccumulated" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserAnnualReimbursementLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserAnnualReimbursementLimit_userId_year_key" ON "UserAnnualReimbursementLimit"("userId", "year");
CREATE INDEX "UserAnnualReimbursementLimit_year_idx" ON "UserAnnualReimbursementLimit"("year");

ALTER TABLE "UserAnnualReimbursementLimit"
ADD CONSTRAINT "UserAnnualReimbursementLimit_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
