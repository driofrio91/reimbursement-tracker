import Link from "next/link";
import { notFound } from "next/navigation";

import { getServiceDetailUseCase } from "@/modules/reimbursement/application/GetServiceDetailUseCase";
import { PrismaServiceRepository } from "@/modules/reimbursement/infrastructure/PrismaServiceRepository";
import { ServiceDetailView } from "@/modules/reimbursement/ui/ServiceDetailView";
import { prisma } from "@/lib/db/prisma";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getServiceDetailUseCase(id, {
    serviceRepository: new PrismaServiceRepository(prisma),
  });

  if (!service) {
    notFound();
  }

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Detalle del servicio</p>
            <p className="mt-1 text-sm text-slate-500">Aqui ira creciendo despues la trazabilidad completa del caso.</p>
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

        <ServiceDetailView service={service} />
      </div>
    </main>
  );
}
