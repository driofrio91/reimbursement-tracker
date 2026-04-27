"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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

const inputBaseClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200";

const helperTextClassName = "text-xs text-slate-500";

const primaryButtonClassName =
  "inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

const paidPrimaryButtonClassName =
  "inline-flex w-full items-center justify-center rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";

const rejectedSecondaryButtonClassName =
  "inline-flex w-full items-center justify-center rounded-lg border border-rose-300 bg-white px-3 py-2.5 text-sm font-medium text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300";

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
    <div className="space-y-5 sm:space-y-6">
      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {toDisplayStatus(service.status)}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{service.description}</h1>
            <p className="text-sm text-slate-500">
              Este servicio autogenera facturas para cubrir por reembolso esperado el importe real.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:px-5 sm:py-4 sm:text-right">
            <p className="text-sm text-slate-500">Importe real del servicio</p>
            <p className="text-2xl font-semibold text-slate-950">{formatCurrency(service.actualAmount, service.currency)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Resumen operativo</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Total facturado" value={formatCurrency(totalBilledAmount, service.currency)} />
            <MetricCard label="Total esperado" value={formatCurrency(totalExpectedAmount, service.currency)} />
            <MetricCard label="Total pagado" value={formatCurrency(totalPaidAmount, service.currency)} />
            <MetricCard label="Pendiente esperado" value={formatCurrency(pendingExpectedAmount, service.currency)} />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Datos del servicio</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <InfoCard label="Fecha del servicio" value={formatDate(service.serviceDate)} />
            <InfoCard label="Persona" value={service.personName} />
            <InfoCard label="Aseguradora" value={service.insurerName} />
            <InfoCard label="Titular" value={service.policyHolderName} />
            <InfoCard label="Facturado por factura" value={formatCurrency(service.invoiceBilledAmount, service.currency)} />
            <InfoCard label="Esperado por factura" value={formatCurrency(service.invoiceExpectedAmount, service.currency)} />
          </dl>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Metricas complementarias</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <SecondaryMetricCard label="Facturas" value={String(invoices.length)} />
            <SecondaryMetricCard label="Pagadas" value={String(paidInvoicesCount)} />
            <SecondaryMetricCard label="Rechazadas" value={String(rejectedInvoicesCount)} />
            <SecondaryMetricCard label="Resultado" value={toDisplayReimbursementOutcome(reimbursementOutcome, service.status)} />
            <SecondaryMetricCard label="Asistencia" value={service.attended ? "Si" : "No"} />
          </div>
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

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Facturas autogeneradas</h2>
          <p className="text-sm text-slate-600">
            Cada factura avanza por etapas. En cada tarjeta veras primero la siguiente accion operativa.
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

  const [completeState, completeFormAction, isCompleting] = useActionState(completeAction, initialInvoiceActionResult);
  const [claimState, claimFormAction, isClaiming] = useActionState(claimAction, initialInvoiceActionResult);
  const [paidState, paidFormAction, isMarkingPaid] = useActionState(paidAction, initialInvoiceActionResult);
  const [rejectedState, rejectedFormAction, isMarkingRejected] = useActionState(rejectedAction, initialInvoiceActionResult);
  const rejectedFormRef = useRef<HTMLFormElement>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

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

  const stageInfo = toStageInfo(invoice.status);

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

      <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-4">
        <p>
          <span className="font-medium text-slate-900">Facturado:</span> {formatCurrency(invoice.invoiceBilledAmount, invoice.currency)}
        </p>
        <p>
          <span className="font-medium text-slate-900">Esperado:</span> {formatCurrency(invoice.invoiceExpectedAmount, invoice.currency)}
        </p>
        <p>
          <span className="font-medium text-slate-900">Referencia:</span> {invoice.claimReference ?? "Sin referencia"}
        </p>
        <p>
          <span className="font-medium text-slate-900">Pagado:</span>{" "}
          {invoice.paidAmount ? formatCurrency(invoice.paidAmount, invoice.currency) : "Pendiente"}
        </p>
      </div>

      <div className="space-y-3">
        <StageHint status={invoice.status} />

        {invoice.status === "CREATED" ? (
          <form action={completeFormAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
            <p className="text-sm font-medium text-slate-900">Completar informacion de factura</p>
            <Field label="Numero de factura" htmlFor={`invoiceNumber-${invoice.id}`} helper="Ejemplo: F-2026-001">
              <input
                id={`invoiceNumber-${invoice.id}`}
                className={inputBaseClassName}
                type="text"
                name="invoiceNumber"
                defaultValue={invoice.invoiceNumber ?? ""}
                required
              />
            </Field>
            <Field label="Fecha de factura" htmlFor={`invoiceDate-${invoice.id}`}>
              <input
                id={`invoiceDate-${invoice.id}`}
                className={inputBaseClassName}
                type="date"
                name="invoiceDate"
                defaultValue={invoice.invoiceDate ? toInputDate(invoice.invoiceDate) : ""}
                required
              />
            </Field>
            <Field label="Emisor" htmlFor={`issuerName-${invoice.id}`} helper="Nombre de la clinica o proveedor.">
              <input
                id={`issuerName-${invoice.id}`}
                className={inputBaseClassName}
                type="text"
                name="issuerName"
                defaultValue={invoice.issuerName ?? ""}
                required
              />
            </Field>
            <Field label="NIF/CIF del emisor" htmlFor={`issuerTaxId-${invoice.id}`}>
              <input
                id={`issuerTaxId-${invoice.id}`}
                className={inputBaseClassName}
                type="text"
                name="issuerTaxId"
                defaultValue={invoice.issuerTaxId ?? ""}
              />
            </Field>
            <Field label="Notas operativas" htmlFor={`notes-${invoice.id}`}>
              <textarea
                id={`notes-${invoice.id}`}
                className={`${inputBaseClassName} min-h-20`}
                name="notes"
                defaultValue={invoice.notes ?? ""}
              />
            </Field>
            <button className={primaryButtonClassName} type="submit" disabled={isCompleting}>
              {isCompleting ? "Guardando..." : "Guardar informacion"}
            </button>
            <ActionFeedback result={completeState} />
          </form>
        ) : null}

        {invoice.status === "INFORMATION_COMPLETED" ? (
          <form action={claimFormAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
            <p className="text-sm font-medium text-slate-900">Registrar referencia de reembolso</p>
            <Field label="Referencia" htmlFor={`claimReference-${invoice.id}`} helper="Codigo recibido de la aseguradora o portal.">
              <input
                id={`claimReference-${invoice.id}`}
                className={inputBaseClassName}
                type="text"
                name="claimReference"
                defaultValue={invoice.claimReference ?? ""}
                required
              />
            </Field>
            <button className={primaryButtonClassName} type="submit" disabled={isClaiming}>
              {isClaiming ? "Guardando..." : "Guardar referencia"}
            </button>
            <ActionFeedback result={claimState} />
          </form>
        ) : null}

        {invoice.status === "CLAIM_REFERENCE_COMPLETED" ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Resolucion final de factura</p>
            <div className="grid gap-3 lg:grid-cols-2">
              <form action={paidFormAction} className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:p-4">
                <p className="text-sm font-medium text-emerald-900">Marcar como pagada</p>
                <Field label="Importe pagado" htmlFor={`paidAmount-${invoice.id}`} helper="Puedes ajustar el importe final recibido.">
                  <input
                    id={`paidAmount-${invoice.id}`}
                    className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-200"
                    type="text"
                    inputMode="decimal"
                    name="paidAmount"
                    defaultValue={String(invoice.paidAmount ?? invoice.invoiceExpectedAmount)}
                    required
                  />
                </Field>
                <Field label="Fecha de pago" htmlFor={`paidAt-${invoice.id}`}>
                  <input
                    id={`paidAt-${invoice.id}`}
                    className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-200"
                    type="date"
                    name="paidAt"
                    defaultValue={invoice.paidAt ? toInputDate(invoice.paidAt) : defaultPaidDate}
                    required
                  />
                </Field>
                <button className={paidPrimaryButtonClassName} type="submit" disabled={isMarkingPaid}>
                  {isMarkingPaid ? "Guardando..." : "Marcar pagada"}
                </button>
                <ActionFeedback result={paidState} />
              </form>

              <form
                ref={rejectedFormRef}
                action={rejectedFormAction}
                className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-3 sm:p-4"
              >
                <p className="text-sm font-medium text-rose-900">Marcar como rechazada</p>
                <Field label="Motivo de rechazo" htmlFor={`rejectionReason-${invoice.id}`} helper="Opcional. Recomendado para trazabilidad operativa.">
                  <input
                    id={`rejectionReason-${invoice.id}`}
                    className="w-full rounded-lg border border-rose-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus-visible:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200"
                    type="text"
                    name="rejectionReason"
                    defaultValue={invoice.rejectionReason ?? ""}
                  />
                </Field>
                <button
                  className={rejectedSecondaryButtonClassName}
                  type="button"
                  disabled={isMarkingRejected}
                  onClick={() => setIsRejectDialogOpen(true)}
                >
                  {isMarkingRejected ? "Guardando..." : "Marcar rechazada"}
                </button>
                <ActionFeedback result={rejectedState} />
              </form>
            </div>
          </div>
        ) : null}

        {invoice.status === "PAID" || invoice.status === "REJECTED" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            Factura finalizada. No hay acciones pendientes para esta etapa.
          </div>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">{stageInfo.detail}</p>

      {isRejectDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby={`reject-title-${invoice.id}`}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <h3 className="text-base font-semibold text-slate-950" id={`reject-title-${invoice.id}`}>
              Confirmar rechazo de factura
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Esta accion finaliza la factura como rechazada. Revisa los datos antes de confirmar.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="inline-flex w-full items-center justify-center rounded-lg bg-rose-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                type="button"
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  rejectedFormRef.current?.requestSubmit();
                }}
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-950 sm:mt-2 sm:text-lg">{value}</p>
    </div>
  );
}

function SecondaryMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function StageHint({ status }: { status: Invoice["status"] }) {
  const stageInfo = toStageInfo(status);

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${stageInfo.className}`}>
      <p className="font-medium">{stageInfo.stepLabel}</p>
      <p>
        <span className="font-medium">Siguiente accion:</span> {toNextActionLabel(status)}
      </p>
    </div>
  );
}

function Field({
  children,
  label,
  htmlFor,
  helper,
}: {
  children: React.ReactNode;
  label: string;
  htmlFor: string;
  helper?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-800" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {helper ? <p className={helperTextClassName}>{helper}</p> : null}
    </div>
  );
}

function ActionFeedback({ result }: { result: InvoiceActionResult }) {
  if (result.status === "idle" || result.token === 0) {
    return null;
  }

  if (result.status === "error") {
    return (
      <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="status" aria-live="assertive">
        {result.message}
      </p>
    );
  }

  return (
    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status" aria-live="polite">
      {result.message}
    </p>
  );
}

function toStageInfo(status: Invoice["status"]) {
  switch (status) {
    case "CREATED":
      return {
        stepLabel: "Etapa 1 de 4: Factura creada",
        detail: "Completa los datos base para habilitar la referencia de reembolso.",
        className: "border-slate-200 bg-white text-slate-700",
      };
    case "INFORMATION_COMPLETED":
      return {
        stepLabel: "Etapa 2 de 4: Informacion completada",
        detail: "Con la referencia registrada podras resolver la factura como pagada o rechazada.",
        className: "border-blue-200 bg-blue-50 text-blue-900",
      };
    case "CLAIM_REFERENCE_COMPLETED":
      return {
        stepLabel: "Etapa 3 de 4: Referencia registrada",
        detail: "Resuelve la factura en este bloque, con opciones visibles para pagada o rechazada.",
        className: "border-emerald-200 bg-emerald-50 text-emerald-900",
      };
    case "PAID":
      return {
        stepLabel: "Etapa 4 de 4: Factura pagada",
        detail: "La factura queda finalizada y sin acciones pendientes en V1.",
        className: "border-emerald-200 bg-emerald-50 text-emerald-900",
      };
    case "REJECTED":
      return {
        stepLabel: "Etapa 4 de 4: Factura rechazada",
        detail: "La factura queda finalizada y sin acciones pendientes en V1.",
        className: "border-rose-200 bg-rose-50 text-rose-900",
      };
  }
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
      return "Referencia registrada";
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
      return "registrar referencia de reembolso";
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
