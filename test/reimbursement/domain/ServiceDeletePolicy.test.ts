import { describe, expect, it } from "vitest";

import { evaluateServiceDeleteEligibility } from "@/modules/reimbursement/domain/ServiceDeletePolicy";

describe("evaluateServiceDeleteEligibility", () => {
  it("allows deletion when there are no invoices", () => {
    const result = evaluateServiceDeleteEligibility([]);
    expect(result.canDelete).toBe(true);
    expect(result.blockedReason).toBe("");
  });

  it("allows deletion when all invoices are in CREATED status", () => {
    const result = evaluateServiceDeleteEligibility([
      { status: "CREATED" },
      { status: "CREATED" },
    ]);
    expect(result.canDelete).toBe(true);
  });

  it("blocks deletion when any invoice is INFORMATION_COMPLETED", () => {
    const result = evaluateServiceDeleteEligibility([
      { status: "CREATED" },
      { status: "INFORMATION_COMPLETED" },
    ]);
    expect(result.canDelete).toBe(false);
    expect(result.blockedReason).toContain("borra una a una");
  });

  it("blocks deletion with the advanced-status message when any invoice is CLAIM_REFERENCE_COMPLETED", () => {
    const result = evaluateServiceDeleteEligibility([{ status: "CLAIM_REFERENCE_COMPLETED" }]);
    expect(result.canDelete).toBe(false);
    expect(result.blockedReason).toContain("tramitadas o resueltas");
  });

  it("blocks deletion with the advanced-status message when any invoice is PAID", () => {
    const result = evaluateServiceDeleteEligibility([{ status: "PAID" }]);
    expect(result.canDelete).toBe(false);
    expect(result.blockedReason).toContain("tramitadas o resueltas");
  });

  it("blocks deletion with the advanced-status message when any invoice is REJECTED", () => {
    const result = evaluateServiceDeleteEligibility([{ status: "REJECTED" }]);
    expect(result.canDelete).toBe(false);
    expect(result.blockedReason).toContain("tramitadas o resueltas");
  });

  it("advanced status takes priority over INFORMATION_COMPLETED", () => {
    // Mixed: one INFORMATION_COMPLETED and one PAID — advanced status wins.
    const result = evaluateServiceDeleteEligibility([
      { status: "INFORMATION_COMPLETED" },
      { status: "PAID" },
    ]);
    expect(result.canDelete).toBe(false);
    expect(result.blockedReason).toContain("tramitadas o resueltas");
  });
});
