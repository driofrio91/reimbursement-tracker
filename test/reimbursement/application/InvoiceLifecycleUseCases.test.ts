import { describe, expect, it } from "vitest";

import { completeInvoiceInformationUseCase } from "@/modules/reimbursement/application/CompleteInvoiceInformationUseCase";
import { markInvoiceAsPaidUseCase } from "@/modules/reimbursement/application/MarkInvoiceAsPaidUseCase";
import { markInvoiceAsRejectedUseCase } from "@/modules/reimbursement/application/MarkInvoiceAsRejectedUseCase";
import { registerInvoiceClaimReferenceUseCase } from "@/modules/reimbursement/application/RegisterInvoiceClaimReferenceUseCase";

import { createInvoiceRepositoryMock } from "../support/RepositoryMocks";
import { buildInvoice } from "../support/InvoiceTestBuilders";

describe("Invoice lifecycle use cases", () => {
  it("completes invoice information", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "CREATED" }));
    invoiceRepository.completeInformation.mockResolvedValue(buildInvoice({ status: "INFORMATION_COMPLETED" }));

    await completeInvoiceInformationUseCase(
      "invoice-1",
      {
        invoiceNumber: "F-2026-001",
        invoiceDate: new Date("2026-04-25T00:00:00.000Z"),
        issuerName: "Clinica Central",
      },
      { invoiceRepository },
    );

    expect(invoiceRepository.completeInformation).toHaveBeenCalled();
  });

  it("registers a claim reference only for invoices with completed info", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(
      buildInvoice({
        status: "INFORMATION_COMPLETED",
        invoiceNumber: "F-2026-001",
        invoiceDate: new Date("2026-04-25T00:00:00.000Z"),
        issuerName: "Clinica Central",
      }),
    );
    invoiceRepository.setClaimReference.mockResolvedValue(buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED" }));

    await registerInvoiceClaimReferenceUseCase("invoice-1", "REF-001", { invoiceRepository });

    expect(invoiceRepository.setClaimReference).toHaveBeenCalledWith("invoice-1", "REF-001");
  });

  it("marks as paid with a positive amount", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED" }));
    invoiceRepository.markAsPaid.mockResolvedValue(buildInvoice({ status: "PAID", paidAmount: 49.5 }));

    await markInvoiceAsPaidUseCase("invoice-1", 49.5, new Date("2026-04-25T00:00:00.000Z"), {
      invoiceRepository,
    });

    expect(invoiceRepository.markAsPaid).toHaveBeenCalled();
  });

  it("marks as rejected from claim stage", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED" }));
    invoiceRepository.markAsRejected.mockResolvedValue(buildInvoice({ status: "REJECTED" }));

    await markInvoiceAsRejectedUseCase("invoice-1", "Falta documento", { invoiceRepository });

    expect(invoiceRepository.markAsRejected).toHaveBeenCalledWith("invoice-1", "Falta documento");
  });
});
