import { describe, expect, it, vi } from "vitest";

import { addInvoiceAction, deleteInvoiceAction, markInvoiceAsPaidAction } from "@/app/(private)/services/[id]/actions";

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

describe("invoice actions authorization", () => {
  it("returns user-facing auth error when access is denied", async () => {
    const result = await markInvoiceAsPaidAction(
      "service-1",
      "invoice-1",
      { status: "idle", message: "", token: 0 },
      new FormData(),
    );

    expect(result).toMatchObject({
      status: "error",
      message: "Debes iniciar sesion para completar esta accion.",
    });
  });

  it("returns auth error when adding invoice without session", async () => {
    const result = await addInvoiceAction("service-1", { status: "idle", message: "", token: 0 }, new FormData());

    expect(result).toMatchObject({
      status: "error",
      message: "Debes iniciar sesion para completar esta accion.",
    });
  });

  it("returns auth error when deleting invoice without session", async () => {
    const result = await deleteInvoiceAction("service-1", "invoice-1", { status: "idle", message: "", token: 0 }, new FormData());

    expect(result).toMatchObject({
      status: "error",
      message: "Debes iniciar sesion para completar esta accion.",
    });
  });
});
