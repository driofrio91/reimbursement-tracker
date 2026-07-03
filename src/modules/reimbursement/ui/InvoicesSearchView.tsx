import Link from "next/link";

import { ClearFiltersLink } from "@/modules/reimbursement/ui/ClearFiltersLink";
import { PaginationControls } from "@/modules/reimbursement/ui/PaginationControls";
import { PaginationMetadata } from "@/modules/reimbursement/application/Pagination";
import { Invoice, InvoiceStatus } from "@/modules/reimbursement/domain/Invoice";

interface InvoicesSearchViewProps {
  invoices: Invoice[];
  filters: {
    invoiceNumber: string;
    claimReference: string;
    status: "" | InvoiceStatus;
  };
  pagination: PaginationMetadata;
}

const invoiceStatuses: InvoiceStatus[] = [
  "CREATED",
  "INFORMATION_COMPLETED",
  "CLAIM_REFERENCE_COMPLETED",
  "PAID",
  "REJECTED",
];

export function InvoicesSearchView({ invoices, filters, pagination }: InvoicesSearchViewProps) {
  const exportHref = buildExportHref(filters);
  const hasActiveFilters = Boolean(filters.invoiceNumber || filters.claimReference || filters.status);

  return (
    <section className="space-y-4">
      <form
        key={`${filters.invoiceNumber}-${filters.claimReference}-${filters.status}`}
        action="/invoices"
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input type="hidden" name="pageSize" value={pagination.pageSize} />
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
            <ClearFiltersLink
              href="/invoices"
              hasActiveFilters={hasActiveFilters}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Limpiar
            </ClearFiltersLink>
          </div>
        </div>
      </form>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Resultados</h2>
          <p className="text-sm text-slate-600">
            {pagination.totalItems} factura{pagination.totalItems === 1 ? "" : "s"} encontrada
            {pagination.totalItems === 1 ? "" : "s"}
          </p>
        </div>
        {pagination.totalItems === 0 ? (
          <button
            aria-disabled="true"
            className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400 sm:w-auto"
            disabled
            title="No hay facturas para exportar con los filtros actuales."
            type="button"
          >
            Extraer facturas
          </button>
        ) : (
          <Link
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            href={exportHref}
          >
            Extraer facturas
          </Link>
        )}
      </div>

      {pagination.totalItems === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">No hay facturas para esos filtros</h2>
          <p className="mt-2 text-sm text-slate-600">Ajusta numero, referencia o estado para ampliar la busqueda.</p>
        </section>
      ) : invoices.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">No hay facturas en esta pagina</h2>
          <p className="mt-2 text-sm text-slate-600">Vuelve a una pagina anterior para ver resultados disponibles.</p>
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

      <PaginationControls
        basePath="/invoices"
        pagination={pagination}
        searchParams={{
          invoiceNumber: filters.invoiceNumber,
          claimReference: filters.claimReference,
          status: filters.status,
          pageSize: String(pagination.pageSize),
        }}
      />
    </section>
  );
}

function buildExportHref(filters: InvoicesSearchViewProps["filters"]): string {
  const searchParams = new URLSearchParams();

  if (filters.invoiceNumber) {
    searchParams.set("invoiceNumber", filters.invoiceNumber);
  }

  if (filters.claimReference) {
    searchParams.set("claimReference", filters.claimReference);
  }

  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  const queryString = searchParams.toString();

  return queryString ? `/invoices/export?${queryString}` : "/invoices/export";
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
