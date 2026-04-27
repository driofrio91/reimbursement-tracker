import { describe, expect, it } from "vitest";

import { completeInvoiceInformationUseCase } from "@/modules/reimbursement/application/CompleteInvoiceInformationUseCase";
import {
  CorrectInvoiceResolutionUseCaseError,
  correctInvoiceResolutionUseCase,
} from "@/modules/reimbursement/application/CorrectInvoiceResolutionUseCase";
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

  it("corrects final status from paid to rejected", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "PAID", paidAmount: 49.5, paidAt: new Date("2026-04-25T00:00:00.000Z") }));
    invoiceRepository.correctResolution.mockResolvedValue(buildInvoice({ status: "REJECTED", paidAmount: null, paidAt: null }));

    await correctInvoiceResolutionUseCase(
      "invoice-1",
      {
        toStatus: "REJECTED",
        correctionReason: "El portal confirmo que estaba denegada.",
        correctedByUserId: "user-1",
        rejectionReason: "Solicitud denegada",
      },
      { invoiceRepository },
    );

    expect(invoiceRepository.correctResolution).toHaveBeenCalledWith(
      "invoice-1",
      expect.objectContaining({
        toStatus: "REJECTED",
        correctionReason: "El portal confirmo que estaba denegada.",
      }),
    );
  });

  it("corrects final status from rejected to paid", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "REJECTED" }));
    invoiceRepository.correctResolution.mockResolvedValue(buildInvoice({ status: "PAID", paidAmount: 49.5 }));

    await correctInvoiceResolutionUseCase(
      "invoice-1",
      {
        toStatus: "PAID",
        correctionReason: "Se detecto abono efectivo en cuenta.",
        correctedByUserId: "user-1",
        paidAmount: 49.5,
        paidAt: new Date("2026-04-27T00:00:00.000Z"),
      },
      { invoiceRepository },
    );

    expect(invoiceRepository.correctResolution).toHaveBeenCalledWith(
      "invoice-1",
      expect.objectContaining({
        toStatus: "PAID",
        paidAmount: 49.5,
      }),
    );
  });

  it("rejects correction when invoice is not in final status", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED" }));

    await expect(
      correctInvoiceResolutionUseCase(
        "invoice-1",
        {
          toStatus: "PAID",
          correctionReason: "Intento invalido",
          correctedByUserId: "user-1",
          paidAmount: 49.5,
          paidAt: new Date("2026-04-27T00:00:00.000Z"),
        },
        { invoiceRepository },
      ),
    ).rejects.toBeInstanceOf(CorrectInvoiceResolutionUseCaseError);
  });

  it("rejects correction without correction reason", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    await expect(
      correctInvoiceResolutionUseCase(
        "invoice-1",
        {
          toStatus: "REJECTED",
          correctionReason: "",
          correctedByUserId: "user-1",
        },
        { invoiceRepository },
      ),
    ).rejects.toBeInstanceOf(CorrectInvoiceResolutionUseCaseError);
  });

  it("rejects correction when target final status equals current status", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "PAID" }));

    await expect(
      correctInvoiceResolutionUseCase(
        "invoice-1",
        {
          toStatus: "PAID",
          correctionReason: "No cambia estado",
          correctedByUserId: "user-1",
          paidAmount: 49.5,
          paidAt: new Date("2026-04-27T00:00:00.000Z"),
        },
        { invoiceRepository },
      ),
    ).rejects.toBeInstanceOf(CorrectInvoiceResolutionUseCaseError);
  });
});
