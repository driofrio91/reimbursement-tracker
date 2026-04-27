import Link from "next/link";

import { Invoice, InvoiceStatus } from "@/modules/reimbursement/domain/Invoice";

interface InvoicesSearchViewProps {
  invoices: Invoice[];
  filters: {
    invoiceNumber: string;
    claimReference: string;
    status: "" | InvoiceStatus;
  };
}

const invoiceStatuses: InvoiceStatus[] = [
  "CREATED",
  "INFORMATION_COMPLETED",
  "CLAIM_REFERENCE_COMPLETED",
  "PAID",
  "REJECTED",
];

export function InvoicesSearchView({ invoices, filters }: InvoicesSearchViewProps) {
  return (
    <section className="space-y-4">
      <form action="/invoices" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Numero de factura" htmlFor="invoiceNumber">
            <input
              id="invoiceNumber"
              name="invoiceNumber"
              type="text"
              defaultValue={filters.invoiceNumber}
              placeholder="Ejemplo: F-2026-001"
              className={inputClassName}
            />
          </Field>

          <Field label="Referencia" htmlFor="claimReference">
            <input
              id="claimReference"
              name="claimReference"
              type="text"
              defaultValue={filters.claimReference}
              placeholder="Codigo de aseguradora"
              className={inputClassName}
            />
          </Field>

          <Field label="Estado" htmlFor="status">
            <select id="status" name="status" defaultValue={filters.status} className={inputClassName}>
              <option value="">Todos</option>
              {invoiceStatuses.map((status) => (
                <option key={status} value={status}>
                  {toDisplayInvoiceStatus(status)}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex items-end gap-2">
            <button className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800" type="submit">
              Buscar
            </button>
            <Link
              href="/invoices"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Limpiar
            </Link>
          </div>
        </div>
      </form>

      {invoices.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">No hay facturas para esos filtros</h2>
          <p className="mt-2 text-sm text-slate-600">Ajusta numero, referencia o estado para ampliar la busqueda.</p>
        </section>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <article key={invoice.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-500">Factura</p>
                  <p className="text-base font-semibold text-slate-950">{invoice.invoiceNumber ?? "Sin numero asignado"}</p>
                </div>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toStatusClassName(invoice.status)}`}>
                  {toDisplayInvoiceStatus(invoice.status)}
                </span>
              </div>

              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
                <p>
                  <span className="font-medium text-slate-900">Referencia:</span> {invoice.claimReference ?? "Sin referencia"}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Facturado:</span> {formatCurrency(invoice.invoiceBilledAmount, invoice.currency)}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Esperado:</span> {formatCurrency(invoice.invoiceExpectedAmount, invoice.currency)}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Actualizada:</span> {formatDateTime(invoice.updatedAt)}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  href={`/invoices/${invoice.id}`}
                >
                  Ver detalle
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  href={`/services/${invoice.serviceId}`}
                >
                  Ir al servicio
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <label className="block space-y-1.5" htmlFor={htmlFor}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus-visible:border-slate-500 focus-visible:ring-2 focus-visible:ring-slate-200";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function toStatusClassName(status: InvoiceStatus) {
  switch (status) {
    case "CREATED":
      return "border-slate-300 bg-slate-100 text-slate-700";
    case "INFORMATION_COMPLETED":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "CLAIM_REFERENCE_COMPLETED":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "border-rose-200 bg-rose-50 text-rose-700";
  }
}

function toDisplayInvoiceStatus(status: InvoiceStatus) {
  switch (status) {
    case "CREATED":
      return "Creada";
    case "INFORMATION_COMPLETED":
      return "Informacion completa";
    case "CLAIM_REFERENCE_COMPLETED":
      return "Referencia completa";
    case "PAID":
      return "Pagada";
    case "REJECTED":
      return "Rechazada";
  }
}
