"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { type ReimbursementOutcome } from "@/modules/reimbursement/application/GetServiceInvoiceSummaryUseCase";
import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { Service } from "@/modules/reimbursement/domain/Service";

interface InvoiceActionResult {
  status: "idle" | "success" | "error";
  message: string;
  token: number;
}

const initialInvoiceActionResult: InvoiceActionResult = {
  status: "idle",
  message: "",
  token: 0,
};

interface ServiceDetailViewProps {
  service: Service;
  invoices: Invoice[];
  totalBilledAmount: number;
  totalExpectedAmount: number;
  totalPaidAmount: number;
  pendingExpectedAmount: number;
  overBilledAmount: number;
  overExpectedAmount: number;
  paidInvoicesCount: number;
  rejectedInvoicesCount: number;
  reimbursementOutcome: ReimbursementOutcome;
  completeInvoiceInformationAction: (
    serviceId: string,
    invoiceId: string,
    previousState: InvoiceActionResult,
    formData: FormData,
  ) => Promise<InvoiceActionResult>;
  registerInvoiceClaimReferenceAction: (
    serviceId: string,
    invoiceId: string,
    previousState: InvoiceActionResult,
    formData: FormData,
  ) => Promise<InvoiceActionResult>;
  markInvoiceAsPaidAction: (
    serviceId: string,
    invoiceId: string,
    previousState: InvoiceActionResult,
    formData: FormData,
  ) => Promise<InvoiceActionResult>;
  markInvoiceAsRejectedAction: (
    serviceId: string,
    invoiceId: string,
    previousState: InvoiceActionResult,
    formData: FormData,
  ) => Promise<InvoiceActionResult>;
}

