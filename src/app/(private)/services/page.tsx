import Link from "next/link";

import { HomeIconLink } from "@/app/(private)/_components/HomeIconLink";
import { deleteServiceAction } from "@/app/(private)/services/[id]/actions";
import { listServicesUseCase } from "@/modules/reimbursement/application/ListServicesUseCase";
import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { PrismaServiceRepository } from "@/modules/reimbursement/infrastructure/PrismaServiceRepository";
import { ServicesList } from "@/modules/reimbursement/ui/ServicesList";
import { prisma } from "@/lib/db/prisma";

export default async function ServicesPage() {
  const invoiceRepository = new PrismaInvoiceRepository(prisma);
  const services = await listServicesUseCase({
    serviceRepository: new PrismaServiceRepository(prisma),
  });
  const servicesWithDeleteState = await Promise.all(
    services.map(async (service) => {
      const invoices = await invoiceRepository.listByServiceId(service.id);

      return {
        service,
        ...buildServiceDeleteState(invoices),
      };
    }),
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

        <ServicesList services={servicesWithDeleteState} deleteServiceAction={deleteServiceAction} />
      </div>
    </main>
  );
}

function buildServiceDeleteState(invoices: Invoice[]): { canDelete: boolean; deleteBlockedReason: string } {
  const hasInformationCompleted = invoices.some((invoice) => invoice.status === "INFORMATION_COMPLETED");
  const hasAdvancedStatus = invoices.some(
    (invoice) =>
      invoice.status === "CLAIM_REFERENCE_COMPLETED" || invoice.status === "PAID" || invoice.status === "REJECTED",
  );

  if (hasAdvancedStatus) {
    return {
      canDelete: false,
      deleteBlockedReason: "Este servicio ya tiene facturas tramitadas o resueltas y no se puede eliminar.",
    };
  }

  if (hasInformationCompleted) {
    return {
      canDelete: false,
      deleteBlockedReason:
        "Para eliminar este servicio, primero revisa y borra una a una las facturas en estado Informacion completada.",
    };
  }

  return {
    canDelete: true,
    deleteBlockedReason: "",
  };
}
