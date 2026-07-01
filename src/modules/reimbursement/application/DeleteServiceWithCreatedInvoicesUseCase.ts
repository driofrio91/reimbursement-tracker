import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { evaluateServiceDeleteEligibility } from "@/modules/reimbursement/domain/ServiceDeletePolicy";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export type DeleteServiceWithCreatedInvoicesUseCaseErrorCode =
  | "SERVICE_NOT_FOUND"
  | "SERVICE_NOT_DELETABLE"
  | "SERVICE_STATE_CHANGED";

export class DeleteServiceWithCreatedInvoicesUseCaseError extends Error {
  constructor(public readonly code: DeleteServiceWithCreatedInvoicesUseCaseErrorCode, message: string) {
    super(message);
    this.name = "DeleteServiceWithCreatedInvoicesUseCaseError";
  }
}

interface DeleteServiceWithCreatedInvoicesUseCaseDependencies {
  serviceRepository: Pick<ServiceRepository, "getById" | "deleteWithInvoicesInCreatedStatusOnly">;
  invoiceRepository: Pick<InvoiceRepository, "listByServiceId">;
}

export async function deleteServiceWithCreatedInvoicesUseCase(
  serviceId: string,
  dependencies: DeleteServiceWithCreatedInvoicesUseCaseDependencies,
): Promise<void> {
  const service = await dependencies.serviceRepository.getById(serviceId);

  if (!service) {
    throw new DeleteServiceWithCreatedInvoicesUseCaseError("SERVICE_NOT_FOUND", "El servicio ya no existe o fue eliminado.");
  }

  const invoices = await dependencies.invoiceRepository.listByServiceId(serviceId);
  const { canDelete } = evaluateServiceDeleteEligibility(invoices);

  if (!canDelete) {
    throw new DeleteServiceWithCreatedInvoicesUseCaseError(
      "SERVICE_NOT_DELETABLE",
      "Solo se puede eliminar un servicio si todas sus facturas estan en estado Creada.",
    );
  }

  const deleted = await dependencies.serviceRepository.deleteWithInvoicesInCreatedStatusOnly(serviceId);

  if (!deleted) {
    throw new DeleteServiceWithCreatedInvoicesUseCaseError(
      "SERVICE_STATE_CHANGED",
      "La accion ya no esta disponible porque el estado ha cambiado.",
    );
  }
}
