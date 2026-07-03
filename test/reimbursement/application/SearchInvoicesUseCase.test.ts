import { describe, expect, it } from "vitest";

import { searchInvoicesUseCase, searchPaginatedInvoicesUseCase } from "@/modules/reimbursement/application/SearchInvoicesUseCase";

import { buildInvoice } from "../support/InvoiceTestBuilders";
import { createInvoiceRepositoryMock } from "../support/RepositoryMocks";

describe("SearchInvoicesUseCase", () => {
  it("returns invoices from repository", async () => {
    const repository = createInvoiceRepositoryMock();
    const invoices = [buildInvoice({ id: "invoice-1" }), buildInvoice({ id: "invoice-2" })];

    repository.search.mockResolvedValue(invoices);

    const result = await searchInvoicesUseCase(
      {
        invoiceNumber: "F-2026",
        claimReference: "CLM",
        status: "PAID",
      },
      {
        invoiceRepository: repository,
      },
    );

    expect(result).toEqual(invoices);
  });

  it("calls repository with same filters", async () => {
    const repository = createInvoiceRepositoryMock();

    repository.search.mockResolvedValue([]);

    await searchInvoicesUseCase(
      {
        invoiceNumber: "F-001",
        claimReference: "REF-01",
        status: "REJECTED",
      },
      {
        invoiceRepository: repository,
      },
    );

    expect(repository.search).toHaveBeenCalledWith({
      invoiceNumber: "F-001",
      claimReference: "REF-01",
      status: "REJECTED",
    });
    expect(repository.search).toHaveBeenCalledTimes(1);
  });

  it("propagates repository errors", async () => {
    const repository = createInvoiceRepositoryMock();

    repository.search.mockRejectedValue(new Error("db failure"));

    await expect(
      searchInvoicesUseCase(
        {
          status: "CREATED",
        },
        {
          invoiceRepository: repository,
        },
      ),
    ).rejects.toThrow("db failure");
  });

  it("searches invoices with normalized pagination", async () => {
    const repository = createInvoiceRepositoryMock();
    const invoice = buildInvoice({ id: "invoice-1" });
    const paginatedResult = {
      items: [invoice],
      pagination: {
        page: 2,
        pageSize: 25,
        totalItems: 26,
        totalPages: 2,
        hasPreviousPage: true,
        hasNextPage: false,
      },
    };

    repository.searchPaginated.mockResolvedValue(paginatedResult);

    const result = await searchPaginatedInvoicesUseCase(
      { status: "PAID" },
      { page: 2, pageSize: 25 },
      { invoiceRepository: repository },
    );

    expect(result).toEqual(paginatedResult);
    expect(repository.searchPaginated).toHaveBeenCalledWith(
      { status: "PAID" },
      { page: 2, pageSize: 25, skip: 25, take: 25 },
    );
  });
});
