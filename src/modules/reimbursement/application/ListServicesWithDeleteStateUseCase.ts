import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { Service } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";
import { evaluateServiceDeleteEligibility } from "@/modules/reimbursement/domain/ServiceDeletePolicy";
import { mapServiceDeleteDecisionToEligibility } from "@/modules/reimbursement/application/ServiceDeleteEligibilityMapper";
import { PaginatedResult, PaginationInput, resolvePagination } from "@/modules/reimbursement/application/Pagination";

interface ListServicesWithDeleteStateUseCaseDependencies {
  serviceRepository: Pick<ServiceRepository, "list" | "listPaginated">;
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
  return mapServicesWithDeleteState(services, dependencies.invoiceRepository);
}

export async function listPaginatedServicesWithDeleteStateUseCase(
  input: PaginationInput,
  dependencies: ListServicesWithDeleteStateUseCaseDependencies,
): Promise<PaginatedResult<ServiceWithDeleteState>> {
  const paginatedServices = await dependencies.serviceRepository.listPaginated(resolvePagination(input));
  const serviceItems = await mapServicesWithDeleteState(paginatedServices.items, dependencies.invoiceRepository);

  return {
    items: serviceItems,
    pagination: paginatedServices.pagination,
  };
}

async function mapServicesWithDeleteState(
  services: Service[],
  invoiceRepository: Pick<InvoiceRepository, "listStatusesByServiceIds">,
): Promise<ServiceWithDeleteState[]> {
  if (services.length === 0) {
    return [];
  }

  const serviceIds = services.map((service) => service.id);
  const invoiceStatusesByServiceId = await invoiceRepository.listStatusesByServiceIds(serviceIds);

  return services.map((service) => {
    const invoices = invoiceStatusesByServiceId.get(service.id) ?? [];
    const decision = evaluateServiceDeleteEligibility(invoices);
    const eligibility = mapServiceDeleteDecisionToEligibility(decision);

    return {
      service,
      canDelete: eligibility.canDelete,
      deleteBlockedReason: eligibility.blockedReason,
    };
  });
}
