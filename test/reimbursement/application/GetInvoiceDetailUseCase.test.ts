import { describe, expect, it } from "vitest";

import { getInvoiceDetailUseCase } from "@/modules/reimbursement/application/GetInvoiceDetailUseCase";

import { buildInvoice } from "../support/InvoiceTestBuilders";
import { createInvoiceRepositoryMock } from "../support/RepositoryMocks";

describe("GetInvoiceDetailUseCase", () => {
  it("returns invoice when it exists", async () => {
    const repository = createInvoiceRepositoryMock();
    const invoice = buildInvoice({ id: "invoice-42" });

    repository.getById.mockResolvedValue(invoice);

    const result = await getInvoiceDetailUseCase("invoice-42", {
      invoiceRepository: repository,
    });

    expect(result).toEqual(invoice);
  });

  it("returns null when invoice does not exist", async () => {
    const repository = createInvoiceRepositoryMock();

    repository.getById.mockResolvedValue(null);

    const result = await getInvoiceDetailUseCase("missing", {
      invoiceRepository: repository,
    });

    expect(result).toBeNull();
  });

  it("calls repository with same invoice id", async () => {
    const repository = createInvoiceRepositoryMock();

    repository.getById.mockResolvedValue(null);

    await getInvoiceDetailUseCase("invoice-10", {
      invoiceRepository: repository,
    });

    expect(repository.getById).toHaveBeenCalledWith("invoice-10");
    expect(repository.getById).toHaveBeenCalledTimes(1);
  });

  it("propagates repository errors", async () => {
    const repository = createInvoiceRepositoryMock();

    repository.getById.mockRejectedValue(new Error("db failure"));

    await expect(
      getInvoiceDetailUseCase("invoice-10", {
        invoiceRepository: repository,
      }),
    ).rejects.toThrow("db failure");
  });
});
