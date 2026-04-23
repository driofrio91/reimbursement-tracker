import { describe, expect, it } from "vitest";

import {
  createInvoiceFormSchema,
  getCreateInvoiceFormValues,
  initialCreateInvoiceFormValues,
} from "@/modules/reimbursement/entrypoints/CreateInvoiceFormSchema";

function buildFormValues(overrides: Partial<typeof initialCreateInvoiceFormValues> = {}) {
  return {
    invoiceNumber: "F-2026-001",
    invoiceDate: "2026-04-22",
    amount: "150,75",
    issuerName: "Clinica Central",
    issuerTaxId: "B12345678",
    notes: "Observacion interna",
    ...overrides,
  };
}

describe("CreateInvoiceFormSchema", () => {
  it("accepts a valid payload and normalizes the amount", () => {
    const result = createInvoiceFormSchema.safeParse(buildFormValues());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(150.75);
    }
  });

  it("requires invoiceNumber, invoiceDate, amount and issuerName", () => {
    const result = createInvoiceFormSchema.safeParse(
      buildFormValues({
        invoiceNumber: "",
        invoiceDate: "",
        amount: "",
        issuerName: "",
      }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects non numeric amounts", () => {
    const result = createInvoiceFormSchema.safeParse(buildFormValues({ amount: "abc" }));

    expect(result.success).toBe(false);
  });

  it("rejects amounts smaller than or equal to zero", () => {
    const result = createInvoiceFormSchema.safeParse(buildFormValues({ amount: "0" }));

    expect(result.success).toBe(false);
  });

  it("allows optional issuerTaxId and notes", () => {
    const result = createInvoiceFormSchema.safeParse(
      buildFormValues({
        issuerTaxId: "",
        notes: "",
      }),
    );

    expect(result.success).toBe(true);
  });

  it("maps missing form fields to empty strings", () => {
    const formData = new FormData();

    const values = getCreateInvoiceFormValues(formData);

    expect(values).toEqual({
      invoiceNumber: "",
      invoiceDate: "",
      amount: "",
      issuerName: "",
      issuerTaxId: "",
      notes: "",
    });
  });
});
