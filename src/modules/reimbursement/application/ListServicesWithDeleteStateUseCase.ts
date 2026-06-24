import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { Service } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";
import { evaluateServiceDeleteEligibility } from "@/modules/reimbursement/domain/ServiceDeletePolicy";

interface ListServicesWithDeleteStateUseCaseDependencies {
  serviceRepository: Pick<ServiceRepository, "list">;
  invoiceRepository: Pick<InvoiceRepository, "listStatusesByServiceIds">;
}

export interface ServiceWithDeleteState {
  service: Service;
  canDelete: boolean;
  deleteBlockedReason: string;
}

export async function listServicesWithDeleteStateUseCase(
  dependencies: ListServicesWithDeleteStateUseCaseDependencies,
): Promise<ServiceWithDeleteState[]> {
  const services = await dependencies.serviceRepository.list();

  if (services.length === 0) {
    return [];
  }

  const serviceIds = services.map((service) => service.id);
  const invoiceStatusesByServiceId = await dependencies.invoiceRepository.listStatusesByServiceIds(serviceIds);

  return services.map((service) => {
    const invoices = invoiceStatusesByServiceId.get(service.id) ?? [];
    const decision = evaluateServiceDeleteEligibility(invoices);

    return {
      service,
      canDelete: decision.canDelete,
      deleteBlockedReason: decision.blockedReason,
    };
  });
}
