import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";

export type RegisterInvoiceClaimReferenceUseCaseErrorCode =
  | "INVOICE_NOT_FOUND"
  | "INVALID_STATUS"
  | "INCOMPLETE_INFORMATION";

export class RegisterInvoiceClaimReferenceUseCaseError extends Error {
  constructor(public readonly code: RegisterInvoiceClaimReferenceUseCaseErrorCode, message: string) {
    super(message);
    this.name = "RegisterInvoiceClaimReferenceUseCaseError";
  }
}

interface RegisterInvoiceClaimReferenceUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "getById" | "setClaimReference">;
}

export async function registerInvoiceClaimReferenceUseCase(
  invoiceId: string,
  claimReference: string,
  dependencies: RegisterInvoiceClaimReferenceUseCaseDependencies,
): Promise<Invoice> {
  const invoice = await dependencies.invoiceRepository.getById(invoiceId);

  if (!invoice) {
    throw new RegisterInvoiceClaimReferenceUseCaseError("INVOICE_NOT_FOUND", "La factura seleccionada no existe.");
  }

  if (invoice.status !== "INFORMATION_COMPLETED") {
    throw new RegisterInvoiceClaimReferenceUseCaseError(
      "INVALID_STATUS",
      "Solo puedes registrar referencia cuando la factura esta en informacion completada.",
    );
  }

  if (!invoice.invoiceNumber || !invoice.invoiceDate || !invoice.issuerName) {
    throw new RegisterInvoiceClaimReferenceUseCaseError(
      "INCOMPLETE_INFORMATION",
      "Completa primero la informacion de factura para registrar la referencia.",
    );
  }

  const updatedInvoice = await dependencies.invoiceRepository.setClaimReference(invoiceId, claimReference);

  if (!updatedInvoice) {
    throw new RegisterInvoiceClaimReferenceUseCaseError(
      "INVALID_STATUS",
      "No se pudo guardar porque la factura cambio de estado. Recarga la pagina e intentalo de nuevo.",
    );
  }

  return updatedInvoice;
}
