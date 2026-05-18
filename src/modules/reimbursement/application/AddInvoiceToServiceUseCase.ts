import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export type AddInvoiceToServiceUseCaseErrorCode = "SERVICE_NOT_FOUND" | "SERVICE_ALREADY_CLOSED";

export class AddInvoiceToServiceUseCaseError extends Error {
  constructor(public readonly code: AddInvoiceToServiceUseCaseErrorCode, message: string) {
    super(message);
    this.name = "AddInvoiceToServiceUseCaseError";
  }
}

interface AddInvoiceToServiceUseCaseDependencies {
  serviceRepository: Pick<ServiceRepository, "getById">;
  invoiceRepository: Pick<InvoiceRepository, "create">;
}

export interface AddInvoiceToServiceResult {
  createdInvoiceId: string;
}

export async function addInvoiceToServiceUseCase(
  serviceId: string,
  dependencies: AddInvoiceToServiceUseCaseDependencies,
): Promise<AddInvoiceToServiceResult> {
  const service = await dependencies.serviceRepository.getById(serviceId);

  if (!service) {
    throw new AddInvoiceToServiceUseCaseError("SERVICE_NOT_FOUND", "El servicio seleccionado no existe.");
  }

  if (service.status === "REIMBURSED") {
    throw new AddInvoiceToServiceUseCaseError(
      "SERVICE_ALREADY_CLOSED",
      "Este servicio ya esta cerrado. No se pueden anadir mas facturas.",
    );
  }

  const createdInvoice = await dependencies.invoiceRepository.create({
    serviceId: service.id,
    personId: service.personId,
    insurerId: service.insurerId,
    invoiceNumber: null,
    invoiceDate: null,
    invoiceBilledAmount: service.invoiceBilledAmount,
    invoiceExpectedAmount: service.invoiceExpectedAmount,
    currency: service.currency,
    issuerName: null,
    issuerTaxId: null,
    claimReference: null,
    status: "CREATED",
    paidAmount: null,
    paidAt: null,
    rejectionReason: null,
    notes: null,
    createdManually: true,
  });

  return {
    createdInvoiceId: createdInvoice.id,
  };
}
