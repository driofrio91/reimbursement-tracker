import { Service } from "@/modules/reimbursement/domain/Service";

interface ServiceDetailViewProps {
  service: Service;
}

export function ServiceDetailView({ service }: ServiceDetailViewProps) {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            {toDisplayStatus(service.status)}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{service.description}</h1>
          <p className="text-sm text-slate-500">Creado para sustituir el seguimiento manual del Excel.</p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-5 py-4 text-right">
          <p className="text-sm text-slate-500">Importe real</p>
          <p className="text-2xl font-semibold text-slate-950">{formatCurrency(service.actualAmount, service.currency)}</p>
        </div>
      </div>

      <dl className="grid gap-4 md:grid-cols-2">
        <InfoCard label="Fecha del servicio" value={formatDate(service.serviceDate)} />
        <InfoCard label="Persona" value={service.personName} />
        <InfoCard label="Aseguradora" value={service.insurerName} />
        <InfoCard label="Titular" value={service.policyHolderName} />
        <InfoCard label="Asistencia" value={service.attended ? "Si" : "No"} />
        <InfoCard label="Moneda" value={service.currency} />
      </dl>

      <div className="rounded-2xl border border-slate-200 p-5">
        <h2 className="text-sm font-medium text-slate-700">Notas</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {service.notes || "Sin notas registradas."}
        </p>
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-2 text-base font-medium text-slate-950">{value}</dd>
    </div>
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
