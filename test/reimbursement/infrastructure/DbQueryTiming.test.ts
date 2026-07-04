import { afterEach, describe, expect, it, vi } from "vitest";

import { warnIfSlowPaginatedQuery } from "@/modules/reimbursement/infrastructure/DbQueryTiming";

describe("warnIfSlowPaginatedQuery", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not warn when the query duration stays within threshold", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_100);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const durationMs = warnIfSlowPaginatedQuery({
      operation: "services.listPaginated",
      startedAtMs: 1_000,
      thresholdMs: 250,
    });

    expect(durationMs).toBe(100);
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns with operation metadata when the query duration exceeds threshold", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_400);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const durationMs = warnIfSlowPaginatedQuery({
      operation: "invoices.searchPaginated",
      startedAtMs: 1_000,
      thresholdMs: 250,
      metadata: { page: 2, pageSize: 25, hasInvoiceNumberFilter: true },
    });

    expect(durationMs).toBe(400);
    expect(warn).toHaveBeenCalledWith("[db-query] Slow paginated query", {
      operation: "invoices.searchPaginated",
      durationMs: 400,
      thresholdMs: 250,
      page: 2,
      pageSize: 25,
      hasInvoiceNumberFilter: true,
    });
  });
});
