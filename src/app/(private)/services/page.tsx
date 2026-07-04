import Link from "next/link";

import { HomeIconLink } from "@/app/(private)/_components/HomeIconLink";
import { deleteServiceAction } from "@/app/(private)/services/[id]/actions";
import { listPaginatedServicesWithDeleteStateUseCase } from "@/modules/reimbursement/application/ListServicesWithDeleteStateUseCase";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { PrismaServiceRepository } from "@/modules/reimbursement/infrastructure/PrismaServiceRepository";
import { PaginationControls } from "@/modules/reimbursement/ui/PaginationControls";
import { ServicesList } from "@/modules/reimbursement/ui/ServicesList";
import { prisma } from "@/lib/db/prisma";

import { parseServicesPagination, ServicesPageSearchParams } from "./serviceSearchParams";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<ServicesPageSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const paginationInput = parseServicesPagination(resolvedSearchParams);
  const paginatedServices = await listPaginatedServicesWithDeleteStateUseCase(
    paginationInput,
    {
      serviceRepository: new PrismaServiceRepository(prisma),
      invoiceRepository: new PrismaInvoiceRepository(prisma),
    },
  );

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <HomeIconLink />

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Servicios</h1>
              <p className="mt-1 text-sm text-slate-500">Vista operativa inicial de servicios reembolsables registrados.</p>
            </div>
          </div>

          <Link
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            href="/services/new"
          >
            Nuevo servicio
          </Link>
        </div>

        {paginatedServices.pagination.totalItems > 0 && paginatedServices.items.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">No hay servicios en esta pagina</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Vuelve a una pagina anterior para ver servicios disponibles.</p>
          </section>
        ) : (
          <ServicesList services={paginatedServices.items} deleteServiceAction={deleteServiceAction} />
        )}
        <PaginationControls
          basePath="/services"
          pagination={paginatedServices.pagination}
          searchParams={{
            pageSize: String(paginatedServices.pagination.pageSize),
          }}
        />
      </div>
    </main>
  );
}
