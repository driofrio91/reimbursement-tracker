import { CorrectInvoiceResolutionInput, Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";

export type CorrectInvoiceResolutionUseCaseErrorCode =
  | "INVOICE_NOT_FOUND"
  | "INVALID_STATUS"
  | "SAME_FINAL_STATUS"
  | "MISSING_CORRECTION_REASON"
  | "MISSING_PAID_DATA";

export class CorrectInvoiceResolutionUseCaseError extends Error {
  constructor(public readonly code: CorrectInvoiceResolutionUseCaseErrorCode, message: string) {
    super(message);
    this.name = "CorrectInvoiceResolutionUseCaseError";
  }
}

interface CorrectInvoiceResolutionUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "getById" | "correctResolution">;
}

export async function correctInvoiceResolutionUseCase(
  invoiceId: string,
  input: CorrectInvoiceResolutionInput,
  dependencies: CorrectInvoiceResolutionUseCaseDependencies,
): Promise<Invoice> {
  if (!input.correctionReason.trim()) {
    throw new CorrectInvoiceResolutionUseCaseError("MISSING_CORRECTION_REASON", "Debes indicar un motivo de correccion.");
  }

  const invoice = await dependencies.invoiceRepository.getById(invoiceId);

  if (!invoice) {
    throw new CorrectInvoiceResolutionUseCaseError("INVOICE_NOT_FOUND", "La factura seleccionada no existe.");
  }

  if (invoice.status !== "PAID" && invoice.status !== "REJECTED") {
    throw new CorrectInvoiceResolutionUseCaseError(
      "INVALID_STATUS",
      "Solo se puede corregir el estado final de una factura ya resuelta.",
    );
  }

  if (invoice.status === input.toStatus) {
    throw new CorrectInvoiceResolutionUseCaseError(
      "SAME_FINAL_STATUS",
      "La correccion debe cambiar la factura a un estado final diferente.",
    );
  }

  if (input.toStatus === "PAID" && (typeof input.paidAmount !== "number" || Number.isNaN(input.paidAmount) || !input.paidAt)) {
    throw new CorrectInvoiceResolutionUseCaseError(
      "MISSING_PAID_DATA",
      "Para corregir a pagada debes indicar importe y fecha de pago.",
    );
  }

  const correctedInvoice = await dependencies.invoiceRepository.correctResolution(invoiceId, input);

  if (!correctedInvoice) {
    throw new CorrectInvoiceResolutionUseCaseError("INVOICE_NOT_FOUND", "La factura seleccionada no existe.");
  }

  return correctedInvoice;
}
