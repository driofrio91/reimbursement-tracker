-- Service configuration fields
ALTER TABLE "ReimbursableService"
ADD COLUMN "invoiceBilledAmount" DECIMAL(10,2) NOT NULL DEFAULT 55,
ADD COLUMN "invoiceExpectedAmount" DECIMAL(10,2) NOT NULL DEFAULT 49.5;

-- New invoice lifecycle fields
ALTER TABLE "Invoice"
ADD COLUMN "invoiceBilledAmount" DECIMAL(10,2) NOT NULL DEFAULT 55,
ADD COLUMN "invoiceExpectedAmount" DECIMAL(10,2) NOT NULL DEFAULT 49.5,
ADD COLUMN "claimReference" TEXT,
ADD COLUMN "paidAmount" DECIMAL(10,2),
ADD COLUMN "paidAt" DATE;

ALTER TABLE "Invoice"
ALTER COLUMN "invoiceNumber" DROP NOT NULL,
ALTER COLUMN "invoiceDate" DROP NOT NULL,
ALTER COLUMN "issuerName" DROP NOT NULL;

-- Backfill existing invoices
UPDATE "Invoice"
SET "invoiceBilledAmount" = "amount",
    "invoiceExpectedAmount" = COALESCE("reimbursedAmount", ROUND("amount" * 0.9, 2)),
    "paidAmount" = "reimbursedAmount",
    "paidAt" = "reimbursedAt";

UPDATE "Invoice" AS i
SET "claimReference" = r."externalReference"
FROM "ReimbursementRequest" AS r
WHERE i."requestId" = r."id";

-- Status migration to new enum
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";

CREATE TYPE "InvoiceStatus" AS ENUM (
  'CREATED',
  'INFORMATION_COMPLETED',
  'CLAIM_REFERENCE_COMPLETED',
  'PAID',
  'REJECTED'
);

ALTER TABLE "Invoice"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Invoice"
ALTER COLUMN "status" TYPE "InvoiceStatus"
USING (
  CASE
    WHEN "status"::text = 'RECEIVED' THEN 'CREATED'
    WHEN "status"::text = 'SUBMITTED' THEN 'CLAIM_REFERENCE_COMPLETED'
    WHEN "status"::text = 'REIMBURSED' THEN 'PAID'
    WHEN "status"::text = 'REJECTED' THEN 'REJECTED'
    ELSE 'CREATED'
  END
)::"InvoiceStatus";

ALTER TABLE "Invoice"
ALTER COLUMN "status" SET DEFAULT 'CREATED';

DROP TYPE "InvoiceStatus_old";

-- Cleanup legacy columns replaced by new names
ALTER TABLE "Invoice"
DROP COLUMN "amount",
DROP COLUMN "reimbursedAmount",
DROP COLUMN "reimbursedAt";
