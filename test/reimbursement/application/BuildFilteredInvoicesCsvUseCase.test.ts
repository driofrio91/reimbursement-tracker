import { describe, expect, it } from "vitest";

import {
  BuildFilteredInvoicesCsvUseCaseError,
  buildFilteredInvoicesCsvUseCase,
} from "@/modules/reimbursement/application/BuildFilteredInvoicesCsvUseCase";

import { buildInvoice } from "../support/InvoiceTestBuilders";
import { createInvoiceRepositoryMock } from "../support/RepositoryMocks";

describe("BuildFilteredInvoicesCsvUseCase", () => {
  it("builds csv for all invoices returned by the active search filters", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    invoiceRepository.search.mockResolvedValue([
      buildInvoice({ id: "invoice-1", status: "CREATED", invoiceBilledAmount: 55 }),
      buildInvoice({ id: "invoice-2", status: "PAID", invoiceBilledAmount: 33.4 }),
    ]);

    const csv = await buildFilteredInvoicesCsvUseCase(
      {
        invoiceNumber: "F-2026",
        claimReference: "REF",
        status: "PAID",
      },
      {
        invoiceRepository,
        now: () => new Date("2026-05-16T14:07:00"),
      },
    );

    expect(invoiceRepository.search).toHaveBeenCalledWith({
      invoiceNumber: "F-2026",
      claimReference: "REF",
      status: "PAID",
    });
    expect(csv.content).toBe(
      "\uFEFFTRATAMIENTO;IMPORTE DE LA FACTURA;TITULAR;FECHA FACTURA;SOLICITADA\r\n" +
        "FISIOTERAPIA - CERVICAL;55,00;;;\r\n" +
        "FISIOTERAPIA - CERVICAL;33,40;;;",
    );
    expect(csv.filename).toBe("facturas-filtradas-20260516-1407.csv");
  });

  it("rejects export when the search result is empty", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    invoiceRepository.search.mockResolvedValue([]);

    await expect(buildFilteredInvoicesCsvUseCase({}, { invoiceRepository })).rejects.toMatchObject({
      code: "NO_INVOICES",
    });
    await expect(buildFilteredInvoicesCsvUseCase({}, { invoiceRepository })).rejects.toBeInstanceOf(
      BuildFilteredInvoicesCsvUseCaseError,
    );
  });
});
