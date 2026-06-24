import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { evaluateServiceDeleteEligibility } from "@/modules/reimbursement/domain/ServiceDeletePolicy";

interface GetServiceDeleteEligibilityUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "listByServiceId">;
}

export interface ServiceDeleteEligibility {
  canDelete: boolean;
  blockedReason: string;
}

export async function getServiceDeleteEligibilityUseCase(
  serviceId: string,
  dependencies: GetServiceDeleteEligibilityUseCaseDependencies,
): Promise<ServiceDeleteEligibility> {
  const invoices = await dependencies.invoiceRepository.listByServiceId(serviceId);
  const decision = evaluateServiceDeleteEligibility(invoices);

  return {
    canDelete: decision.canDelete,
    blockedReason: decision.blockedReason,
  };
}
