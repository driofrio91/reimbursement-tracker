import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";

export type AssignInvoicePersonUseCaseErrorCode = "INVOICE_NOT_FOUND" | "INVALID_STATUS" | "INVALID_PERSON";

export class AssignInvoicePersonUseCaseError extends Error {
  constructor(public readonly code: AssignInvoicePersonUseCaseErrorCode, message: string) {
    super(message);
    this.name = "AssignInvoicePersonUseCaseError";
  }
}

interface AssignInvoicePersonUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "getById" | "setPerson">;
}

export async function assignInvoicePersonUseCase(
  invoiceId: string,
  personId: string,
  dependencies: AssignInvoicePersonUseCaseDependencies,
): Promise<Invoice> {
  if (!personId.trim()) {
    throw new AssignInvoicePersonUseCaseError("INVALID_PERSON", "Debes seleccionar una persona para imputar la factura.");
  }

  const invoice = await dependencies.invoiceRepository.getById(invoiceId);

  if (!invoice) {
    throw new AssignInvoicePersonUseCaseError("INVOICE_NOT_FOUND", "La factura seleccionada no existe.");
  }

  if (invoice.status === "PAID") {
    throw new AssignInvoicePersonUseCaseError("INVALID_STATUS", "No puedes cambiar la persona de una factura pagada.");
  }

  const updatedInvoice = await dependencies.invoiceRepository.setPerson(invoiceId, personId);

  if (!updatedInvoice) {
    throw new AssignInvoicePersonUseCaseError(
      "INVALID_STATUS",
      "No se pudo guardar porque la factura cambio de estado. Recarga la pagina e intentalo de nuevo.",
    );
  }

  return updatedInvoice;
}
