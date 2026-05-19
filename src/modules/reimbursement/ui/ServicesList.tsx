import Link from "next/link";

import { Service } from "@/modules/reimbursement/domain/Service";

interface ServicesListProps {
  services: Service[];
}

export function ServicesList({ services }: ServicesListProps) {
  if (services.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Todavia no hay servicios</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Empieza creando el primer servicio reembolsable para sustituir el seguimiento manual.
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          href="/services/new"
        >
          Crear servicio
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/services/${service.id}`}
          className="group block cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label={`Ver servicio ${service.description}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{formatDate(service.serviceDate)}</p>
              <p className="mt-1 text-base font-semibold text-slate-950">{service.description}</p>
            </div>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toStatusClassName(service.status)}`}>
              {toDisplayStatus(service.status)}
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <p>
              <span className="font-medium text-slate-900">Persona:</span> {service.personName}
            </p>
            <p>
              <span className="font-medium text-slate-900">Aseguradora:</span> {service.insurerName}
            </p>
            <p>
              <span className="font-medium text-slate-900">Importe:</span> {formatCurrency(service.actualAmount, service.currency)}
            </p>
          </div>

        </Link>
      ))}
    </section>
  );
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function toDisplayStatus(status: Service["status"]) {
  switch (status) {
    case "REGISTERED":
      return "Registrado";
    case "SUBMITTED":
      return "Enviado";
    case "REIMBURSED":
      return "Reembolsado";
  }
}

function toStatusClassName(status: Service["status"]) {
  switch (status) {
    case "REGISTERED":
      return "border-slate-300 bg-slate-100 text-slate-700";
    case "SUBMITTED":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "REIMBURSED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}
