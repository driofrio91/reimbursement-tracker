import { Service } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

interface GetServiceDetailUseCaseDependencies {
  serviceRepository: ServiceRepository;
}

export async function getServiceDetailUseCase(
  serviceId: string,
  dependencies: GetServiceDetailUseCaseDependencies,
): Promise<Service | null> {
  return dependencies.serviceRepository.getById(serviceId);
}
