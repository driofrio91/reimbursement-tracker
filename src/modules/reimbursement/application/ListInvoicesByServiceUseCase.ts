import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";

interface ListInvoicesByServiceUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "listByServiceId">;
}

export async function listInvoicesByServiceUseCase(
  serviceId: string,
  dependencies: ListInvoicesByServiceUseCaseDependencies,
): Promise<Invoice[]> {
  return dependencies.invoiceRepository.listByServiceId(serviceId);
}
