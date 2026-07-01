import { describe, expect, it } from "vitest";

import { createSyncAnnualLimitsActionResult } from "@/app/(private)/sync-annual-limits-state";

describe("createSyncAnnualLimitsActionResult", () => {
  it("returns success when sync completes without row errors", () => {
    const result = createSyncAnnualLimitsActionResult(
      {
        year: 2026,
        combinationsProcessed: 3,
        adjusted: 1,
        unchanged: 1,
        zeroed: 1,
        errors: 0,
      },
      123,
    );

    expect(result).toEqual({
      status: "success",
      message: "Sync 2026: 3 combinaciones titular+aseguradora, 1 ajustados, 1 sin cambios, 1 obsoletos a cero, 0 errores.",
      token: 123,
    });
  });

  it("returns error when sync has partial row errors", () => {
    const result = createSyncAnnualLimitsActionResult(
      {
        year: 2026,
        combinationsProcessed: 4,
        adjusted: 1,
        unchanged: 2,
        zeroed: 0,
        errors: 1,
      },
      456,
    );

    expect(result).toEqual({
      status: "error",
      message: "Sync 2026 parcial: 4 combinaciones titular+aseguradora, 1 ajustados, 2 sin cambios, 0 obsoletos a cero, 1 errores.",
      token: 456,
    });
  });
});
