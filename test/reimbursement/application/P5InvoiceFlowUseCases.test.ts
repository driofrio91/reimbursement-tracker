import { describe, expect, it } from "vitest";

import {
  AddInvoiceToServiceUseCaseError,
  addInvoiceToServiceUseCase,
} from "@/modules/reimbursement/application/AddInvoiceToServiceUseCase";
import {
  BuildServiceInvoicesCsvUseCaseError,
  buildServiceInvoicesCsvUseCase,
} from "@/modules/reimbursement/application/BuildServiceInvoicesCsvUseCase";
import {
  DeleteCreatedInvoiceUseCaseError,
  deleteCreatedInvoiceUseCase,
} from "@/modules/reimbursement/application/DeleteCreatedInvoiceUseCase";

import { buildInvoice } from "../support/InvoiceTestBuilders";
import { createInvoiceRepositoryMock, createServiceRepositoryMock } from "../support/RepositoryMocks";
import { buildService } from "../support/ServiceTestBuilders";

describe("P5 invoice flow use cases", () => {
  it("adds a created invoice inheriting service defaults", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.create.mockResolvedValue(buildInvoice());

    const result = await addInvoiceToServiceUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
    });

    expect(invoiceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceId: "service-1",
        personId: "person-1",
        insurerId: "insurer-1",
        invoiceBilledAmount: 55,
        invoiceExpectedAmount: 49.5,
        currency: "EUR",
        status: "CREATED",
        createdManually: true,
      }),
    );
    expect(result.createdInvoiceId).toBe("invoice-1");
  });

  it("rejects adding invoice when service is reimbursed", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService({ status: "REIMBURSED" }));

    await expect(addInvoiceToServiceUseCase("service-1", { serviceRepository, invoiceRepository })).rejects.toBeInstanceOf(
      AddInvoiceToServiceUseCaseError,
    );

    expect(invoiceRepository.create).not.toHaveBeenCalled();
  });

  it("deletes invoice only when it stays in created status", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "CREATED" }));
    serviceRepository.getById.mockResolvedValue(buildService({ status: "REGISTERED" }));
    invoiceRepository.deleteDraftOrInformationCompleted.mockResolvedValue(true);

    await deleteCreatedInvoiceUseCase("invoice-1", {
      invoiceRepository,
      serviceRepository,
    });

    expect(invoiceRepository.deleteDraftOrInformationCompleted).toHaveBeenCalledWith("invoice-1");
  });

  it("rejects deleting invoice outside created status", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "PAID" }));
    serviceRepository.getById.mockResolvedValue(buildService());

    await expect(deleteCreatedInvoiceUseCase("invoice-1", { invoiceRepository, serviceRepository })).rejects.toBeInstanceOf(
      DeleteCreatedInvoiceUseCaseError,
    );
  });

  it("allows deleting invoice in information completed status", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "INFORMATION_COMPLETED" }));
    serviceRepository.getById.mockResolvedValue(buildService({ status: "REGISTERED" }));
    invoiceRepository.deleteDraftOrInformationCompleted.mockResolvedValue(true);

    await deleteCreatedInvoiceUseCase("invoice-1", {
      invoiceRepository,
      serviceRepository,
    });

    expect(invoiceRepository.deleteDraftOrInformationCompleted).toHaveBeenCalledWith("invoice-1");
  });

  it("builds csv with bom, semicolon separator, and decimal comma", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService({ description: "Fisio Cervical Ágil" }));
    invoiceRepository.listByServiceId.mockResolvedValue([
      buildInvoice({ status: "CREATED", invoiceBilledAmount: 55 }),
      buildInvoice({ id: "invoice-2", status: "PAID", invoiceBilledAmount: 33.4 }),
    ]);

    const csv = await buildServiceInvoicesCsvUseCase("service-1", {
      serviceRepository,
      invoiceRepository,
      now: () => new Date("2026-05-16T14:07:00"),
    });

    expect(csv.content.startsWith("\uFEFF")).toBe(true);
    expect(csv.content).toContain("TRATAMIENTO;IMPORTE DE LA FACTURA;TITULAR;FECHA FACTURA;SOLICITADA");
    expect(csv.content).toContain("FISIOTERAPIA - CERVICAL;55,00;;;");
    expect(csv.filename).toBe("facturas-fisio-cervical-agil-20260516-1407.csv");
  });

  it("rejects csv export when there are no created invoices", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.listByServiceId.mockResolvedValue([buildInvoice({ status: "PAID" })]);

    await expect(buildServiceInvoicesCsvUseCase("service-1", { serviceRepository, invoiceRepository })).rejects.toBeInstanceOf(
      BuildServiceInvoicesCsvUseCaseError,
    );
  });
});
