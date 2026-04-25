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
    const invoices = [
      buildInvoice({ invoiceBilledAmount: 55, invoiceExpectedAmount: 49.5 }),
      buildInvoice({ invoiceBilledAmount: 55, invoiceExpectedAmount: 49.5 }),
    ];

    serviceRepository.getById.mockResolvedValue(service);
    invoiceRepository.listByServiceId.mockResolvedValue(invoices);

    const result = await getServiceInvoiceSummaryUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result).toMatchObject({
      service,
      invoices,
      totalBilledAmount: 110,
      totalExpectedAmount: 99,
      pendingExpectedAmount: 101,
      overBilledAmount: 0,
      overExpectedAmount: 0,
    });
  });

  it("returns over-invoiced values without negative pending amount", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ actualAmount: 200 });
    const invoices = [
      buildInvoice({ invoiceBilledAmount: 110, invoiceExpectedAmount: 100 }),
      buildInvoice({ invoiceBilledAmount: 110, invoiceExpectedAmount: 110 }),
    ];

    serviceRepository.getById.mockResolvedValue(service);
    invoiceRepository.listByServiceId.mockResolvedValue(invoices);

    const result = await getServiceInvoiceSummaryUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result).toMatchObject({
      totalBilledAmount: 220,
      totalExpectedAmount: 210,
      pendingExpectedAmount: 0,
      overBilledAmount: 20,
      overExpectedAmount: 10,
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
