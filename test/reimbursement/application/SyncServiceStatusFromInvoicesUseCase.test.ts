import { describe, expect, it } from "vitest";

import {
  deriveServiceStatusFromInvoices,
  SyncServiceStatusFromInvoicesUseCaseError,
  syncServiceStatusFromInvoicesUseCase,
} from "@/modules/reimbursement/application/SyncServiceStatusFromInvoicesUseCase";

import { buildInvoice } from "../support/InvoiceTestBuilders";
import { createInvoiceRepositoryMock, createServiceRepositoryMock } from "../support/RepositoryMocks";
import { buildService } from "../support/ServiceTestBuilders";

describe("SyncServiceStatusFromInvoicesUseCase", () => {
  it("throws when service does not exist", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(null);

    await expect(
      syncServiceStatusFromInvoicesUseCase("missing-service", {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toThrow(SyncServiceStatusFromInvoicesUseCaseError);
  });

  it("does not update when derived status is already persisted", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService({ status: "REGISTERED" }));
    invoiceRepository.listByServiceId.mockResolvedValue([buildInvoice({ status: "CREATED" })]);

    const result = await syncServiceStatusFromInvoicesUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result.status).toBe("REGISTERED");
    expect(serviceRepository.updateStatus).not.toHaveBeenCalled();
  });

  it("updates to SUBMITTED when no invoices are in initial stages and case is still open", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService({ status: "REGISTERED" }));
    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED" }),
      buildInvoice({ id: "invoice-2", status: "PAID" }),
    ]);
    serviceRepository.updateStatus.mockResolvedValue(buildService({ status: "SUBMITTED" }));

    const result = await syncServiceStatusFromInvoicesUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(serviceRepository.updateStatus).toHaveBeenCalledWith("service-1", "SUBMITTED");
    expect(result.status).toBe("SUBMITTED");
  });

  it("updates to REIMBURSED when every invoice is resolved", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService({ status: "SUBMITTED" }));
    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "PAID" }),
      buildInvoice({ id: "invoice-2", status: "REJECTED" }),
    ]);
    serviceRepository.updateStatus.mockResolvedValue(buildService({ status: "REIMBURSED" }));

    const result = await syncServiceStatusFromInvoicesUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(serviceRepository.updateStatus).toHaveBeenCalledWith("service-1", "REIMBURSED");
    expect(result.status).toBe("REIMBURSED");
  });
});

describe("deriveServiceStatusFromInvoices", () => {
  it("returns REGISTERED for empty invoice sets", () => {
    expect(deriveServiceStatusFromInvoices([])).toBe("REGISTERED");
  });

  it("returns REGISTERED if at least one invoice is CREATED or INFORMATION_COMPLETED", () => {
    expect(
      deriveServiceStatusFromInvoices([
        buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED" }),
        buildInvoice({ id: "invoice-2", status: "INFORMATION_COMPLETED" }),
      ]),
    ).toBe("REGISTERED");
  });

  it("returns SUBMITTED when invoices are beyond initial stages but not all resolved", () => {
    expect(
      deriveServiceStatusFromInvoices([
        buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED" }),
        buildInvoice({ id: "invoice-2", status: "PAID" }),
      ]),
    ).toBe("SUBMITTED");
  });

  it("returns REIMBURSED when all invoices are PAID or REJECTED", () => {
    expect(
      deriveServiceStatusFromInvoices([
        buildInvoice({ status: "PAID" }),
        buildInvoice({ id: "invoice-2", status: "REJECTED" }),
      ]),
    ).toBe("REIMBURSED");
  });
});
