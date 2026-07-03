import { describe, expect, it } from "vitest";

import { parseInvoicesPagination, parseInvoicesSearchFilters } from "@/app/(private)/invoices/invoiceSearchParams";
import { parseServicesPagination } from "@/app/(private)/services/serviceSearchParams";
import { resolvePagination } from "@/modules/reimbursement/application/Pagination";

describe("pagination search params", () => {
  it("uses the first value when Next.js provides array query params", () => {
    expect(parseServicesPagination({ page: ["3", "4"], pageSize: ["25", "50"] })).toEqual({
      page: 3,
      pageSize: 25,
    });
  });

  it("falls back to domain defaults for missing or invalid values", () => {
    const parsed = parseInvoicesPagination({ page: "not-a-number", pageSize: "0" });

    expect(parsed).toEqual({
      page: Number.NaN,
      pageSize: 0,
    });
    expect(resolvePagination(parsed)).toEqual({
      page: 1,
      pageSize: 10,
      skip: 0,
      take: 10,
    });
  });

  it("caps oversized pageSize values through the shared pagination policy", () => {
    expect(resolvePagination(parseServicesPagination({ page: "2", pageSize: "500" }))).toEqual({
      page: 2,
      pageSize: 50,
      skip: 50,
      take: 50,
    });
  });

  it("ignores unsupported invoice status filter values", () => {
    expect(parseInvoicesSearchFilters({ status: ["INVALID", "PAID"] })).toEqual({
      invoiceNumber: undefined,
      claimReference: undefined,
      status: undefined,
    });
  });
});
