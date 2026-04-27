import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository, SearchInvoicesFilters } from "@/modules/reimbursement/domain/InvoiceRepository";

interface SearchInvoicesUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "search">;
}

export async function searchInvoicesUseCase(
  filters: SearchInvoicesFilters,
  dependencies: SearchInvoicesUseCaseDependencies,
): Promise<Invoice[]> {
  return dependencies.invoiceRepository.search(filters);
}
