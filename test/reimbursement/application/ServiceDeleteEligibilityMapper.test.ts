import { describe, expect, it } from "vitest";

import { mapServiceDeleteDecisionToEligibility } from "@/modules/reimbursement/application/ServiceDeleteEligibilityMapper";

describe("ServiceDeleteEligibilityMapper", () => {
  it("maps HAS_ADVANCED_INVOICES to the service delete blocked message", () => {
    const result = mapServiceDeleteDecisionToEligibility({
      canDelete: false,
      blockedReasonCode: "HAS_ADVANCED_INVOICES",
    });

    expect(result).toEqual({
      canDelete: false,
      blockedReason: "Este servicio ya tiene facturas tramitadas o resueltas y no se puede eliminar.",
    });
  });

  it("maps HAS_INFORMATION_COMPLETED_INVOICES to the service delete blocked message", () => {
    const result = mapServiceDeleteDecisionToEligibility({
      canDelete: false,
      blockedReasonCode: "HAS_INFORMATION_COMPLETED_INVOICES",
    });

    expect(result).toEqual({
      canDelete: false,
      blockedReason:
        "Para eliminar este servicio, primero revisa y borra una a una las facturas en estado Informacion completada.",
    });
  });

  it("returns an empty blocked reason when delete is allowed", () => {
    const result = mapServiceDeleteDecisionToEligibility({
      canDelete: true,
      blockedReasonCode: null,
    });

    expect(result).toEqual({
      canDelete: true,
      blockedReason: "",
    });
  });
});
