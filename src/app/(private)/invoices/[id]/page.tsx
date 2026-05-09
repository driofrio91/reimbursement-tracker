import { notFound } from "next/navigation";

import { HomeIconLink } from "@/app/(private)/_components/HomeIconLink";
import { getInvoiceDetailUseCase } from "@/modules/reimbursement/application/GetInvoiceDetailUseCase";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { InvoiceDetailReadView } from "@/modules/reimbursement/ui/InvoiceDetailReadView";
import { prisma } from "@/lib/db/prisma";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoiceDetailUseCase(id, {
    invoiceRepository: new PrismaInvoiceRepository(prisma),
  });

  if (!invoice) {
    notFound();
  }

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-10 sm:py-10">
        <div className="flex items-start gap-3">
          <HomeIconLink />

          <div>
            <p className="text-sm text-slate-500">Detalle de factura</p>
            <p className="mt-1 text-sm text-slate-600">Vista de lectura operativa con acceso al ciclo en su servicio.</p>
          </div>
        </div>

        <InvoiceDetailReadView invoice={invoice} />
      </div>
    </main>
  );
}
