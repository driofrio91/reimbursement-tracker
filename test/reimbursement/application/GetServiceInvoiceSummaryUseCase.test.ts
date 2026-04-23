import { describe, expect, it } from "vitest";

import { getServiceInvoiceSummaryUseCase } from "@/modules/reimbursement/application/GetServiceInvoiceSummaryUseCase";

import { buildInvoice } from "../support/InvoiceTestBuilders";
import { createInvoiceRepositoryMock, createServiceRepositoryMock } from "../support/RepositoryMocks";
import { buildService } from "../support/ServiceTestBuilders";

describe("GetServiceInvoiceSummaryUseCase", () => {
  it("returns null when service does not exist", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(null);

    const result = await getServiceInvoiceSummaryUseCase("missing-service", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result).toBeNull();
    expect(invoiceRepository.listByServiceId).not.toHaveBeenCalled();
  });

  it("returns totals for partially invoiced service", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ actualAmount: 200 });
    const invoices = [buildInvoice({ amount: 50 }), buildInvoice({ amount: 80 })];

    serviceRepository.getById.mockResolvedValue(service);
    invoiceRepository.listByServiceId.mockResolvedValue(invoices);

    const result = await getServiceInvoiceSummaryUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result).toMatchObject({
      service,
      invoices,
      totalInvoicedAmount: 130,
      pendingToInvoiceAmount: 70,
      overInvoicedAmount: 0,
      isOverInvoiced: false,
    });
  });

  it("returns over-invoiced values without negative pending amount", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ actualAmount: 200 });
    const invoices = [buildInvoice({ amount: 120 }), buildInvoice({ amount: 100 })];

    serviceRepository.getById.mockResolvedValue(service);
    invoiceRepository.listByServiceId.mockResolvedValue(invoices);

    const result = await getServiceInvoiceSummaryUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result).toMatchObject({
      totalInvoicedAmount: 220,
      pendingToInvoiceAmount: 0,
      overInvoicedAmount: 20,
      isOverInvoiced: true,
    });
  });

  it("calls repositories with service id", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.listByServiceId.mockResolvedValue([]);

    await getServiceInvoiceSummaryUseCase("service-42", {
      serviceRepository,
      invoiceRepository,
    });

    expect(serviceRepository.getById).toHaveBeenCalledWith("service-42");
    expect(invoiceRepository.listByServiceId).toHaveBeenCalledWith("service-42");
  });

  it("propagates repository errors", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.listByServiceId.mockRejectedValue(new Error("db failure"));

    await expect(
      getServiceInvoiceSummaryUseCase("service-1", {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toThrow("db failure");
  });
});
