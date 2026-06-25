import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { evaluateServiceDeleteEligibility } from "@/modules/reimbursement/domain/ServiceDeletePolicy";
import {
  mapServiceDeleteDecisionToEligibility,
  ServiceDeleteEligibilityView,
} from "@/modules/reimbursement/application/ServiceDeleteEligibilityMapper";

interface GetServiceDeleteEligibilityUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "listByServiceId">;
}

export type ServiceDeleteEligibility = ServiceDeleteEligibilityView;

export async function getServiceDeleteEligibilityUseCase(
  serviceId: string,
  dependencies: GetServiceDeleteEligibilityUseCaseDependencies,
): Promise<ServiceDeleteEligibility> {
  const invoices = await dependencies.invoiceRepository.listByServiceId(serviceId);
  const decision = evaluateServiceDeleteEligibility(invoices);

  return mapServiceDeleteDecisionToEligibility(decision);
}
