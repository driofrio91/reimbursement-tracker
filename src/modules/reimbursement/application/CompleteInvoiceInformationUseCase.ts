import { CompleteInvoiceInformationInput, Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";

export type CompleteInvoiceInformationUseCaseErrorCode = "INVOICE_NOT_FOUND" | "INVALID_STATUS";

export class CompleteInvoiceInformationUseCaseError extends Error {
  constructor(public readonly code: CompleteInvoiceInformationUseCaseErrorCode, message: string) {
    super(message);
    this.name = "CompleteInvoiceInformationUseCaseError";
  }
}

interface CompleteInvoiceInformationUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "getById" | "completeInformation">;
}

export async function completeInvoiceInformationUseCase(
  invoiceId: string,
  input: CompleteInvoiceInformationInput,
  dependencies: CompleteInvoiceInformationUseCaseDependencies,
): Promise<Invoice> {
  const invoice = await dependencies.invoiceRepository.getById(invoiceId);

  if (!invoice) {
    throw new CompleteInvoiceInformationUseCaseError("INVOICE_NOT_FOUND", "La factura seleccionada no existe.");
  }

  if (invoice.status === "PAID" || invoice.status === "REJECTED") {
    throw new CompleteInvoiceInformationUseCaseError(
      "INVALID_STATUS",
      "No se puede editar informacion de una factura finalizada.",
    );
  }

  const updatedInvoice = await dependencies.invoiceRepository.completeInformation(invoiceId, input);

  if (!updatedInvoice) {
    throw new CompleteInvoiceInformationUseCaseError("INVOICE_NOT_FOUND", "La factura seleccionada no existe.");
  }

  return updatedInvoice;
}
