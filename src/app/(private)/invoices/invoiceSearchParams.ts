import { InvoiceStatus } from "@/modules/reimbursement/domain/Invoice";
import { SearchInvoicesFilters } from "@/modules/reimbursement/domain/InvoiceRepository";

export const invoiceStatuses: InvoiceStatus[] = [
  "CREATED",
  "INFORMATION_COMPLETED",
  "CLAIM_REFERENCE_COMPLETED",
  "PAID",
  "REJECTED",
];

export interface InvoicesPageSearchParams {
  invoiceNumber?: string | string[];
  claimReference?: string | string[];
  status?: string | string[];
}

export function parseInvoicesSearchFilters(searchParams: InvoicesPageSearchParams): SearchInvoicesFilters {
  const invoiceNumber = getSingleQueryParam(searchParams.invoiceNumber).trim();
  const claimReference = getSingleQueryParam(searchParams.claimReference).trim();
  const statusValue = getSingleQueryParam(searchParams.status).trim();
  const status = invoiceStatuses.find((item) => item === statusValue);

  return {
    invoiceNumber: invoiceNumber || undefined,
    claimReference: claimReference || undefined,
    status,
  };
}

export function getSingleQueryParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
