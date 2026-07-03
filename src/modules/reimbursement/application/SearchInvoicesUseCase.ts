import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository, SearchInvoicesFilters } from "@/modules/reimbursement/domain/InvoiceRepository";
import { PaginatedResult, PaginationInput, resolvePagination } from "@/modules/reimbursement/application/Pagination";

interface SearchInvoicesUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "search" | "searchPaginated">;
}

export async function searchInvoicesUseCase(
  filters: SearchInvoicesFilters,
  dependencies: SearchInvoicesUseCaseDependencies,
): Promise<Invoice[]> {
  return dependencies.invoiceRepository.search(filters);
}

export async function searchPaginatedInvoicesUseCase(
  filters: SearchInvoicesFilters,
  paginationInput: PaginationInput,
  dependencies: SearchInvoicesUseCaseDependencies,
): Promise<PaginatedResult<Invoice>> {
  return dependencies.invoiceRepository.searchPaginated(filters, resolvePagination(paginationInput));
}
