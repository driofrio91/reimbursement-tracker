import { describe, expect, it } from "vitest";

import {
  createServiceFormSchema,
  getCreateServiceFormValues,
  initialCreateServiceFormValues,
} from "@/modules/reimbursement/entrypoints/CreateServiceFormSchema";

function buildFormValues(overrides: Partial<typeof initialCreateServiceFormValues> = {}) {
  return {
    serviceDate: "2026-04-22",
    description: "Consulta de fisioterapia",
    actualAmount: "200,50",
    personId: "person-1",
    insurerId: "insurer-1",
    policyHolderName: "Ana Perez",
    attended: true,
    notes: "Observacion interna",
    ...overrides,
  };
}

describe("CreateServiceFormSchema", () => {
  it("accepts a valid payload and normalizes the amount", () => {
    const result = createServiceFormSchema.safeParse(buildFormValues());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.actualAmount).toBe(200.5);
      expect(result.data.attended).toBe(true);
    }
  });

  it("requires serviceDate", () => {
    const result = createServiceFormSchema.safeParse(buildFormValues({ serviceDate: "" }));

    expect(result.success).toBe(false);
  });

  it("requires description", () => {
    const result = createServiceFormSchema.safeParse(buildFormValues({ description: "" }));

    expect(result.success).toBe(false);
  });

  it("requires amount", () => {
    const result = createServiceFormSchema.safeParse(buildFormValues({ actualAmount: "" }));

    expect(result.success).toBe(false);
  });

  it("rejects a non numeric amount", () => {
    const result = createServiceFormSchema.safeParse(buildFormValues({ actualAmount: "abc" }));

    expect(result.success).toBe(false);
  });

  it("rejects an amount smaller than or equal to zero", () => {
    const result = createServiceFormSchema.safeParse(buildFormValues({ actualAmount: "0" }));

    expect(result.success).toBe(false);
  });

  it("requires person, insurer and policy holder", () => {
    const result = createServiceFormSchema.safeParse(
      buildFormValues({ personId: "", insurerId: "", policyHolderName: "" }),
    );

    expect(result.success).toBe(false);
  });

  it("allows optional notes", () => {
    const result = createServiceFormSchema.safeParse(buildFormValues({ notes: "" }));

    expect(result.success).toBe(true);
  });

  it("extracts form values and maps the attended checkbox to boolean", () => {
    const formData = new FormData();
    formData.set("serviceDate", "2026-04-22");
    formData.set("description", "Consulta de fisioterapia");
    formData.set("actualAmount", "200,50");
    formData.set("personId", "person-1");
    formData.set("insurerId", "insurer-1");
    formData.set("policyHolderName", "Ana Perez");
    formData.set("notes", "Observacion interna");

    const uncheckedValues = getCreateServiceFormValues(formData);

    expect(uncheckedValues.attended).toBe(false);

    formData.set("attended", "on");

    const checkedValues = getCreateServiceFormValues(formData);

    expect(checkedValues.attended).toBe(true);
  });
});
