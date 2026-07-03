import { HomeIconLink } from "@/app/(private)/_components/HomeIconLink";
import { searchPaginatedInvoicesUseCase } from "@/modules/reimbursement/application/SearchInvoicesUseCase";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { InvoicesSearchView } from "@/modules/reimbursement/ui/InvoicesSearchView";
import { prisma } from "@/lib/db/prisma";

import { InvoicesPageSearchParams, parseInvoicesPagination, parseInvoicesSearchFilters } from "./invoiceSearchParams";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<InvoicesPageSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseInvoicesSearchFilters(resolvedSearchParams);
  const paginationInput = parseInvoicesPagination(resolvedSearchParams);

  const paginatedInvoices = await searchPaginatedInvoicesUseCase(
    filters,
    paginationInput,
    {
      invoiceRepository: new PrismaInvoiceRepository(prisma),
    },
  );

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-10 sm:py-10">
        <div className="flex items-start gap-3">
          <HomeIconLink />

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Facturas</h1>
            <p className="mt-1 text-sm text-slate-600">Buscador operativo con acceso directo a detalle y servicio.</p>
          </div>
        </div>

        <InvoicesSearchView
          invoices={paginatedInvoices.items}
          filters={{
            invoiceNumber: filters.invoiceNumber ?? "",
            claimReference: filters.claimReference ?? "",
            status: filters.status ?? "",
          }}
          pagination={paginatedInvoices.pagination}
        />
      </div>
    </main>
  );
}
