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
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Servicios</h1>
          <p className="mt-1 text-sm text-slate-500">Vista operativa inicial de servicios reembolsables registrados.</p>
        </div>

        <Link
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          href="/services/new"
        >
          Nuevo servicio
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Fecha</th>
              <th className="px-6 py-4 font-medium">Concepto</th>
              <th className="px-6 py-4 font-medium">Persona</th>
              <th className="px-6 py-4 font-medium">Aseguradora</th>
              <th className="px-6 py-4 font-medium">Importe</th>
              <th className="px-6 py-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="whitespace-nowrap px-6 py-4">{formatDate(service.serviceDate)}</td>
                <td className="px-6 py-4">
                  <Link className="font-medium text-slate-950 hover:underline" href={`/services/${service.id}`}>
                    {service.description}
                  </Link>
                </td>
                <td className="px-6 py-4">{service.personName}</td>
                <td className="px-6 py-4">{service.insurerName}</td>
                <td className="whitespace-nowrap px-6 py-4">{formatCurrency(service.actualAmount, service.currency)}</td>
                <td className="px-6 py-4">{toDisplayStatus(service.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
