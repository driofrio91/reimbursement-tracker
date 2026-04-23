import { describe, expect, it } from "vitest";

import { createInvoiceForServiceUseCase } from "@/modules/reimbursement/application/CreateInvoiceForServiceUseCase";

import { buildCreateInvoiceForServiceInput, buildInvoice } from "../support/InvoiceTestBuilders";
import { createInvoiceRepositoryMock, createServiceRepositoryMock } from "../support/RepositoryMocks";
import { buildService } from "../support/ServiceTestBuilders";

describe("CreateInvoiceForServiceUseCase", () => {
  it("creates an invoice with the expected defaults", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.create.mockResolvedValue(buildInvoice());

    const result = await createInvoiceForServiceUseCase(buildCreateInvoiceForServiceInput(), {
      serviceRepository,
      invoiceRepository,
    });

    expect(result).toEqual({ id: "invoice-1" });
    expect(invoiceRepository.create).toHaveBeenCalledWith({
      serviceId: "service-1",
      requestId: null,
      invoiceNumber: "F-2026-001",
      invoiceDate: new Date("2026-04-22T00:00:00.000Z"),
      amount: 150,
      currency: "EUR",
      issuerName: "Clinica Central",
      issuerTaxId: "B12345678",
      status: "RECEIVED",
      reimbursedAmount: null,
      reimbursedAt: null,
      rejectionReason: null,
      notes: "Documento original archivado",
    });
  });

  it("trims required and optional text fields before creating", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.create.mockResolvedValue(buildInvoice());

    await createInvoiceForServiceUseCase(
      buildCreateInvoiceForServiceInput({
        invoiceNumber: "  F-2026-999  ",
        issuerName: "  Clinica Norte  ",
        issuerTaxId: "  B87654321  ",
        notes: "  Revisar posteriormente  ",
      }),
      {
        serviceRepository,
        invoiceRepository,
      },
    );

    expect(invoiceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceNumber: "F-2026-999",
        issuerName: "Clinica Norte",
        issuerTaxId: "B87654321",
        notes: "Revisar posteriormente",
      }),
    );
  });

  it("converts blank optional fields to undefined", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.create.mockResolvedValue(
      buildInvoice({
        issuerTaxId: null,
        notes: null,
      }),
    );

    await createInvoiceForServiceUseCase(
      buildCreateInvoiceForServiceInput({
        issuerTaxId: "   ",
        notes: "   ",
      }),
      {
        serviceRepository,
        invoiceRepository,
      },
    );

    expect(invoiceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        issuerTaxId: undefined,
        notes: undefined,
      }),
    );
  });

  it("fails when amount is not greater than zero", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    await expect(
      createInvoiceForServiceUseCase(buildCreateInvoiceForServiceInput({ amount: 0 }), {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toMatchObject({
      code: "INVALID_AMOUNT",
    });

    expect(serviceRepository.getById).not.toHaveBeenCalled();
    expect(invoiceRepository.create).not.toHaveBeenCalled();
  });

  it("fails when service does not exist", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(null);

    await expect(
      createInvoiceForServiceUseCase(buildCreateInvoiceForServiceInput(), {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toMatchObject({
      code: "SERVICE_NOT_FOUND",
    });

    expect(invoiceRepository.create).not.toHaveBeenCalled();
  });

  it("propagates repository errors", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.getById.mockResolvedValue(buildService());
    invoiceRepository.create.mockRejectedValue(new Error("db failure"));

    await expect(
      createInvoiceForServiceUseCase(buildCreateInvoiceForServiceInput(), {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toThrow("db failure");
  });
});
