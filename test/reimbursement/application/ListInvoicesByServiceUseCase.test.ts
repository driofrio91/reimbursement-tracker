import { describe, expect, it } from "vitest";

import { listInvoicesByServiceUseCase } from "@/modules/reimbursement/application/ListInvoicesByServiceUseCase";

import { createInvoiceRepositoryMock } from "../support/RepositoryMocks";
import { buildInvoice } from "../support/InvoiceTestBuilders";

describe("ListInvoicesByServiceUseCase", () => {
  it("returns invoices from repository", async () => {
    const repository = createInvoiceRepositoryMock();
    const invoices = [buildInvoice({ id: "invoice-1" }), buildInvoice({ id: "invoice-2" })];

    repository.listByServiceId.mockResolvedValue(invoices);

    const result = await listInvoicesByServiceUseCase("service-1", {
      invoiceRepository: repository,
    });

    expect(result).toEqual(invoices);
  });

  it("returns an empty array when repository has no invoices", async () => {
    const repository = createInvoiceRepositoryMock();

    repository.listByServiceId.mockResolvedValue([]);

    const result = await listInvoicesByServiceUseCase("service-1", {
      invoiceRepository: repository,
    });

    expect(result).toEqual([]);
  });

  it("calls repository with same service id", async () => {
    const repository = createInvoiceRepositoryMock();

    repository.listByServiceId.mockResolvedValue([]);

    await listInvoicesByServiceUseCase("service-42", {
      invoiceRepository: repository,
    });

    expect(repository.listByServiceId).toHaveBeenCalledWith("service-42");
    expect(repository.listByServiceId).toHaveBeenCalledTimes(1);
  });

  it("propagates repository errors", async () => {
    const repository = createInvoiceRepositoryMock();

    repository.listByServiceId.mockRejectedValue(new Error("db failure"));

    await expect(
      listInvoicesByServiceUseCase("service-1", {
        invoiceRepository: repository,
      }),
    ).rejects.toThrow("db failure");
  });
});
