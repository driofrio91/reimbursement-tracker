import { Service } from "@/modules/reimbursement/domain/Service";
import { CreateInvoiceFormState } from "@/modules/reimbursement/entrypoints/CreateInvoiceFormSchema";
import { CreateInvoiceForm } from "@/modules/reimbursement/ui/CreateInvoiceForm";

interface ServiceDetailViewProps {
  service: Service;
  createInvoiceAction: (
    state: CreateInvoiceFormState,
    formData: FormData,
  ) => Promise<CreateInvoiceFormState>;
}

export function ServiceDetailView({ service, createInvoiceAction }: ServiceDetailViewProps) {
  return (
    <div className="space-y-6">
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

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Registrar factura</h2>
          <p className="text-sm text-slate-600">
            La factura quedara vinculada a este servicio y se registrara inicialmente en estado recibido.
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3">
          <p>
            <span className="font-medium text-slate-900">Persona:</span> {service.personName}
          </p>
          <p>
            <span className="font-medium text-slate-900">Aseguradora:</span> {service.insurerName}
          </p>
          <p>
            <span className="font-medium text-slate-900">Importe del servicio:</span>{" "}
            {formatCurrency(service.actualAmount, service.currency)}
          </p>
        </div>

        <CreateInvoiceForm action={createInvoiceAction} />
      </section>
    </div>
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
