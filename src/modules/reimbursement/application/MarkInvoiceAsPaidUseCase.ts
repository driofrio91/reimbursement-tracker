import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { PersonAnnualReimbursementLimitRepository } from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimitRepository";
import { applyInvoiceAnnualLimitDeltaUseCase } from "@/modules/reimbursement/application/ApplyInvoiceAnnualLimitDeltaUseCase";

export type MarkInvoiceAsPaidUseCaseErrorCode =
  | "INVOICE_NOT_FOUND"
  | "INVALID_STATUS"
  | "INVALID_PAID_AMOUNT"
  | "MISSING_INVOICE_PERSON";

export class MarkInvoiceAsPaidUseCaseError extends Error {
  constructor(public readonly code: MarkInvoiceAsPaidUseCaseErrorCode, message: string) {
    super(message);
    this.name = "MarkInvoiceAsPaidUseCaseError";
  }
}

interface MarkInvoiceAsPaidUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "getById" | "markAsPaid">;
  annualLimitRepository: Pick<PersonAnnualReimbursementLimitRepository, "applyDelta">;
}

export async function markInvoiceAsPaidUseCase(
  invoiceId: string,
  paidAmount: number,
  paidAt: Date,
  dependencies: MarkInvoiceAsPaidUseCaseDependencies,
): Promise<Invoice> {
  if (paidAmount <= 0) {
    throw new MarkInvoiceAsPaidUseCaseError("INVALID_PAID_AMOUNT", "El importe pagado debe ser mayor que cero.");
  }

  const invoice = await dependencies.invoiceRepository.getById(invoiceId);

  if (!invoice) {
    throw new MarkInvoiceAsPaidUseCaseError("INVOICE_NOT_FOUND", "La factura seleccionada no existe.");
  }

  if (invoice.status !== "CLAIM_REFERENCE_COMPLETED") {
    throw new MarkInvoiceAsPaidUseCaseError(
      "INVALID_STATUS",
      "La factura debe tener referencia registrada para poder marcarse como pagada.",
    );
  }

  if (!invoice.insuranceHolderPersonId) {
    throw new MarkInvoiceAsPaidUseCaseError(
      "MISSING_INVOICE_PERSON",
      "Debes revisar y guardar la persona imputada antes de marcar la factura como pagada.",
    );
  }

  const updatedInvoice = await dependencies.invoiceRepository.markAsPaid(invoiceId, paidAmount, paidAt);

  if (!updatedInvoice) {
    throw new MarkInvoiceAsPaidUseCaseError(
      "INVALID_STATUS",
      "No se pudo guardar porque la factura cambio de estado. Recarga la pagina e intentalo de nuevo.",
    );
  }

  await applyInvoiceAnnualLimitDeltaUseCase(invoice, updatedInvoice, {
    annualLimitRepository: dependencies.annualLimitRepository,
  });

  return updatedInvoice;
}
