import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";

interface GetInvoiceDetailUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "getById">;
}

export async function getInvoiceDetailUseCase(
  invoiceId: string,
  dependencies: GetInvoiceDetailUseCaseDependencies,
): Promise<Invoice | null> {
  return dependencies.invoiceRepository.getById(invoiceId);
}
