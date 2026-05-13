import Link from "next/link";
import { notFound } from "next/navigation";

import { HomeIconLink } from "@/app/(private)/_components/HomeIconLink";
import {
  assignInvoicePersonAction,
  completeInvoiceInformationAction,
  correctInvoiceResolutionAction,
  markInvoiceAsPaidAction,
  markInvoiceAsRejectedAction,
  registerInvoiceClaimReferenceAction,
} from "@/app/(private)/services/[id]/actions";
import { getServiceInvoiceSummaryUseCase } from "@/modules/reimbursement/application/GetServiceInvoiceSummaryUseCase";
import { getReimbursementReferenceData } from "@/modules/reimbursement/infrastructure/ReimbursementReferenceData";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { PrismaServiceRepository } from "@/modules/reimbursement/infrastructure/PrismaServiceRepository";
import { ServiceDetailView } from "@/modules/reimbursement/ui/ServiceDetailView";
import { prisma } from "@/lib/db/prisma";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { people } = await getReimbursementReferenceData();
  const summary = await getServiceInvoiceSummaryUseCase(id, {
    serviceRepository: new PrismaServiceRepository(prisma),
    invoiceRepository: new PrismaInvoiceRepository(prisma),
  });

  if (!summary) {
    notFound();
  }

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <HomeIconLink />

            <div>
              <p className="text-sm text-slate-500">Detalle del servicio</p>
              <p className="mt-1 text-sm text-slate-500">Gestiona aqui el ciclo por etapas de las facturas del servicio.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              href="/services"
            >
              Volver al listado
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              href="/services/new"
            >
              Nuevo servicio
            </Link>
          </div>
        </div>

        <ServiceDetailView
          service={summary.service}
          invoices={summary.invoices}
          totalBilledAmount={summary.totalBilledAmount}
          totalExpectedAmount={summary.totalExpectedAmount}
          totalPaidAmount={summary.totalPaidAmount}
          pendingExpectedAmount={summary.pendingExpectedAmount}
          overBilledAmount={summary.overBilledAmount}
          overExpectedAmount={summary.overExpectedAmount}
          paidInvoicesCount={summary.paidInvoicesCount}
          rejectedInvoicesCount={summary.rejectedInvoicesCount}
          reimbursementOutcome={summary.reimbursementOutcome}
          people={people}
          assignInvoicePersonAction={assignInvoicePersonAction}
          completeInvoiceInformationAction={completeInvoiceInformationAction}
          registerInvoiceClaimReferenceAction={registerInvoiceClaimReferenceAction}
          markInvoiceAsPaidAction={markInvoiceAsPaidAction}
          markInvoiceAsRejectedAction={markInvoiceAsRejectedAction}
          correctInvoiceResolutionAction={correctInvoiceResolutionAction}
        />
      </div>
    </main>
  );
}
