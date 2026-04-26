import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { Service } from "@/modules/reimbursement/domain/Service";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export type SyncServiceStatusFromInvoicesUseCaseErrorCode = "SERVICE_NOT_FOUND";

export class SyncServiceStatusFromInvoicesUseCaseError extends Error {
  constructor(public readonly code: SyncServiceStatusFromInvoicesUseCaseErrorCode, message: string) {
    super(message);
    this.name = "SyncServiceStatusFromInvoicesUseCaseError";
  }
}

interface SyncServiceStatusFromInvoicesUseCaseDependencies {
  serviceRepository: Pick<ServiceRepository, "getById" | "updateStatus">;
  invoiceRepository: Pick<InvoiceRepository, "listByServiceId">;
}

export async function syncServiceStatusFromInvoicesUseCase(
  serviceId: string,
  dependencies: SyncServiceStatusFromInvoicesUseCaseDependencies,
): Promise<Service> {
  const service = await dependencies.serviceRepository.getById(serviceId);

  if (!service) {
    throw new SyncServiceStatusFromInvoicesUseCaseError("SERVICE_NOT_FOUND", "El servicio seleccionado no existe.");
  }

  const invoices = await dependencies.invoiceRepository.listByServiceId(serviceId);
  const derivedStatus = deriveServiceStatusFromInvoices(invoices);

  if (service.status === derivedStatus) {
    return service;
  }

  const updatedService = await dependencies.serviceRepository.updateStatus(serviceId, derivedStatus);

  if (!updatedService) {
    throw new SyncServiceStatusFromInvoicesUseCaseError("SERVICE_NOT_FOUND", "El servicio seleccionado no existe.");
  }

  return updatedService;
}

export function deriveServiceStatusFromInvoices(invoices: Invoice[]): Service["status"] {
  if (invoices.length === 0) {
    return "REGISTERED";
  }

  if (invoices.some((invoice) => invoice.status === "CREATED" || invoice.status === "INFORMATION_COMPLETED")) {
    return "REGISTERED";
  }

  if (invoices.every((invoice) => invoice.status === "PAID" || invoice.status === "REJECTED")) {
    return "REIMBURSED";
  }

  return "SUBMITTED";
}
