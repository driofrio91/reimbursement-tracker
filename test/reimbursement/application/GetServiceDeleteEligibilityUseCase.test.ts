import { describe, expect, it } from "vitest";

import { getServiceDeleteEligibilityUseCase } from "@/modules/reimbursement/application/GetServiceDeleteEligibilityUseCase";

import { buildInvoice } from "../support/InvoiceTestBuilders";
import { createInvoiceRepositoryMock } from "../support/RepositoryMocks";

describe("GetServiceDeleteEligibilityUseCase", () => {
  it("returns canDelete true when service has no invoices", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.listByServiceId.mockResolvedValue([]);

    const result = await getServiceDeleteEligibilityUseCase("service-1", { invoiceRepository });

    expect(result.canDelete).toBe(true);
    expect(result.blockedReason).toBe("");
  });

  it("returns canDelete true when all invoices are in CREATED status", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "CREATED" }),
      buildInvoice({ id: "invoice-2", status: "CREATED" }),
    ]);

    const result = await getServiceDeleteEligibilityUseCase("service-1", { invoiceRepository });

    expect(result.canDelete).toBe(true);
    expect(result.blockedReason).toBe("");
  });

  it("returns canDelete false when any invoice has INFORMATION_COMPLETED status", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "CREATED" }),
      buildInvoice({ id: "invoice-2", status: "INFORMATION_COMPLETED" }),
    ]);

    const result = await getServiceDeleteEligibilityUseCase("service-1", { invoiceRepository });

    expect(result.canDelete).toBe(false);
    expect(result.blockedReason).not.toBe("");
  });

  it("returns canDelete false when any invoice has PAID status", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "PAID" }),
    ]);

    const result = await getServiceDeleteEligibilityUseCase("service-1", { invoiceRepository });

    expect(result.canDelete).toBe(false);
    expect(result.blockedReason).not.toBe("");
  });

  it("returns canDelete false when any invoice has REJECTED status", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "REJECTED" }),
    ]);

    const result = await getServiceDeleteEligibilityUseCase("service-1", { invoiceRepository });

    expect(result.canDelete).toBe(false);
    expect(result.blockedReason).not.toBe("");
  });

  it("returns canDelete false when any invoice has CLAIM_REFERENCE_COMPLETED status", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED" }),
    ]);

    const result = await getServiceDeleteEligibilityUseCase("service-1", { invoiceRepository });

    expect(result.canDelete).toBe(false);
    expect(result.blockedReason).not.toBe("");
  });

  it("calls listByServiceId with the given service id", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.listByServiceId.mockResolvedValue([]);

    await getServiceDeleteEligibilityUseCase("service-42", { invoiceRepository });

    expect(invoiceRepository.listByServiceId).toHaveBeenCalledWith("service-42");
    expect(invoiceRepository.listByServiceId).toHaveBeenCalledTimes(1);
  });

  it("propagates repository errors", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.listByServiceId.mockRejectedValue(new Error("db failure"));

    await expect(
      getServiceDeleteEligibilityUseCase("service-1", { invoiceRepository }),
    ).rejects.toThrow("db failure");
  });
});
