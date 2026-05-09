import { describe, expect, it } from "vitest";

import { getServiceInvoiceSummaryUseCase } from "@/modules/reimbursement/application/GetServiceInvoiceSummaryUseCase";
import { InvoiceStatus } from "@/modules/reimbursement/domain/Invoice";

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
      reimbursementOutcome: "PARTIAL",
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
      reimbursementOutcome: "PARTIAL",
    });
  });

  it("returns FULL reimbursement outcome when paid reaches expected total", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ actualAmount: 100 });
    const invoices = [
      buildInvoice({ status: "PAID", invoiceExpectedAmount: 50, paidAmount: 50 }),
      buildInvoice({ id: "invoice-2", status: "PAID", invoiceExpectedAmount: 50, paidAmount: 50 }),
    ];

    serviceRepository.getById.mockResolvedValue(service);
    invoiceRepository.listByServiceId.mockResolvedValue(invoices);

    const result = await getServiceInvoiceSummaryUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result?.reimbursementOutcome).toBe("FULL");
  });

  it("returns FULL reimbursement outcome when paid exceeds expected total", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ actualAmount: 100 });
    const invoices = [
      buildInvoice({ status: "PAID", invoiceExpectedAmount: 40, paidAmount: 45 }),
      buildInvoice({ id: "invoice-2", status: "PAID", invoiceExpectedAmount: 50, paidAmount: 55 }),
    ];

    serviceRepository.getById.mockResolvedValue(service);
    invoiceRepository.listByServiceId.mockResolvedValue(invoices);

    const result = await getServiceInvoiceSummaryUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result?.totalExpectedAmount).toBe(90);
    expect(result?.totalPaidAmount).toBe(100);
    expect(result?.reimbursementOutcome).toBe("FULL");
  });

  it("returns NONE reimbursement outcome when all invoices are resolved with zero paid", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ actualAmount: 100 });
    const invoices = [
      buildInvoice({ status: "REJECTED", invoiceExpectedAmount: 50, paidAmount: null }),
      buildInvoice({ id: "invoice-2", status: "REJECTED", invoiceExpectedAmount: 50, paidAmount: null }),
    ];

    serviceRepository.getById.mockResolvedValue(service);
    invoiceRepository.listByServiceId.mockResolvedValue(invoices);

    const result = await getServiceInvoiceSummaryUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result?.reimbursementOutcome).toBe("NONE");
  });

  it("returns PARTIAL reimbursement outcome when some amount is paid but resolved total is below expected", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ actualAmount: 100 });
    const invoices = [
      buildInvoice({ status: "PAID", invoiceExpectedAmount: 50, paidAmount: 20 }),
      buildInvoice({ id: "invoice-2", status: "REJECTED", invoiceExpectedAmount: 50, paidAmount: null }),
    ];

    serviceRepository.getById.mockResolvedValue(service);
    invoiceRepository.listByServiceId.mockResolvedValue(invoices);

    const result = await getServiceInvoiceSummaryUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result?.totalExpectedAmount).toBe(100);
    expect(result?.totalPaidAmount).toBe(20);
    expect(result?.reimbursementOutcome).toBe("PARTIAL");
  });

  it("keeps PARTIAL reimbursement outcome while case is still open with zero paid", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ actualAmount: 100 });
    const invoices = [
      buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED", invoiceExpectedAmount: 50, paidAmount: null }),
      buildInvoice({ id: "invoice-2", status: "CLAIM_REFERENCE_COMPLETED", invoiceExpectedAmount: 50, paidAmount: null }),
    ];

    serviceRepository.getById.mockResolvedValue(service);
    invoiceRepository.listByServiceId.mockResolvedValue(invoices);

    const result = await getServiceInvoiceSummaryUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(result?.totalPaidAmount).toBe(0);
    expect(result?.reimbursementOutcome).toBe("PARTIAL");
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

  it("matches the full reimbursement-outcome edge-case matrix", async () => {
    const matrix: Array<{
      caseId: string;
      entries: Array<{ status: InvoiceStatus; expectedAmount: number; paidAmount: number | null }>;
      expectedOutcome: "FULL" | "PARTIAL" | "NONE";
      expectedTotal: number;
      paidTotal: number;
    }> = [
      {
        caseId: "B1",
        entries: [
          { status: "PAID", expectedAmount: 50, paidAmount: 50 },
          { status: "PAID", expectedAmount: 50, paidAmount: 50 },
        ],
        expectedOutcome: "FULL",
        expectedTotal: 100,
        paidTotal: 100,
      },
      {
        caseId: "B2",
        entries: [
          { status: "PAID", expectedAmount: 40, paidAmount: 45 },
          { status: "PAID", expectedAmount: 50, paidAmount: 55 },
        ],
        expectedOutcome: "FULL",
        expectedTotal: 90,
        paidTotal: 100,
      },
      {
        caseId: "B3",
        entries: [
          { status: "PAID", expectedAmount: 50, paidAmount: 20 },
          { status: "REJECTED", expectedAmount: 50, paidAmount: null },
        ],
        expectedOutcome: "PARTIAL",
        expectedTotal: 100,
        paidTotal: 20,
      },
      {
        caseId: "B4",
        entries: [
          { status: "PAID", expectedAmount: 50, paidAmount: 20 },
          { status: "CLAIM_REFERENCE_COMPLETED", expectedAmount: 50, paidAmount: null },
        ],
        expectedOutcome: "PARTIAL",
        expectedTotal: 100,
        paidTotal: 20,
      },
      {
        caseId: "B5",
        entries: [
          { status: "REJECTED", expectedAmount: 50, paidAmount: null },
          { status: "REJECTED", expectedAmount: 50, paidAmount: null },
        ],
        expectedOutcome: "NONE",
        expectedTotal: 100,
        paidTotal: 0,
      },
      {
        caseId: "B6",
        entries: [
          { status: "CLAIM_REFERENCE_COMPLETED", expectedAmount: 50, paidAmount: null },
          { status: "CLAIM_REFERENCE_COMPLETED", expectedAmount: 50, paidAmount: null },
        ],
        expectedOutcome: "PARTIAL",
        expectedTotal: 100,
        paidTotal: 0,
      },
      {
        caseId: "B7",
        entries: [
          { status: "REJECTED", expectedAmount: 0, paidAmount: null },
          { status: "REJECTED", expectedAmount: 0, paidAmount: null },
        ],
        expectedOutcome: "NONE",
        expectedTotal: 0,
        paidTotal: 0,
      },
      {
        caseId: "B8",
        entries: [
          { status: "PAID", expectedAmount: 0, paidAmount: 10 },
          { status: "REJECTED", expectedAmount: 0, paidAmount: null },
        ],
        expectedOutcome: "PARTIAL",
        expectedTotal: 0,
        paidTotal: 10,
      },
      {
        caseId: "B9",
        entries: [
          { status: "PAID", expectedAmount: 75, paidAmount: 74.99 },
          { status: "REJECTED", expectedAmount: 75, paidAmount: null },
        ],
        expectedOutcome: "PARTIAL",
        expectedTotal: 150,
        paidTotal: 74.99,
      },
      {
        caseId: "B10",
        entries: [
          { status: "PAID", expectedAmount: 75, paidAmount: 75.01 },
          { status: "PAID", expectedAmount: 75, paidAmount: 75 },
        ],
        expectedOutcome: "FULL",
        expectedTotal: 150,
        paidTotal: 150.01,
      },
    ];

    for (const matrixCase of matrix) {
      const serviceRepository = createServiceRepositoryMock();
      const invoiceRepository = createInvoiceRepositoryMock();
      const invoices = matrixCase.entries.map((entry, index) =>
        buildInvoice({
          id: `invoice-${index + 1}`,
          status: entry.status,
          invoiceExpectedAmount: entry.expectedAmount,
          paidAmount: entry.paidAmount,
        }),
      );

      serviceRepository.getById.mockResolvedValue(buildService());
      invoiceRepository.listByServiceId.mockResolvedValue(invoices);

      const result = await getServiceInvoiceSummaryUseCase("service-1", {
        serviceRepository,
        invoiceRepository,
      });

      expect(result, `Missing summary result for ${matrixCase.caseId}`).not.toBeNull();
      expect(result?.totalExpectedAmount, `Failed expected total in ${matrixCase.caseId}`).toBe(matrixCase.expectedTotal);
      expect(result?.totalPaidAmount, `Failed paid total in ${matrixCase.caseId}`).toBe(matrixCase.paidTotal);
      expect(result?.reimbursementOutcome, `Failed outcome in ${matrixCase.caseId}`).toBe(matrixCase.expectedOutcome);
    }
  });
});
