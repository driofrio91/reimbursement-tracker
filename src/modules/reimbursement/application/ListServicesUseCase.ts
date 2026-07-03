import { Service } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";
import { PaginatedResult, PaginationInput, resolvePagination } from "@/modules/reimbursement/application/Pagination";

interface ListServicesUseCaseDependencies {
  serviceRepository: ServiceRepository;
}

export async function listServicesUseCase(
  dependencies: ListServicesUseCaseDependencies,
): Promise<Service[]> {
  return dependencies.serviceRepository.list();
}

export async function listPaginatedServicesUseCase(
  input: PaginationInput,
  dependencies: Pick<ListServicesUseCaseDependencies, "serviceRepository">,
): Promise<PaginatedResult<Service>> {
  return dependencies.serviceRepository.listPaginated(resolvePagination(input));
}
