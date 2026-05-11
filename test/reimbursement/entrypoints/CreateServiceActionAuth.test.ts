import { describe, expect, it, vi } from "vitest";

import { createServiceAction } from "@/app/(private)/services/new/actions";

vi.mock("@/lib/auth/authorization", () => {
  class MockAuthorizationError extends Error {
    constructor(
      readonly code: "UNAUTHENTICATED" | "FORBIDDEN",
      message: string,
    ) {
      super(message);
    }
  }

  return {
    AuthorizationError: MockAuthorizationError,
    requireRole: vi.fn(async () => {
      throw new MockAuthorizationError("UNAUTHENTICATED", "Debes iniciar sesion para continuar.");
    }),
  };
});

describe("createServiceAction authorization", () => {
  it("returns form error when user is not authenticated", async () => {
    const formData = new FormData();

    const result = await createServiceAction(
      {
        values: {
          serviceDate: "",
          description: "",
          actualAmount: "",
          invoiceBilledAmount: "",
          invoiceExpectedAmount: "",
          personId: "",
          insurerId: "",
          policyHolderName: "",
          attended: true,
          notes: "",
        },
        errors: {},
      },
      formData,
    );

    expect(result.errors.form).toBe("Debes iniciar sesion para crear un servicio.");
  });
});
