-- Reconstructed migration file to preserve applied migration integrity.
-- The only persistent artifact required by later schema state is this index.
CREATE INDEX IF NOT EXISTS "Invoice_status_invoiceDate_idx" ON "Invoice"("status", "invoiceDate");