export function ServiceDetailView({
  service,
  invoices,
  totalBilledAmount,
  totalExpectedAmount,
  totalPaidAmount,
  pendingExpectedAmount,
  overBilledAmount,
  overExpectedAmount,
  paidInvoicesCount,
  rejectedInvoicesCount,
  reimbursementOutcome,
  completeInvoiceInformationAction,
  registerInvoiceClaimReferenceAction,
  markInvoiceAsPaidAction,
  markInvoiceAsRejectedAction,
}: ServiceDetailViewProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {toDisplayStatus(service.status)}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{service.description}</h1>
            <p className="text-sm text-slate-500">
              Este servicio autogenera facturas para cubrir por reembolso esperado el importe real.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-5 py-4 text-right">
            <p className="text-sm text-slate-500">Importe real del servicio</p>
            <p className="text-2xl font-semibold text-slate-950">{formatCurrency(service.actualAmount, service.currency)}</p>
          </div>
        </div>

        <dl className="grid gap-4 md:grid-cols-2">
          <InfoCard label="Fecha del servicio" value={formatDate(service.serviceDate)} />
          <InfoCard label="Persona" value={service.personName} />
          <InfoCard label="Aseguradora" value={service.insurerName} />
          <InfoCard label="Titular" value={service.policyHolderName} />
          <InfoCard label="Facturado por factura" value={formatCurrency(service.invoiceBilledAmount, service.currency)} />
          <InfoCard label="Esperado por factura" value={formatCurrency(service.invoiceExpectedAmount, service.currency)} />
        </dl>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total facturado" value={formatCurrency(totalBilledAmount, service.currency)} />
          <MetricCard label="Total esperado" value={formatCurrency(totalExpectedAmount, service.currency)} />
          <MetricCard label="Total pagado" value={formatCurrency(totalPaidAmount, service.currency)} />
          <MetricCard label="Pendiente esperado" value={formatCurrency(pendingExpectedAmount, service.currency)} />
          <MetricCard label="Facturas" value={String(invoices.length)} />
          <MetricCard label="Pagadas" value={String(paidInvoicesCount)} />
          <MetricCard label="Rechazadas" value={String(rejectedInvoicesCount)} />
          <MetricCard label="Resultado del reembolso" value={toDisplayReimbursementOutcome(reimbursementOutcome, service.status)} />
          <MetricCard label="Asistencia" value={service.attended ? "Si" : "No"} />
        </div>

        {overBilledAmount > 0 ? (
          <AlertBox title="Aviso de sobrefacturacion" text={`El total facturado supera el servicio en ${formatCurrency(overBilledAmount, service.currency)}.`} />
        ) : null}

        {overExpectedAmount > 0 ? (
          <AlertBox
            title="Aviso de sobrecobertura esperada"
            text={`El total esperado supera el servicio en ${formatCurrency(overExpectedAmount, service.currency)}.`}
          />
        ) : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Facturas autogeneradas</h2>
          <p className="text-sm text-slate-600">
            Cada factura avanza por etapas. Solo se muestra la siguiente accion disponible.
          </p>
        </div>

        {invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Aun no hay facturas registradas para este servicio.
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice, index) => (
              <InvoiceStageCard
                key={invoice.id}
                serviceId={service.id}
                invoice={invoice}
                index={index}
                completeInvoiceInformationAction={completeInvoiceInformationAction}
                registerInvoiceClaimReferenceAction={registerInvoiceClaimReferenceAction}
                markInvoiceAsPaidAction={markInvoiceAsPaidAction}
                markInvoiceAsRejectedAction={markInvoiceAsRejectedAction}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface InvoiceStageCardProps {
  serviceId: string;
  invoice: Invoice;
  index: number;
  completeInvoiceInformationAction: ServiceDetailViewProps["completeInvoiceInformationAction"];
  registerInvoiceClaimReferenceAction: ServiceDetailViewProps["registerInvoiceClaimReferenceAction"];
  markInvoiceAsPaidAction: ServiceDetailViewProps["markInvoiceAsPaidAction"];
  markInvoiceAsRejectedAction: ServiceDetailViewProps["markInvoiceAsRejectedAction"];
}

function InvoiceStageCard({
  serviceId,
  invoice,
  index,
  completeInvoiceInformationAction,
  registerInvoiceClaimReferenceAction,
  markInvoiceAsPaidAction,
  markInvoiceAsRejectedAction,
}: InvoiceStageCardProps) {
  const router = useRouter();
  const defaultPaidDate = new Date().toISOString().slice(0, 10);

  const completeAction = completeInvoiceInformationAction.bind(null, serviceId, invoice.id);
  const claimAction = registerInvoiceClaimReferenceAction.bind(null, serviceId, invoice.id);
  const paidAction = markInvoiceAsPaidAction.bind(null, serviceId, invoice.id);
  const rejectedAction = markInvoiceAsRejectedAction.bind(null, serviceId, invoice.id);

  const [completeState, completeFormAction] = useActionState(completeAction, initialInvoiceActionResult);
  const [claimState, claimFormAction] = useActionState(claimAction, initialInvoiceActionResult);
  const [paidState, paidFormAction] = useActionState(paidAction, initialInvoiceActionResult);
  const [rejectedState, rejectedFormAction] = useActionState(rejectedAction, initialInvoiceActionResult);

  useEffect(() => {
    notifyActionResult(completeState, router);
  }, [completeState, router]);

  useEffect(() => {
    notifyActionResult(claimState, router);
  }, [claimState, router]);

  useEffect(() => {
    notifyActionResult(paidState, router);
  }, [paidState, router]);

  useEffect(() => {
    notifyActionResult(rejectedState, router);
  }, [rejectedState, router]);

  return (
    <article className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-950">Factura #{index + 1}</p>
          <p className="text-sm text-slate-600">{invoice.invoiceNumber ?? "Sin numero asignado"}</p>
        </div>

        <span className="inline-flex rounded-full border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-700">
          {toDisplayInvoiceStatus(invoice.status)}
        </span>
      </div>

      <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
        <p>
          <span className="font-medium text-slate-900">Facturado:</span> {formatCurrency(invoice.invoiceBilledAmount, invoice.currency)}
        </p>
        <p>
          <span className="font-medium text-slate-900">Esperado:</span> {formatCurrency(invoice.invoiceExpectedAmount, invoice.currency)}
        </p>
        <p>
          <span className="font-medium text-slate-900">Solicitud:</span> {invoice.claimReference ?? "Sin referencia"}
        </p>
        <p>
          <span className="font-medium text-slate-900">Pagado:</span>{" "}
          {invoice.paidAmount ? formatCurrency(invoice.paidAmount, invoice.currency) : "Pendiente"}
        </p>
      </div>

      <div className="space-y-3">
        <StageHint status={invoice.status} />

        {invoice.status === "CREATED" ? (
          <form action={completeFormAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium text-slate-800">Completar informacion de factura</p>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="text"
              name="invoiceNumber"
              placeholder="F-2026-001"
              defaultValue={invoice.invoiceNumber ?? ""}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="date"
              name="invoiceDate"
              defaultValue={invoice.invoiceDate ? toInputDate(invoice.invoiceDate) : ""}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="text"
              name="issuerName"
              placeholder="Clinica Central"
              defaultValue={invoice.issuerName ?? ""}
              required
            />
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="text"
              name="issuerTaxId"
              placeholder="B12345678"
              defaultValue={invoice.issuerTaxId ?? ""}
            />
            <textarea className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" name="notes" defaultValue={invoice.notes ?? ""} />
            <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white" type="submit">
              Guardar informacion
            </button>
          </form>
        ) : null}

        {invoice.status === "INFORMATION_COMPLETED" ? (
          <form action={claimFormAction} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium text-slate-800">Registrar referencia de solicitud</p>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              type="text"
              name="claimReference"
              placeholder="REF-PORTAL-2026-001"
              defaultValue={invoice.claimReference ?? ""}
              required
            />
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800" type="submit">
              Guardar referencia
            </button>
          </form>
        ) : null}

        {invoice.status === "CLAIM_REFERENCE_COMPLETED" ? (
          <div className="grid gap-3 lg:grid-cols-2">
            <form action={paidFormAction} className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-medium text-emerald-900">Resolver como pagada</p>
              <input
                className="w-full rounded-lg border border-emerald-300 px-3 py-2 text-sm"
                type="text"
                inputMode="decimal"
                name="paidAmount"
                defaultValue={String(invoice.paidAmount ?? invoice.invoiceExpectedAmount)}
                required
              />
              <input
                className="w-full rounded-lg border border-emerald-300 px-3 py-2 text-sm"
                type="date"
                name="paidAt"
                defaultValue={invoice.paidAt ? toInputDate(invoice.paidAt) : defaultPaidDate}
                required
              />
              <button className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white" type="submit">
                Marcar pagada
              </button>
            </form>

            <form action={rejectedFormAction} className="space-y-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
              <p className="text-sm font-medium text-rose-900">Resolver como rechazada</p>
              <input
                className="w-full rounded-lg border border-rose-300 px-3 py-2 text-sm"
                type="text"
                name="rejectionReason"
                placeholder="Motivo de rechazo"
                defaultValue={invoice.rejectionReason ?? ""}
              />
              <button className="inline-flex items-center justify-center rounded-lg bg-rose-700 px-3 py-2 text-sm font-medium text-white" type="submit">
                Marcar rechazada
              </button>
            </form>
          </div>
        ) : null}

        {invoice.status === "PAID" || invoice.status === "REJECTED" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            Factura finalizada. Si necesitas cambios, crea una nueva factura de ajuste en una siguiente iteracion del flujo.
          </div>
        ) : null}
      </div>
    </article>
  );
}

function notifyActionResult(result: InvoiceActionResult, router: ReturnType<typeof useRouter>) {
  if (result.status === "idle" || result.token === 0) {
    return;
  }

  if (result.status === "success") {
    toast.success(result.message);
    router.refresh();

    return;
  }

  toast.error(result.message);
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function StageHint({ status }: { status: Invoice["status"] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
      <span className="font-medium text-slate-900">Siguiente accion:</span> {toNextActionLabel(status)}
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

function AlertBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-medium">{title}</p>
      <p className="mt-1">{text}</p>
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

function toInputDate(value: Date): string {
  return value.toISOString().slice(0, 10);
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

function toDisplayInvoiceStatus(status: Invoice["status"]) {
  switch (status) {
    case "CREATED":
      return "Creada";
    case "INFORMATION_COMPLETED":
      return "Informacion completada";
    case "CLAIM_REFERENCE_COMPLETED":
      return "Solicitud registrada";
    case "PAID":
      return "Pagada";
    case "REJECTED":
      return "Rechazada";
  }
}

function toNextActionLabel(status: Invoice["status"]) {
  switch (status) {
    case "CREATED":
      return "completar informacion de factura";
    case "INFORMATION_COMPLETED":
      return "registrar referencia de solicitud";
    case "CLAIM_REFERENCE_COMPLETED":
      return "resolver como pagada o rechazada";
    case "PAID":
      return "sin acciones pendientes";
    case "REJECTED":
      return "sin acciones pendientes";
  }
}

function toDisplayReimbursementOutcome(outcome: ReimbursementOutcome, serviceStatus: Service["status"]) {
  if (serviceStatus !== "REIMBURSED") {
    return "En seguimiento";
  }

  switch (outcome) {
    case "FULL":
      return "Reembolso completo";
    case "PARTIAL":
      return "Reembolso parcial";
    case "NONE":
      return "Sin reembolso";
  }
}
