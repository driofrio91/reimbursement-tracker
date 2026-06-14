import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { PersonAnnualReimbursementLimitRepository } from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimitRepository";
import { applyInvoiceAnnualLimitDeltaUseCase } from "@/modules/reimbursement/application/ApplyInvoiceAnnualLimitDeltaUseCase";

export type MarkInvoiceAsRejectedUseCaseErrorCode = "INVOICE_NOT_FOUND" | "INVALID_STATUS";

export class MarkInvoiceAsRejectedUseCaseError extends Error {
  constructor(public readonly code: MarkInvoiceAsRejectedUseCaseErrorCode, message: string) {
    super(message);
    this.name = "MarkInvoiceAsRejectedUseCaseError";
  }
}

interface MarkInvoiceAsRejectedUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "getById" | "markAsRejected">;
  annualLimitRepository: Pick<PersonAnnualReimbursementLimitRepository, "applyDelta">;
}

export async function markInvoiceAsRejectedUseCase(
  invoiceId: string,
  rejectionReason: string | undefined,
  dependencies: MarkInvoiceAsRejectedUseCaseDependencies,
): Promise<Invoice> {
  const invoice = await dependencies.invoiceRepository.getById(invoiceId);

  if (!invoice) {
    throw new MarkInvoiceAsRejectedUseCaseError("INVOICE_NOT_FOUND", "La factura seleccionada no existe.");
  }

  if (invoice.status !== "CLAIM_REFERENCE_COMPLETED") {
    throw new MarkInvoiceAsRejectedUseCaseError(
      "INVALID_STATUS",
      "La factura debe tener referencia registrada para poder marcarse como rechazada.",
    );
  }

  const updatedInvoice = await dependencies.invoiceRepository.markAsRejected(invoiceId, rejectionReason);

  if (!updatedInvoice) {
    throw new MarkInvoiceAsRejectedUseCaseError(
      "INVALID_STATUS",
      "No se pudo guardar porque la factura cambio de estado. Recarga la pagina e intentalo de nuevo.",
    );
  }

  await applyInvoiceAnnualLimitDeltaUseCase(invoice, updatedInvoice, {
    annualLimitRepository: dependencies.annualLimitRepository,
  });

  return updatedInvoice;
}
