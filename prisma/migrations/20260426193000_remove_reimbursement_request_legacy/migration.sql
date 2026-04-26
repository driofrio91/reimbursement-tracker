-- Phase 2: remove legacy reimbursement request persistence
-- Keep invoice-centric V1 model intact.

-- 1) Remove legacy foreign key from Invoice to ReimbursementRequest.
ALTER TABLE "Invoice"
DROP CONSTRAINT IF EXISTS "Invoice_requestId_fkey";

-- 2) Remove legacy index on requestId.
DROP INDEX IF EXISTS "Invoice_requestId_idx";

-- 3) Remove legacy nullable reference column.
ALTER TABLE "Invoice"
DROP COLUMN IF EXISTS "requestId";

-- 4) Drop legacy table.
DROP TABLE IF EXISTS "ReimbursementRequest";

-- 5) Drop legacy enum type.
DROP TYPE IF EXISTS "ReimbursementRequestStatus";
