import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export type DeleteCreatedInvoiceUseCaseErrorCode =
  | "INVOICE_NOT_FOUND"
  | "SERVICE_NOT_FOUND"
  | "SERVICE_ALREADY_CLOSED"
  | "INVOICE_NOT_DELETABLE"
  | "INVOICE_STATE_CHANGED";

export class DeleteCreatedInvoiceUseCaseError extends Error {
  constructor(public readonly code: DeleteCreatedInvoiceUseCaseErrorCode, message: string) {
    super(message);
    this.name = "DeleteCreatedInvoiceUseCaseError";
  }
}

interface DeleteCreatedInvoiceUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "getById" | "deleteDraftOrInformationCompleted">;
  serviceRepository: Pick<ServiceRepository, "getById">;
}

export async function deleteCreatedInvoiceUseCase(
  invoiceId: string,
  dependencies: DeleteCreatedInvoiceUseCaseDependencies,
): Promise<void> {
  const invoice = await dependencies.invoiceRepository.getById(invoiceId);

  if (!invoice) {
    throw new DeleteCreatedInvoiceUseCaseError("INVOICE_NOT_FOUND", "La factura ya no existe o fue eliminada.");
  }

  const service = await dependencies.serviceRepository.getById(invoice.serviceId);

  if (!service) {
    throw new DeleteCreatedInvoiceUseCaseError("SERVICE_NOT_FOUND", "El servicio asociado ya no existe.");
  }

  if (service.status === "REIMBURSED") {
    throw new DeleteCreatedInvoiceUseCaseError(
      "SERVICE_ALREADY_CLOSED",
      "Este servicio ya esta cerrado. No se puede modificar su estructura de facturas.",
    );
  }

  if (invoice.status !== "CREATED" && invoice.status !== "INFORMATION_COMPLETED") {
    throw new DeleteCreatedInvoiceUseCaseError(
      "INVOICE_NOT_DELETABLE",
      "Solo se pueden eliminar facturas en estado Creada o Informacion completada.",
    );
  }

  const deleted = await dependencies.invoiceRepository.deleteDraftOrInformationCompleted(invoiceId);

  if (!deleted) {
    throw new DeleteCreatedInvoiceUseCaseError(
      "INVOICE_STATE_CHANGED",
      "La factura ya cambio de estado y no se puede eliminar.",
    );
  }
}
