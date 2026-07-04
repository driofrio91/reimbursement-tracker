import { describe, expect, it } from "vitest";

import { PAGE_SIZE_OPTIONS } from "@/modules/reimbursement/application/Pagination";
import { buildPageHref } from "@/modules/reimbursement/ui/PaginationControls";

describe("PaginationControls href generation", () => {
  it("preserves active filters and switches to the requested page", () => {
    expect(
      buildPageHref(
        "/invoices",
        {
          invoiceNumber: "F-2026",
          claimReference: "REF 123",
          status: "PAID",
          pageSize: "25",
        },
        3,
        25,
      ),
    ).toBe("/invoices?invoiceNumber=F-2026&claimReference=REF+123&status=PAID&pageSize=25&page=3");
  });

  it("resets to page 1 when changing page size while preserving filters", () => {
    expect(buildPageHref("/invoices", { status: "REJECTED", page: "4", pageSize: "10" }, 1, 50)).toBe(
      "/invoices?status=REJECTED&page=1&pageSize=50",
    );
  });

  it("uses the same page-size policy exported by the pagination domain", () => {
    expect([...PAGE_SIZE_OPTIONS]).toEqual([10, 25, 50]);
  });
});
