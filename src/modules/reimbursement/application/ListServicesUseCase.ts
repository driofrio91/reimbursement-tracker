import { Service } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

interface ListServicesUseCaseDependencies {
  serviceRepository: ServiceRepository;
}

export async function listServicesUseCase(
  dependencies: ListServicesUseCaseDependencies,
): Promise<Service[]> {
  return dependencies.serviceRepository.list();
}
