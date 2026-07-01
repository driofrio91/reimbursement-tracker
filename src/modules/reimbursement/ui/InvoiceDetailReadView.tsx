import Link from "next/link";

import { Invoice } from "@/modules/reimbursement/domain/Invoice";

interface InvoiceDetailReadViewProps {
  invoice: Invoice;
}

export function InvoiceDetailReadView({ invoice }: InvoiceDetailReadViewProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Factura</p>
          <h2 className="text-xl font-semibold text-slate-950">{invoice.invoiceNumber ?? "Sin numero asignado"}</h2>
        </div>
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-sm font-medium ${toStatusClassName(invoice.status)}`}>
          {toDisplayInvoiceStatus(invoice.status)}
        </span>
      </div>

      <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
        <Info label="Referencia" value={invoice.claimReference ?? "Sin referencia"} />
        <Info label="Fecha de factura" value={invoice.invoiceDate ? formatDate(invoice.invoiceDate) : "Sin fecha"} />
        <Info label="Facturado" value={formatCurrency(invoice.invoiceBilledAmount, invoice.currency)} />
        <Info label="Esperado" value={formatCurrency(invoice.invoiceExpectedAmount, invoice.currency)} />
        <Info
          label="Pagado"
          value={toDisplayPaidStatus(invoice)}
        />
        <Info label="Fecha de pago" value={invoice.paidAt ? formatDate(invoice.paidAt) : "Sin fecha"} />
        <Info label="Emisor" value={invoice.issuerName ?? "Sin emisor"} />
        <Info label="NIF/CIF emisor" value={invoice.issuerTaxId ?? "Sin dato"} />
        <Info label="Ultima actualizacion" value={formatDateTime(invoice.updatedAt)} />
      </div>

      {invoice.rejectionReason ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">Motivo de rechazo: {invoice.rejectionReason}</p>
      ) : null}

      {invoice.correctionReason ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Ultima correccion: {invoice.correctionReason}
        </p>
      ) : null}

      {invoice.notes ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">Notas: {invoice.notes}</p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/invoices"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Volver a facturas
        </Link>
        <Link
          href={`/services/${invoice.serviceId}`}
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Ir al detalle del servicio
        </Link>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium text-slate-900">{label}:</span> {value}
    </p>
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

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function toStatusClassName(status: Invoice["status"]) {
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

function toDisplayInvoiceStatus(status: Invoice["status"]) {
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

function toDisplayPaidStatus(invoice: Invoice) {
  if (invoice.status === "REJECTED") {
    return "Rechazada";
  }

  if (typeof invoice.paidAmount === "number") {
    return formatCurrency(invoice.paidAmount, invoice.currency);
  }

  return "Pendiente";
}
