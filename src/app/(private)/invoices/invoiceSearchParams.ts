import { InvoiceStatus } from "@/modules/reimbursement/domain/Invoice";
import { PaginationInput } from "@/modules/reimbursement/application/Pagination";
import { SearchInvoicesFilters } from "@/modules/reimbursement/domain/InvoiceRepository";

import { getSingleQueryParam, parseNumberQueryParam } from "../_utils/searchParams";

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
  page?: string | string[];
  pageSize?: string | string[];
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

export function parseInvoicesPagination(searchParams: InvoicesPageSearchParams): PaginationInput {
  return {
    page: parseNumberQueryParam(searchParams.page),
    pageSize: parseNumberQueryParam(searchParams.pageSize),
  };
}
