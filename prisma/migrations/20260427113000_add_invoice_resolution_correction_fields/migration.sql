-- Add columns for last correction of final reimbursement status.
ALTER TABLE "Invoice"
ADD COLUMN "correctedAt" TIMESTAMP(3),
ADD COLUMN "correctionReason" TEXT,
ADD COLUMN "correctedFromStatus" "InvoiceStatus",
ADD COLUMN "correctedByUserId" UUID,
ADD COLUMN "correctedByUserName" TEXT;
