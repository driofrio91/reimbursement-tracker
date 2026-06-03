import { describe, expect, it } from "vitest";

import {
  DeleteServiceWithCreatedInvoicesUseCaseError,
  deleteServiceWithCreatedInvoicesUseCase,
} from "@/modules/reimbursement/application/DeleteServiceWithCreatedInvoicesUseCase";

import { buildInvoice } from "../support/InvoiceTestBuilders";
import { createInvoiceRepositoryMock, createServiceRepositoryMock } from "../support/RepositoryMocks";
import { buildService } from "../support/ServiceTestBuilders";

describe("DeleteServiceWithCreatedInvoicesUseCase", () => {
  it("deletes service when all invoices are created", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ id: "invoice-1", status: "CREATED" }),
      buildInvoice({ id: "invoice-2", status: "CREATED" }),
    ]);
    serviceRepository.deleteWithInvoicesInCreatedStatusOnly.mockResolvedValue(true);

    await deleteServiceWithCreatedInvoicesUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(serviceRepository.deleteWithInvoicesInCreatedStatusOnly).toHaveBeenCalledWith("service-1");
  });

  it("rejects deletion when at least one invoice is information completed", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.listByServiceId.mockResolvedValue([buildInvoice({ status: "INFORMATION_COMPLETED" })]);

    await expect(
      deleteServiceWithCreatedInvoicesUseCase("service-1", {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toBeInstanceOf(DeleteServiceWithCreatedInvoicesUseCaseError);
  });

  it("rejects deletion when state changed during execution", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.listByServiceId.mockResolvedValue([buildInvoice({ status: "CREATED" })]);
    serviceRepository.deleteWithInvoicesInCreatedStatusOnly.mockResolvedValue(false);

    await expect(
      deleteServiceWithCreatedInvoicesUseCase("service-1", {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toBeInstanceOf(DeleteServiceWithCreatedInvoicesUseCaseError);
  });
});
