ALTER TABLE "ReimbursableService" RENAME COLUMN "personId" TO "insuranceHolderPersonId";
ALTER TABLE "ReimbursableService" RENAME COLUMN "policyHolderName" TO "serviceRecipientName";

ALTER TABLE "Invoice" RENAME COLUMN "personId" TO "insuranceHolderPersonId";

ALTER TABLE "PersonAnnualReimbursementLimit" RENAME TO "InsuranceHolderAnnualReimbursementLimit";
ALTER TABLE "InsuranceHolderAnnualReimbursementLimit" RENAME COLUMN "personId" TO "insuranceHolderPersonId";

ALTER INDEX IF EXISTS "ReimbursableService_personId_idx" RENAME TO "ReimbursableService_insuranceHolderPersonId_idx";
ALTER INDEX IF EXISTS "Invoice_personId_idx" RENAME TO "Invoice_insuranceHolderPersonId_idx";
ALTER INDEX IF EXISTS "PersonAnnualReimbursementLimit_year_idx" RENAME TO "InsuranceHolderAnnualReimbursementLimit_year_idx";

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = '"ReimbursableService"'::regclass
    AND conname LIKE 'ReimbursableService%personId%fkey';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "ReimbursableService" RENAME CONSTRAINT %I TO "ReimbursableService_insuranceHolderPersonId_fkey"', constraint_name);
  END IF;
END $$;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = '"Invoice"'::regclass
    AND conname LIKE 'Invoice%personId%fkey';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "Invoice" RENAME CONSTRAINT %I TO "Invoice_insuranceHolderPersonId_fkey"', constraint_name);
  END IF;
END $$;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = '"InsuranceHolderAnnualReimbursementLimit"'::regclass
    AND conname LIKE '%_pkey';

  IF constraint_name IS NOT NULL AND constraint_name <> 'InsuranceHolderAnnualReimbursementLimit_pkey' THEN
    EXECUTE format('ALTER TABLE "InsuranceHolderAnnualReimbursementLimit" RENAME CONSTRAINT %I TO "InsuranceHolderAnnualReimbursementLimit_pkey"', constraint_name);
  END IF;
END $$;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = '"InsuranceHolderAnnualReimbursementLimit"'::regclass
    AND conname LIKE '%personId%fkey';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "InsuranceHolderAnnualReimbursementLimit" RENAME CONSTRAINT %I TO "InsuranceHolderAnnualReimbursementLimit_insuranceHolderPer_fkey"', constraint_name);
  END IF;
END $$;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = '"InsuranceHolderAnnualReimbursementLimit"'::regclass
    AND conname LIKE '%insurerId%fkey';

  IF constraint_name IS NOT NULL AND constraint_name <> 'InsuranceHolderAnnualReimbursementLimit_insurerId_fkey' THEN
    EXECUTE format('ALTER TABLE "InsuranceHolderAnnualReimbursementLimit" RENAME CONSTRAINT %I TO "InsuranceHolderAnnualReimbursementLimit_insurerId_fkey"', constraint_name);
  END IF;
END $$;

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = '"InsuranceHolderAnnualReimbursementLimit"'::regclass
    AND conname LIKE '%year%key';

  IF constraint_name IS NOT NULL AND constraint_name <> 'InsuranceHolderAnnualReimbursementLimit_insuranceHolderPers_key' THEN
    EXECUTE format('ALTER TABLE "InsuranceHolderAnnualReimbursementLimit" RENAME CONSTRAINT %I TO "InsuranceHolderAnnualReimbursementLimit_insuranceHolderPers_key"', constraint_name);
  END IF;
END $$;
