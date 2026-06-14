import { describe, expect, it } from "vitest";

import { createServiceUseCase } from "@/modules/reimbursement/application/CreateServiceUseCase";

import { createInvoiceRepositoryMock, createServiceRepositoryMock } from "../support/RepositoryMocks";
import { buildCreateServiceInput, buildService } from "../support/ServiceTestBuilders";

describe("CreateServiceUseCase", () => {
  it("creates a service with the expected defaults", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const input = buildCreateServiceInput({ attended: undefined });

    serviceRepository.insuranceHolderExists.mockResolvedValue(true);
    serviceRepository.insurerIsActive.mockResolvedValue(true);
    serviceRepository.create.mockResolvedValue(buildService());
    invoiceRepository.createMany.mockResolvedValue([]);

    const result = await createServiceUseCase(input, {
      serviceRepository,
      invoiceRepository,
    });

    expect(result).toEqual({ id: "service-1" });
    expect(serviceRepository.create).toHaveBeenCalledWith({
      serviceDate: input.serviceDate,
      description: "Consulta de fisioterapia",
      actualAmount: 200,
      invoiceBilledAmount: 55,
      invoiceExpectedAmount: 49.5,
      currency: "EUR",
      insuranceHolderPersonId: "person-1",
      insurerId: "insurer-1",
      serviceRecipientName: "Ana Perez",
      attended: true,
      status: "REGISTERED",
      notes: "Sin incidencias",
    });

    expect(invoiceRepository.createMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          serviceId: "service-1",
          insuranceHolderPersonId: "person-1",
          insurerId: "insurer-1",
          invoiceBilledAmount: 55,
          invoiceExpectedAmount: 49.5,
          status: "CREATED",
        }),
      ]),
    );
  });

  it("trims description, policy holder and notes before creating", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const input = buildCreateServiceInput({
      description: "  Consulta de rehabilitacion  ",
      serviceRecipientName: "  Luis Garcia  ",
      notes: "  Nota interna  ",
    });

    serviceRepository.insuranceHolderExists.mockResolvedValue(true);
    serviceRepository.insurerIsActive.mockResolvedValue(true);
    serviceRepository.create.mockResolvedValue(buildService());
    invoiceRepository.createMany.mockResolvedValue([]);

    await createServiceUseCase(input, {
      serviceRepository,
      invoiceRepository,
    });

    expect(serviceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Consulta de rehabilitacion",
        serviceRecipientName: "Luis Garcia",
        notes: "Nota interna",
      }),
    );
  });

  it("converts blank notes to undefined", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const input = buildCreateServiceInput({ notes: "   " });

    serviceRepository.insuranceHolderExists.mockResolvedValue(true);
    serviceRepository.insurerIsActive.mockResolvedValue(true);
    serviceRepository.create.mockResolvedValue(buildService({ notes: null }));
    invoiceRepository.createMany.mockResolvedValue([]);

    await createServiceUseCase(input, {
      serviceRepository,
      invoiceRepository,
    });

    expect(serviceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: undefined,
      }),
    );
  });

  it("fails when the amount is not greater than zero", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const input = buildCreateServiceInput({ actualAmount: 0 });

    await expect(
      createServiceUseCase(input, {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toMatchObject({
      code: "INVALID_AMOUNT",
    });

    expect(serviceRepository.insuranceHolderExists).not.toHaveBeenCalled();
    expect(serviceRepository.create).not.toHaveBeenCalled();
    expect(invoiceRepository.createMany).not.toHaveBeenCalled();
  });

  it("fails when the person does not exist", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.insuranceHolderExists.mockResolvedValue(false);
    serviceRepository.insurerIsActive.mockResolvedValue(true);

    await expect(
      createServiceUseCase(buildCreateServiceInput(), {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toMatchObject({
      code: "PERSON_NOT_FOUND",
    });

    expect(serviceRepository.create).not.toHaveBeenCalled();
  });

  it("fails when the insurer does not exist or is inactive", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.insuranceHolderExists.mockResolvedValue(true);
    serviceRepository.insurerIsActive.mockResolvedValue(false);

    await expect(
      createServiceUseCase(buildCreateServiceInput(), {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toMatchObject({
      code: "INSURER_NOT_FOUND_OR_INACTIVE",
    });

    expect(serviceRepository.create).not.toHaveBeenCalled();
  });

  it("fails when invoice configuration is not greater than zero", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    await expect(
      createServiceUseCase(buildCreateServiceInput({ invoiceExpectedAmount: 0 }), {
        serviceRepository,
        invoiceRepository,
      }),
    ).rejects.toMatchObject({
      code: "INVALID_INVOICE_CONFIGURATION",
    });
  });
});
