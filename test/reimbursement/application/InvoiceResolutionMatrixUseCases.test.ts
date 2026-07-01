import { describe, expect, it } from "vitest";

import { correctInvoiceResolutionUseCase } from "@/modules/reimbursement/application/CorrectInvoiceResolutionUseCase";
import { markInvoiceAsPaidUseCase } from "@/modules/reimbursement/application/MarkInvoiceAsPaidUseCase";
import { markInvoiceAsRejectedUseCase } from "@/modules/reimbursement/application/MarkInvoiceAsRejectedUseCase";
import { InvoiceStatus } from "@/modules/reimbursement/domain/Invoice";

import { buildInvoice } from "../support/InvoiceTestBuilders";
import {
  createInvoiceRepositoryMock,
  createPersonAnnualReimbursementLimitRepositoryMock,
} from "../support/RepositoryMocks";

const invoiceDate = new Date("2026-04-25T00:00:00.000Z");
const paidAt = new Date("2026-04-27T00:00:00.000Z");

describe("Invoice resolution matrix use cases", () => {
  it("allows claim-reference-completed invoices to be marked as paid and applies a positive annual limit delta", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(
      buildInvoice({
        status: "CLAIM_REFERENCE_COMPLETED",
        insuranceHolderPersonId: "person-1",
        insurerId: "insurer-1",
        invoiceDate,
      }),
    );
    invoiceRepository.markAsPaid.mockResolvedValue(
      buildInvoice({
        status: "PAID",
        insuranceHolderPersonId: "person-1",
        insurerId: "insurer-1",
        invoiceDate,
        paidAmount: 49.5,
        paidAt,
      }),
    );

    await markInvoiceAsPaidUseCase("invoice-1", 49.5, paidAt, { invoiceRepository, annualLimitRepository });

    expect(invoiceRepository.markAsPaid).toHaveBeenCalledWith("invoice-1", 49.5, paidAt);
    expect(annualLimitRepository.applyDelta).toHaveBeenCalledWith("person-1", "insurer-1", 2026, 49.5);
  });

  it("allows claim-reference-completed invoices to be marked as rejected without applying a positive annual limit delta", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(
      buildInvoice({
        status: "CLAIM_REFERENCE_COMPLETED",
        insuranceHolderPersonId: "person-1",
        insurerId: "insurer-1",
        invoiceDate,
      }),
    );
    invoiceRepository.markAsRejected.mockResolvedValue(
      buildInvoice({
        status: "REJECTED",
        insuranceHolderPersonId: "person-1",
        insurerId: "insurer-1",
        invoiceDate,
        rejectionReason: "Missing document",
      }),
    );

    await markInvoiceAsRejectedUseCase("invoice-1", "Missing document", { invoiceRepository, annualLimitRepository });

    expect(invoiceRepository.markAsRejected).toHaveBeenCalledWith("invoice-1", "Missing document");
    expect(annualLimitRepository.applyDelta).not.toHaveBeenCalled();
  });

  it("allows correcting paid invoices to rejected and applies a negative annual limit delta", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(
      buildInvoice({
        status: "PAID",
        insuranceHolderPersonId: "person-1",
        insurerId: "insurer-1",
        invoiceDate,
        paidAmount: 49.5,
        paidAt,
      }),
    );
    invoiceRepository.correctResolution.mockResolvedValue(
      buildInvoice({
        status: "REJECTED",
        insuranceHolderPersonId: "person-1",
        insurerId: "insurer-1",
        invoiceDate,
        paidAmount: null,
        paidAt: null,
        rejectionReason: "Denied by insurer",
      }),
    );

    await correctInvoiceResolutionUseCase(
      "invoice-1",
      {
        toStatus: "REJECTED",
        correctionReason: "The insurer confirmed this invoice was denied.",
        correctedByUserId: "user-1",
        rejectionReason: "Denied by insurer",
      },
      { invoiceRepository, annualLimitRepository },
    );

    expect(invoiceRepository.correctResolution).toHaveBeenCalledWith(
      "invoice-1",
      expect.objectContaining({ toStatus: "REJECTED" }),
    );
    expect(annualLimitRepository.applyDelta).toHaveBeenCalledWith("person-1", "insurer-1", 2026, -49.5);
  });

  it("allows correcting rejected invoices to paid and applies a positive annual limit delta", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(
      buildInvoice({
        status: "REJECTED",
        insuranceHolderPersonId: "person-1",
        insurerId: "insurer-1",
        invoiceDate,
        rejectionReason: "Initially denied",
      }),
    );
    invoiceRepository.correctResolution.mockResolvedValue(
      buildInvoice({
        status: "PAID",
        insuranceHolderPersonId: "person-1",
        insurerId: "insurer-1",
        invoiceDate,
        paidAmount: 49.5,
        paidAt,
      }),
    );

    await correctInvoiceResolutionUseCase(
      "invoice-1",
      {
        toStatus: "PAID",
        correctionReason: "The insurer later confirmed payment.",
        correctedByUserId: "user-1",
        paidAmount: 49.5,
        paidAt,
      },
      { invoiceRepository, annualLimitRepository },
    );

    expect(invoiceRepository.correctResolution).toHaveBeenCalledWith(
      "invoice-1",
      expect.objectContaining({ toStatus: "PAID", paidAmount: 49.5, paidAt }),
    );
    expect(annualLimitRepository.applyDelta).toHaveBeenCalledWith("person-1", "insurer-1", 2026, 49.5);
  });

  it.each<InvoiceStatus>(["CREATED", "INFORMATION_COMPLETED", "PAID", "REJECTED"])(
    "blocks marking %s invoices as paid",
    async (status) => {
      const invoiceRepository = createInvoiceRepositoryMock();
      const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

      invoiceRepository.getById.mockResolvedValue(buildInvoice({ status }));

      await expect(
        markInvoiceAsPaidUseCase("invoice-1", 49.5, paidAt, { invoiceRepository, annualLimitRepository }),
      ).rejects.toMatchObject({ code: "INVALID_STATUS" });

      expect(invoiceRepository.markAsPaid).not.toHaveBeenCalled();
      expect(annualLimitRepository.applyDelta).not.toHaveBeenCalled();
    },
  );

  it("blocks marking paid when the invoice has no insurance holder", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(
      buildInvoice({ status: "CLAIM_REFERENCE_COMPLETED", insuranceHolderPersonId: null, insurerId: "insurer-1", invoiceDate }),
    );

    await expect(
      markInvoiceAsPaidUseCase("invoice-1", 49.5, paidAt, { invoiceRepository, annualLimitRepository }),
    ).rejects.toMatchObject({ code: "MISSING_INVOICE_PERSON" });

    expect(invoiceRepository.markAsPaid).not.toHaveBeenCalled();
    expect(annualLimitRepository.applyDelta).not.toHaveBeenCalled();
  });

  it.each([0, -1])("blocks marking paid with amount %s", async (paidAmount) => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    await expect(
      markInvoiceAsPaidUseCase("invoice-1", paidAmount, paidAt, { invoiceRepository, annualLimitRepository }),
    ).rejects.toMatchObject({ code: "INVALID_PAID_AMOUNT" });

    expect(invoiceRepository.getById).not.toHaveBeenCalled();
    expect(invoiceRepository.markAsPaid).not.toHaveBeenCalled();
    expect(annualLimitRepository.applyDelta).not.toHaveBeenCalled();
  });

  it.each<InvoiceStatus>(["CREATED", "INFORMATION_COMPLETED", "PAID", "REJECTED"])(
    "blocks marking %s invoices as rejected",
    async (status) => {
      const invoiceRepository = createInvoiceRepositoryMock();
      const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

      invoiceRepository.getById.mockResolvedValue(
        buildInvoice({ status, rejectionReason: status === "REJECTED" ? "Already denied" : null }),
      );

      await expect(
        markInvoiceAsRejectedUseCase("invoice-1", "Already denied", { invoiceRepository, annualLimitRepository }),
      ).rejects.toMatchObject({ code: "INVALID_STATUS" });

      expect(invoiceRepository.markAsRejected).not.toHaveBeenCalled();
      expect(annualLimitRepository.applyDelta).not.toHaveBeenCalled();
    },
  );

  it.each<InvoiceStatus>(["CREATED", "INFORMATION_COMPLETED", "CLAIM_REFERENCE_COMPLETED"])(
    "blocks correcting unresolved %s invoices",
    async (status) => {
      const invoiceRepository = createInvoiceRepositoryMock();
      const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

      invoiceRepository.getById.mockResolvedValue(buildInvoice({ status }));

      await expect(
        correctInvoiceResolutionUseCase(
          "invoice-1",
          {
            toStatus: "PAID",
            correctionReason: "Attempted correction before final resolution.",
            correctedByUserId: "user-1",
            paidAmount: 49.5,
            paidAt,
          },
          { invoiceRepository, annualLimitRepository },
        ),
      ).rejects.toMatchObject({ code: "INVALID_STATUS" });

      expect(invoiceRepository.correctResolution).not.toHaveBeenCalled();
      expect(annualLimitRepository.applyDelta).not.toHaveBeenCalled();
    },
  );

  it.each([
    { currentStatus: "PAID", toStatus: "PAID" },
    { currentStatus: "REJECTED", toStatus: "REJECTED" },
  ] as const)("blocks correcting $currentStatus invoices to the same final status", async ({ currentStatus, toStatus }) => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: currentStatus }));

    await expect(
      correctInvoiceResolutionUseCase(
        "invoice-1",
        {
          toStatus,
          correctionReason: "No real status change.",
          correctedByUserId: "user-1",
          paidAmount: toStatus === "PAID" ? 49.5 : undefined,
          paidAt: toStatus === "PAID" ? paidAt : undefined,
        },
        { invoiceRepository, annualLimitRepository },
      ),
    ).rejects.toMatchObject({ code: "SAME_FINAL_STATUS" });

    expect(invoiceRepository.correctResolution).not.toHaveBeenCalled();
    expect(annualLimitRepository.applyDelta).not.toHaveBeenCalled();
  });

  it("blocks correction without a reason before reading the invoice", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    await expect(
      correctInvoiceResolutionUseCase(
        "invoice-1",
        { toStatus: "REJECTED", correctionReason: " ", correctedByUserId: "user-1" },
        { invoiceRepository, annualLimitRepository },
      ),
    ).rejects.toMatchObject({ code: "MISSING_CORRECTION_REASON" });

    expect(invoiceRepository.getById).not.toHaveBeenCalled();
    expect(invoiceRepository.correctResolution).not.toHaveBeenCalled();
    expect(annualLimitRepository.applyDelta).not.toHaveBeenCalled();
  });

  it.each([
    { paidAmount: undefined, paidAt, label: "amount" },
    { paidAmount: 49.5, paidAt: undefined, label: "date" },
  ])("blocks correction to paid without $label", async ({ paidAmount, paidAt }) => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "REJECTED" }));

    await expect(
      correctInvoiceResolutionUseCase(
        "invoice-1",
        {
          toStatus: "PAID",
          correctionReason: "Payment data is incomplete.",
          correctedByUserId: "user-1",
          paidAmount,
          paidAt,
        },
        { invoiceRepository, annualLimitRepository },
      ),
    ).rejects.toMatchObject({ code: "MISSING_PAID_DATA" });

    expect(invoiceRepository.correctResolution).not.toHaveBeenCalled();
    expect(annualLimitRepository.applyDelta).not.toHaveBeenCalled();
  });

  it.each([0, -1])("blocks correction to paid with amount %s", async (paidAmount) => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getById.mockResolvedValue(buildInvoice({ status: "REJECTED" }));

    await expect(
      correctInvoiceResolutionUseCase(
        "invoice-1",
        {
          toStatus: "PAID",
          correctionReason: "The insurer later confirmed payment.",
          correctedByUserId: "user-1",
          paidAmount,
          paidAt,
        },
        { invoiceRepository, annualLimitRepository },
      ),
    ).rejects.toMatchObject({ code: "INVALID_PAID_AMOUNT" });

    expect(invoiceRepository.correctResolution).not.toHaveBeenCalled();
    expect(annualLimitRepository.applyDelta).not.toHaveBeenCalled();
  });
});
