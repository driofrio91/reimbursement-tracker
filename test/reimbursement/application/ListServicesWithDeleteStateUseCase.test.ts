import { describe, expect, it } from "vitest";

import { listServicesWithDeleteStateUseCase } from "@/modules/reimbursement/application/ListServicesWithDeleteStateUseCase";

import { createInvoiceRepositoryMock, createServiceRepositoryMock } from "../support/RepositoryMocks";
import { buildService } from "../support/ServiceTestBuilders";

describe("ListServicesWithDeleteStateUseCase", () => {
  it("returns an empty array when no services exist", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.list.mockResolvedValue([]);

    const result = await listServicesWithDeleteStateUseCase({ serviceRepository, invoiceRepository });

    expect(result).toEqual([]);
    expect(invoiceRepository.listStatusesByServiceIds).not.toHaveBeenCalled();
  });

  it("returns services with canDelete true when all invoices are in CREATED status", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ id: "service-1" });

    serviceRepository.list.mockResolvedValue([service]);
    invoiceRepository.listStatusesByServiceIds.mockResolvedValue(
      new Map([["service-1", [{ status: "CREATED" }]]]),
    );

    const result = await listServicesWithDeleteStateUseCase({ serviceRepository, invoiceRepository });

    expect(result).toHaveLength(1);
    expect(result[0]!.canDelete).toBe(true);
    expect(result[0]!.deleteBlockedReason).toBe("");
  });

  it("returns services with canDelete false when any invoice has an advanced status", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ id: "service-1" });

    serviceRepository.list.mockResolvedValue([service]);
    invoiceRepository.listStatusesByServiceIds.mockResolvedValue(
      new Map([["service-1", [{ status: "PAID" }]]]),
    );

    const result = await listServicesWithDeleteStateUseCase({ serviceRepository, invoiceRepository });

    expect(result[0]!.canDelete).toBe(false);
    expect(result[0]!.deleteBlockedReason).not.toBe("");
  });

  it("derives independent delete state per service", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const serviceA = buildService({ id: "service-a" });
    const serviceB = buildService({ id: "service-b" });

    serviceRepository.list.mockResolvedValue([serviceA, serviceB]);
    invoiceRepository.listStatusesByServiceIds.mockResolvedValue(
      new Map([
        ["service-a", [{ status: "CREATED" }]],
        ["service-b", [{ status: "PAID" }]],
      ]),
    );

    const result = await listServicesWithDeleteStateUseCase({ serviceRepository, invoiceRepository });

    const resultA = result.find((item) => item.service.id === "service-a");
    const resultB = result.find((item) => item.service.id === "service-b");

    expect(resultA!.canDelete).toBe(true);
    expect(resultB!.canDelete).toBe(false);
  });

  it("treats services with no invoices as deletable", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ id: "service-1" });

    serviceRepository.list.mockResolvedValue([service]);
    invoiceRepository.listStatusesByServiceIds.mockResolvedValue(new Map());

    const result = await listServicesWithDeleteStateUseCase({ serviceRepository, invoiceRepository });

    expect(result[0]!.canDelete).toBe(true);
    expect(result[0]!.deleteBlockedReason).toBe("");
  });

  it("calls listStatusesByServiceIds with all service ids in one batch", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const services = [
      buildService({ id: "service-1" }),
      buildService({ id: "service-2" }),
      buildService({ id: "service-3" }),
    ];

    serviceRepository.list.mockResolvedValue(services);
    invoiceRepository.listStatusesByServiceIds.mockResolvedValue(new Map());

    await listServicesWithDeleteStateUseCase({ serviceRepository, invoiceRepository });

    expect(invoiceRepository.listStatusesByServiceIds).toHaveBeenCalledTimes(1);
    expect(invoiceRepository.listStatusesByServiceIds).toHaveBeenCalledWith(
      expect.arrayContaining(["service-1", "service-2", "service-3"]),
    );
  });

  it("includes the service entity in each result item", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();
    const service = buildService({ id: "service-1" });

    serviceRepository.list.mockResolvedValue([service]);
    invoiceRepository.listStatusesByServiceIds.mockResolvedValue(new Map());

    const result = await listServicesWithDeleteStateUseCase({ serviceRepository, invoiceRepository });

    expect(result[0]!.service).toEqual(service);
  });

  it("propagates service repository errors", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.list.mockRejectedValue(new Error("db failure"));

    await expect(
      listServicesWithDeleteStateUseCase({ serviceRepository, invoiceRepository }),
    ).rejects.toThrow("db failure");
  });

  it("propagates invoice repository errors", async () => {
    const serviceRepository = createServiceRepositoryMock();
    const invoiceRepository = createInvoiceRepositoryMock();

    serviceRepository.list.mockResolvedValue([buildService()]);
    invoiceRepository.listStatusesByServiceIds.mockRejectedValue(new Error("db failure"));

    await expect(
      listServicesWithDeleteStateUseCase({ serviceRepository, invoiceRepository }),
    ).rejects.toThrow("db failure");
  });
});
