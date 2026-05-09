import Link from "next/link";

import { createServiceAction } from "@/app/(private)/services/new/actions";
import { HomeIconLink } from "@/app/(private)/_components/HomeIconLink";
import { getReimbursementReferenceData } from "@/modules/reimbursement/infrastructure/ReimbursementReferenceData";
import { CreateServiceForm } from "@/modules/reimbursement/ui/CreateServiceForm";

export default async function NewServicePage() {
  const { insurers, people } = await getReimbursementReferenceData();

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <HomeIconLink />

            <div className="space-y-2">
              <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
                Primer flujo de negocio
              </span>
              <h1 className="text-4xl font-semibold tracking-tight">Crear servicio reembolsable</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Registra el gasto real y configura los importes base para autogenerar facturas del servicio.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              href="/services"
            >
              Ver listado
            </Link>
          </div>
        </div>

        <CreateServiceForm action={createServiceAction} insurers={insurers} people={people} />
      </div>
    </main>
  );
}
