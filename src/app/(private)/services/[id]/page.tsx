import Link from "next/link";
import { notFound } from "next/navigation";

import { HomeIconLink } from "@/app/(private)/_components/HomeIconLink";
import {
  completeInvoiceInformationAction,
  markInvoiceAsPaidAction,
  markInvoiceAsRejectedAction,
  registerInvoiceClaimReferenceAction,
} from "@/app/(private)/services/[id]/actions";
import { getServiceInvoiceSummaryUseCase } from "@/modules/reimbursement/application/GetServiceInvoiceSummaryUseCase";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { PrismaServiceRepository } from "@/modules/reimbursement/infrastructure/PrismaServiceRepository";
import { ServiceDetailView } from "@/modules/reimbursement/ui/ServiceDetailView";
import { prisma } from "@/lib/db/prisma";

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ feedback?: string; message?: string }>;
}

export default async function ServiceDetailPage({ params, searchParams }: ServiceDetailPageProps) {
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  const summary = await getServiceInvoiceSummaryUseCase(id, {
    serviceRepository: new PrismaServiceRepository(prisma),
    invoiceRepository: new PrismaInvoiceRepository(prisma),
  });

  if (!summary) {
    notFound();
  }

  const feedbackType = rawSearchParams.feedback;
  const feedback: { type: "success" | "error"; message: string | null } | null =
    feedbackType === "success" || feedbackType === "error"
      ? {
          type: feedbackType,
          message: rawSearchParams.message ?? null,
        }
      : null;

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <HomeIconLink />

            <div>
              <p className="text-sm text-slate-500">Detalle del servicio</p>
              <p className="mt-1 text-sm text-slate-500">Aqui ira creciendo despues la trazabilidad completa del caso.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              href="/services"
            >
              Volver al listado
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
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
          feedback={feedback}
          completeInvoiceInformationAction={completeInvoiceInformationAction}
          registerInvoiceClaimReferenceAction={registerInvoiceClaimReferenceAction}
          markInvoiceAsPaidAction={markInvoiceAsPaidAction}
          markInvoiceAsRejectedAction={markInvoiceAsRejectedAction}
        />
      </div>
    </main>
  );
}
