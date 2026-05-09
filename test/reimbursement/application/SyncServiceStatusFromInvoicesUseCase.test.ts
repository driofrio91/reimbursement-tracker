import { describe, expect, it } from "vitest";

import {
  deriveServiceStatusFromInvoices,
  SyncServiceStatusFromInvoicesUseCaseError,
  syncServiceStatusFromInvoicesUseCase,
} from "@/modules/reimbursement/application/SyncServiceStatusFromInvoicesUseCase";
import { InvoiceStatus } from "@/modules/reimbursement/domain/Invoice";

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

  it("updates to REGISTERED when a service in submitted has at least one invoice in initial stage", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService({ status: "SUBMITTED" }));
    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "CREATED" }),
      buildInvoice({ id: "invoice-2", status: "PAID" }),
    ]);
    serviceRepository.updateStatus.mockResolvedValue(buildService({ status: "REGISTERED" }));

    const result = await syncServiceStatusFromInvoicesUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(serviceRepository.updateStatus).toHaveBeenCalledWith("service-1", "REGISTERED");
    expect(result.status).toBe("REGISTERED");
  });

  it("updates to REIMBURSED when every invoice is rejected", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService({ status: "SUBMITTED" }));
    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "REJECTED" }),
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

  it("updates to SUBMITTED when every invoice is beyond initial stage but not all are resolved", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService({ status: "REGISTERED" }));
    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED" }),
      buildInvoice({ id: "invoice-2", status: "CLAIM_REFERENCE_COMPLETED" }),
    ]);
    serviceRepository.updateStatus.mockResolvedValue(buildService({ status: "SUBMITTED" }));

    const result = await syncServiceStatusFromInvoicesUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(serviceRepository.updateStatus).toHaveBeenCalledWith("service-1", "SUBMITTED");
    expect(result.status).toBe("SUBMITTED");
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

  it("returns REIMBURSED when all invoices are REJECTED", () => {
    expect(
      deriveServiceStatusFromInvoices([
        buildInvoice({ status: "REJECTED" }),
        buildInvoice({ id: "invoice-2", status: "REJECTED" }),
      ]),
    ).toBe("REIMBURSED");
  });

  it("returns REGISTERED when mixed invoices include at least one initial stage", () => {
    expect(
      deriveServiceStatusFromInvoices([
        buildInvoice({ status: "PAID" }),
        buildInvoice({ id: "invoice-2", status: "INFORMATION_COMPLETED" }),
      ]),
    ).toBe("REGISTERED");
  });

  it("matches the full service-status edge-case matrix", () => {
    const matrix: Array<{
      caseId: string;
      statuses: InvoiceStatus[];
      expected: "REGISTERED" | "SUBMITTED" | "REIMBURSED";
    }> = [
      { caseId: "A1", statuses: [], expected: "REGISTERED" },
      { caseId: "A2", statuses: ["CREATED"], expected: "REGISTERED" },
      { caseId: "A3", statuses: ["INFORMATION_COMPLETED"], expected: "REGISTERED" },
      { caseId: "A4", statuses: ["CLAIM_REFERENCE_COMPLETED"], expected: "SUBMITTED" },
      { caseId: "A5", statuses: ["PAID"], expected: "REIMBURSED" },
      { caseId: "A6", statuses: ["REJECTED"], expected: "REIMBURSED" },
      { caseId: "A7", statuses: ["PAID", "REJECTED"], expected: "REIMBURSED" },
      { caseId: "A8", statuses: ["CLAIM_REFERENCE_COMPLETED", "PAID"], expected: "SUBMITTED" },
      { caseId: "A9", statuses: ["CLAIM_REFERENCE_COMPLETED", "REJECTED"], expected: "SUBMITTED" },
      { caseId: "A10", statuses: ["PAID", "INFORMATION_COMPLETED"], expected: "REGISTERED" },
      { caseId: "A11", statuses: ["REJECTED", "CREATED"], expected: "REGISTERED" },
      { caseId: "A12", statuses: ["CLAIM_REFERENCE_COMPLETED", "CLAIM_REFERENCE_COMPLETED"], expected: "SUBMITTED" },
      { caseId: "A13", statuses: ["PAID", "PAID", "REJECTED"], expected: "REIMBURSED" },
      { caseId: "A14", statuses: ["CREATED", "CLAIM_REFERENCE_COMPLETED", "PAID"], expected: "REGISTERED" },
    ];

    for (const matrixCase of matrix) {
      const invoices = matrixCase.statuses.map((status, index) =>
        buildInvoice({
          id: `invoice-${index + 1}`,
          status,
        }),
      );

      expect(deriveServiceStatusFromInvoices(invoices), `Failed matrix case ${matrixCase.caseId}`).toBe(matrixCase.expected);
    }
  });
});
