import { describe, expect, it } from "vitest";

import { buildInvoicesExportHref } from "@/modules/reimbursement/ui/InvoicesSearchView";

describe("InvoicesSearchView export link", () => {
  it("preserves invoice filters for export", () => {
    expect(
      buildInvoicesExportHref({
        invoiceNumber: "F-2026",
        claimReference: "REF 123",
        status: "PAID",
      }),
    ).toBe("/invoices/export?invoiceNumber=F-2026&claimReference=REF+123&status=PAID");
  });

  it("does not include pagination parameters in the export href", () => {
    const href = buildInvoicesExportHref({ invoiceNumber: "F-2026", claimReference: "", status: "" });

    expect(href).toBe("/invoices/export?invoiceNumber=F-2026");
    expect(href).not.toContain("page=");
    expect(href).not.toContain("pageSize=");
  });
});
