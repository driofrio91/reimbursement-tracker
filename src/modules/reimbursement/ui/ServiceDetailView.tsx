"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { InvoiceActionResult } from "@/app/(private)/services/[id]/invoice-action-state";
import { type ReimbursementOutcome } from "@/modules/reimbursement/application/GetServiceInvoiceSummaryUseCase";
import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { Service } from "@/modules/reimbursement/domain/Service";
import { ReferencePerson } from "@/modules/reimbursement/infrastructure/ReimbursementReferenceData";

const initialInvoiceActionResult: InvoiceActionResult = {
  status: "idle",
  message: "",
  token: 0,
};

const inputBaseClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus-visible:border-slate-500 focus-visible:ring-2 focus-visible:ring-slate-200";

const helperTextClassName = "text-xs text-slate-500/90";

const primaryButtonClassName =
  "inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

const paidPrimaryButtonClassName =
  "inline-flex w-full items-center justify-center rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";

const rejectedSecondaryButtonClassName =
  "inline-flex w-full items-center justify-center rounded-lg border border-rose-300 bg-white px-3 py-2.5 text-sm font-medium text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300";

interface ServiceDetailViewProps {
  service: Service;
  invoices: Invoice[];
  people: ReferencePerson[];
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
  correctInvoiceResolutionAction: (
    serviceId: string,
    invoiceId: string,
    previousState: InvoiceActionResult,
    formData: FormData,
  ) => Promise<InvoiceActionResult>;
  addInvoiceAction: (
    serviceId: string,
    previousState: InvoiceActionResult,
    formData: FormData,
  ) => Promise<InvoiceActionResult>;
  deleteInvoiceAction: (
    serviceId: string,
    invoiceId: string,
    previousState: InvoiceActionResult,
    formData: FormData,
  ) => Promise<InvoiceActionResult>;
  exportCreatedInvoicesHref: string;
}

export function ServiceDetailView({
  service,
  invoices,
  people,
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
  correctInvoiceResolutionAction,
  addInvoiceAction,
  deleteInvoiceAction,
  exportCreatedInvoicesHref,
}: ServiceDetailViewProps) {
  const router = useRouter();
  const orderedInvoices = useMemo(() => {
    const automaticInvoices = invoices.filter((invoice) => !invoice.createdManually);
    const manualInvoices = invoices
      .filter((invoice) => invoice.createdManually)
      .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());

    return [...automaticInvoices, ...manualInvoices];
  }, [invoices]);
  const createdInvoicesCount = orderedInvoices.filter((invoice) => invoice.status === "CREATED").length;
  const canAddInvoice = service.status !== "REIMBURSED";
  const canExportInvoices = createdInvoicesCount > 0;
  const addBoundAction = addInvoiceAction.bind(null, service.id);
  const [addInvoiceState, addInvoiceFormAction, isAddingInvoice] = useActionState(addBoundAction, initialInvoiceActionResult);
  const [highlightedInvoiceIds, setHighlightedInvoiceIds] = useState<string[]>([]);
  const lastHandledCreatedInvoiceIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (addInvoiceState.status === "idle" || addInvoiceState.token === 0) {
      return;
    }

    if (addInvoiceState.status === "error") {
      toast.error(addInvoiceState.message, { duration: 9000 });
      return;
    }

    toast.success(addInvoiceState.message, { duration: 5000 });
    router.refresh();
  }, [addInvoiceState, router]);

  useEffect(() => {
    const createdInvoiceId = addInvoiceState.createdInvoiceId;

    if (!createdInvoiceId || addInvoiceState.status !== "success") {
      return;
    }

    if (lastHandledCreatedInvoiceIdRef.current === createdInvoiceId) {
      return;
    }

    const createdInvoice = orderedInvoices.find((invoice) => invoice.id === createdInvoiceId);

    if (createdInvoice) {
      lastHandledCreatedInvoiceIdRef.current = createdInvoiceId;
      const markTimer = window.setTimeout(() => {
        setHighlightedInvoiceIds((current) => (current.includes(createdInvoiceId) ? current : [...current, createdInvoiceId]));
      }, 0);
      const animationTimer = window.setTimeout(() => {
        const element = document.getElementById(`invoice-card-${createdInvoiceId}`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
      const clearTimer = window.setTimeout(() => {
        setHighlightedInvoiceIds((current) => current.filter((id) => id !== createdInvoiceId));
      }, 10000);

      return () => {
        window.clearTimeout(markTimer);
        window.clearTimeout(animationTimer);
        window.clearTimeout(clearTimer);
      };
    }
  }, [addInvoiceState.createdInvoiceId, addInvoiceState.status, orderedInvoices]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {toDisplayStatus(service.status)}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{service.description}</h1>
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
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Facturas autogeneradas</h2>
              <p className="text-sm text-slate-600">
                Cada factura avanza por etapas. En cada tarjeta veras primero la siguiente accion operativa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <form action={addInvoiceFormAction}>
                <ActionLockButton
                  label="Anadir factura"
                  isDisabled={!canAddInvoice || isAddingInvoice}
                  disabledReason="Este servicio ya esta cerrado. No se pueden anadir mas facturas."
                  isLoading={isAddingInvoice}
                />
              </form>

              <ActionLockLink
                href={exportCreatedInvoicesHref}
                label="Extraer facturas"
                isDisabled={!canExportInvoices}
                disabledReason="No hay facturas en estado Created para exportar."
              />
            </div>
          </div>

          {addInvoiceState.status === "error" && addInvoiceState.token > 0 ? <ActionFeedback result={addInvoiceState} /> : null}
        </div>

        {invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Aun no hay facturas registradas para este servicio.
          </div>
        ) : (
          <div>
            {orderedInvoices.map((invoice, index) => (
              <InvoiceStageCard
                key={invoice.id}
                serviceId={service.id}
                invoice={invoice}
                index={index}
                isNewInvoice={highlightedInvoiceIds.includes(invoice.id)}
                people={people}
                servicePersonId={service.personId}
                serviceInsurerName={service.insurerName}
                completeInvoiceInformationAction={completeInvoiceInformationAction}
                registerInvoiceClaimReferenceAction={registerInvoiceClaimReferenceAction}
                markInvoiceAsPaidAction={markInvoiceAsPaidAction}
                markInvoiceAsRejectedAction={markInvoiceAsRejectedAction}
                correctInvoiceResolutionAction={correctInvoiceResolutionAction}
                deleteInvoiceAction={deleteInvoiceAction}
                serviceStatus={service.status}
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
  isNewInvoice: boolean;
  people: ReferencePerson[];
  servicePersonId: string;
  serviceInsurerName: string;
  serviceStatus: Service["status"];
  completeInvoiceInformationAction: ServiceDetailViewProps["completeInvoiceInformationAction"];
  registerInvoiceClaimReferenceAction: ServiceDetailViewProps["registerInvoiceClaimReferenceAction"];
  markInvoiceAsPaidAction: ServiceDetailViewProps["markInvoiceAsPaidAction"];
  markInvoiceAsRejectedAction: ServiceDetailViewProps["markInvoiceAsRejectedAction"];
  correctInvoiceResolutionAction: ServiceDetailViewProps["correctInvoiceResolutionAction"];
  deleteInvoiceAction: ServiceDetailViewProps["deleteInvoiceAction"];
}

function InvoiceStageCard({
  serviceId,
  invoice,
  index,
  isNewInvoice,
  people,
  servicePersonId,
  serviceInsurerName,
  serviceStatus,
  completeInvoiceInformationAction,
  registerInvoiceClaimReferenceAction,
  markInvoiceAsPaidAction,
  markInvoiceAsRejectedAction,
  correctInvoiceResolutionAction,
  deleteInvoiceAction,
}: InvoiceStageCardProps) {
  const router = useRouter();
  const defaultPaidDate = new Date().toISOString().slice(0, 10);

  const completeAction = completeInvoiceInformationAction.bind(null, serviceId, invoice.id);
  const claimAction = registerInvoiceClaimReferenceAction.bind(null, serviceId, invoice.id);
  const paidAction = markInvoiceAsPaidAction.bind(null, serviceId, invoice.id);
  const rejectedAction = markInvoiceAsRejectedAction.bind(null, serviceId, invoice.id);
  const correctionAction = correctInvoiceResolutionAction.bind(null, serviceId, invoice.id);
  const deleteAction = deleteInvoiceAction.bind(null, serviceId, invoice.id);

  const [completeState, completeFormAction, isCompleting] = useActionState(completeAction, initialInvoiceActionResult);
  const [claimState, claimFormAction, isClaiming] = useActionState(claimAction, initialInvoiceActionResult);
  const [paidState, paidFormAction, isMarkingPaid] = useActionState(paidAction, initialInvoiceActionResult);
  const [rejectedState, rejectedFormAction, isMarkingRejected] = useActionState(rejectedAction, initialInvoiceActionResult);
  const [correctionState, correctionFormAction, isCorrectingResolution] = useActionState(correctionAction, initialInvoiceActionResult);
  const [deleteState, deleteFormAction, isDeleting] = useActionState(deleteAction, initialInvoiceActionResult);
  const correctionFormRef = useRef<HTMLFormElement>(null);
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [isRejectedModalOpen, setIsRejectedModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

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
    if (paidState.status === "success" && paidState.token > 0) {
      const closeModalTimer = window.setTimeout(() => {
        setIsPaidModalOpen(false);
      }, 0);

      return () => {
        window.clearTimeout(closeModalTimer);
      };
    }
  }, [paidState]);

  useEffect(() => {
    notifyActionResult(rejectedState, router);
  }, [rejectedState, router]);

  useEffect(() => {
    if (rejectedState.status === "success" && rejectedState.token > 0) {
      const closeModalTimer = window.setTimeout(() => {
        setIsRejectedModalOpen(false);
      }, 0);

      return () => {
        window.clearTimeout(closeModalTimer);
      };
    }
  }, [rejectedState]);

  useEffect(() => {
    notifyActionResult(correctionState, router);
  }, [correctionState, router]);

  useEffect(() => {
    if (deleteState.status === "idle" || deleteState.token === 0) {
      return;
    }

    if (deleteState.status === "success") {
      toast.success(deleteState.message, { duration: 5000 });
      const refreshTimer = window.setTimeout(() => {
        router.refresh();
      }, 560);

      return () => {
        window.clearTimeout(refreshTimer);
      };
    }

    toast.error(deleteState.message, { duration: 9000 });
  }, [deleteState, router]);

  const canDelete = serviceStatus !== "REIMBURSED" && invoice.status === "CREATED";
  const isRemoving = deleteState.status === "success" && deleteState.token > 0;
  const deleteBlockedReason =
    serviceStatus === "REIMBURSED"
      ? "Este servicio ya esta cerrado. No se puede modificar su estructura de facturas."
      : "Solo se pueden eliminar facturas en estado Created.";

  return (
    <div
      className={`overflow-hidden transition-all duration-450 ${
        isRemoving ? "mb-0 max-h-0 scale-[0.99] opacity-0" : "mb-4 max-h-[2200px] opacity-100 last:mb-0"
      }`}
    >
      <article
        className={`space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 ${isDeleting ? "opacity-65" : ""} ${
          isNewInvoice ? "invoice-new-highlight" : ""
        }`}
        id={`invoice-card-${invoice.id}`}
      >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-950">{invoice.invoiceNumber ?? "Factura pendiente"}</p>
          <p className="text-sm text-slate-600">
            {invoice.invoiceNumber ? `Factura ${index + 1}` : "Sin numero asignado"}
          </p>
          {isDeleting ? <p className="text-xs font-medium text-rose-700">Eliminando...</p> : null}
        </div>

        <div className="flex items-center gap-2">
          {invoice.createdManually ? (
            <span className="inline-flex rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
              Manual
            </span>
          ) : null}
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-sm font-medium ${toInvoiceStatusBadgeClass(invoice.status)}`}
          >
            {toDisplayInvoiceStatus(invoice.status)}
          </span>
          <form action={deleteFormAction}>
            <DeleteInvoiceButton isDisabled={!canDelete} disabledReason={deleteBlockedReason} isLoading={isDeleting} />
          </form>
        </div>
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
        <p>
          <span className="font-medium text-slate-900">Persona:</span>{" "}
          {people.find((person) => person.id === invoice.personId)?.displayName ?? "Sin asignar"}
        </p>
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-3 sm:space-y-4 sm:pt-4">
        <StageHint status={invoice.status} />

        {invoice.status === "CREATED" ? (
          <form action={completeFormAction} className="space-y-3 pt-1 sm:space-y-3.5">
            <p className="text-sm font-medium text-slate-900">Completar informacion de factura</p>
            <Field
              label="Persona imputada"
              htmlFor={`invoice-person-created-${invoice.id}`}
              helper="Este pago computara sobre el tope anual de esta persona."
            >
              <select
                id={`invoice-person-created-${invoice.id}`}
                className={inputBaseClassName}
                name="personId"
                defaultValue={invoice.personId ?? servicePersonId}
                required
              >
                <option value="">Selecciona una persona</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.displayName}
                  </option>
                ))}
              </select>
            </Field>
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
          <form action={claimFormAction} className="space-y-3 pt-1 sm:space-y-3.5">
            <p className="text-sm font-medium text-slate-900">Registrar referencia de reembolso</p>
            <Field label="Persona imputada" htmlFor={`invoice-person-claim-${invoice.id}`}>
              <select
                id={`invoice-person-claim-${invoice.id}`}
                className={inputBaseClassName}
                name="personId"
                defaultValue={invoice.personId ?? servicePersonId}
                required
              >
                <option value="">Selecciona una persona</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.displayName}
                  </option>
                ))}
              </select>
            </Field>
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
          <div className="space-y-3 pt-1">
            <p className="text-sm font-medium text-slate-700">Resolucion final de factura</p>
            <div className="grid gap-3 lg:grid-cols-2">
              <button
                className={paidPrimaryButtonClassName}
                type="button"
                disabled={isMarkingPaid}
                onClick={() => setIsPaidModalOpen(true)}
              >
                {isMarkingPaid ? "Guardando..." : "Marcar pagada"}
              </button>
              <button
                className={rejectedSecondaryButtonClassName}
                type="button"
                disabled={isMarkingRejected}
                onClick={() => setIsRejectedModalOpen(true)}
              >
                {isMarkingRejected ? "Guardando..." : "Marcar rechazada"}
              </button>
            </div>
          </div>
        ) : null}

        {invoice.status === "PAID" || invoice.status === "REJECTED" ? (
          <section className="space-y-2 pt-1 text-sm text-slate-700">
            <button
              className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              type="button"
              onClick={() => setIsCorrectionModalOpen(true)}
            >
              Corregir estado final
            </button>

            {invoice.correctedAt ? (
              <p className="border-l-2 border-slate-200 pl-2 text-xs text-slate-600 sm:truncate sm:whitespace-nowrap" title={buildCorrectionMetaLabel(invoice.correctedAt, invoice.correctedByUserName)}>
                {buildCorrectionMetaLabel(invoice.correctedAt, invoice.correctedByUserName)}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
      {isPaidModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby={`paid-title-${invoice.id}`}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <h3 className="text-base font-semibold text-slate-950" id={`paid-title-${invoice.id}`}>
              Registrar factura como pagada
            </h3>
            <p className="mt-1 text-sm text-slate-600">Indica importe y fecha para cerrar la factura como pagada.</p>
            <form action={paidFormAction} className="mt-4 space-y-3">
              <Field label="Persona imputada" htmlFor={`invoice-person-paid-${invoice.id}`} helper="Confirma la persona antes de cerrar en pagada.">
                <select
                  id={`invoice-person-paid-${invoice.id}`}
                  className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-200"
                  name="personId"
                  defaultValue={invoice.personId ?? servicePersonId}
                  required
                >
                  <option value="">Selecciona una persona</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.displayName}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                <p className="font-semibold">Confirmacion de imputacion anual</p>
                <p className="mt-1">
                  Se imputara a <strong>{people.find((person) => person.id === (invoice.personId ?? servicePersonId))?.displayName ?? "la persona seleccionada"}</strong> con aseguradora <strong>{serviceInsurerName}</strong>.
                </p>
              </div>
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
              <ActionFeedback result={paidState} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                  type="button"
                  onClick={() => setIsPaidModalOpen(false)}
                  disabled={isMarkingPaid}
                >
                  Cancelar
                </button>
                <button className={paidPrimaryButtonClassName} type="submit" disabled={isMarkingPaid}>
                  {isMarkingPaid ? "Guardando..." : "Confirmar pagada"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isRejectedModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby={`rejected-title-${invoice.id}`}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <h3 className="text-base font-semibold text-slate-950" id={`rejected-title-${invoice.id}`}>
              Registrar factura como rechazada
            </h3>
            <p className="mt-1 text-sm text-slate-600">Si lo necesitas, anade un motivo para la trazabilidad operativa.</p>
            <form action={rejectedFormAction} className="mt-4 space-y-3">
              <Field label="Persona imputada" htmlFor={`invoice-person-rejected-${invoice.id}`} helper="Se conserva para trazabilidad de imputacion.">
                <select
                  id={`invoice-person-rejected-${invoice.id}`}
                  className="w-full rounded-lg border border-rose-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus-visible:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200"
                  name="personId"
                  defaultValue={invoice.personId ?? servicePersonId}
                  required
                >
                  <option value="">Selecciona una persona</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.displayName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Motivo de rechazo" htmlFor={`rejectionReason-${invoice.id}`} helper="Opcional. Recomendado para trazabilidad operativa.">
                <input
                  id={`rejectionReason-${invoice.id}`}
                  className="w-full rounded-lg border border-rose-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus-visible:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200"
                  type="text"
                  name="rejectionReason"
                  defaultValue={invoice.rejectionReason ?? ""}
                />
              </Field>
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Persona imputada actual: <strong>{people.find((person) => person.id === (invoice.personId ?? servicePersonId))?.displayName ?? "sin asignar"}</strong>.
              </p>
              <ActionFeedback result={rejectedState} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                  type="button"
                  onClick={() => setIsRejectedModalOpen(false)}
                  disabled={isMarkingRejected}
                >
                  Cancelar
                </button>
                <button className="inline-flex w-full items-center justify-center rounded-lg bg-rose-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300" type="submit" disabled={isMarkingRejected}>
                  {isMarkingRejected ? "Guardando..." : "Confirmar rechazada"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isCorrectionModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`correction-title-${invoice.id}`}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
            <h3 className="text-base font-semibold text-slate-950" id={`correction-title-${invoice.id}`}>
              Corregir estado final de reembolso
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Vas a cambiar la factura de <strong>{toDisplayInvoiceStatus(invoice.status)}</strong> a{" "}
              <strong>{toDisplayInvoiceStatus(toCorrectionTargetStatus(invoice.status))}</strong>.
            </p>

            <form ref={correctionFormRef} action={correctionFormAction} className="mt-4 space-y-3">
              <input type="hidden" name="toStatus" value={toCorrectionTargetStatus(invoice.status)} />
              <Field label="Motivo de correccion" htmlFor={`correctionReason-${invoice.id}`} helper="Obligatorio. Describe por que corriges el estado final.">
                <textarea
                  id={`correctionReason-${invoice.id}`}
                  className={`${inputBaseClassName} min-h-24`}
                  name="correctionReason"
                  required
                />
              </Field>

              {invoice.status === "REJECTED" ? (
                <>
                  <Field label="Importe pagado" htmlFor={`correctionPaidAmount-${invoice.id}`} helper="Importe final reembolsado.">
                    <input
                      id={`correctionPaidAmount-${invoice.id}`}
                      className={inputBaseClassName}
                      type="text"
                      inputMode="decimal"
                      name="paidAmount"
                      defaultValue={String(invoice.paidAmount ?? invoice.invoiceExpectedAmount)}
                      required
                    />
                  </Field>
                  <Field label="Fecha de pago" htmlFor={`correctionPaidAt-${invoice.id}`}>
                    <input
                      id={`correctionPaidAt-${invoice.id}`}
                      className={inputBaseClassName}
                      type="date"
                      name="paidAt"
                      defaultValue={invoice.paidAt ? toInputDate(invoice.paidAt) : defaultPaidDate}
                      required
                    />
                  </Field>
                </>
              ) : (
                <Field label="Motivo de rechazo (opcional)" htmlFor={`correctionRejectionReason-${invoice.id}`}>
                  <input
                    id={`correctionRejectionReason-${invoice.id}`}
                    className={inputBaseClassName}
                    type="text"
                    name="rejectionReason"
                    defaultValue={invoice.rejectionReason ?? ""}
                  />
                </Field>
              )}

              <ActionFeedback result={correctionState} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  disabled={isCorrectingResolution}
                >
                  Cancelar
                </button>
                <button className={primaryButtonClassName} type="submit" disabled={isCorrectingResolution}>
                  {isCorrectingResolution ? "Guardando..." : "Confirmar correccion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      </article>
    </div>
  );
}

function notifyActionResult(result: InvoiceActionResult, router: ReturnType<typeof useRouter>) {
  if (result.status === "idle" || result.token === 0) {
    return;
  }

  if (result.status === "success") {
    toast.success(result.message, { duration: 5000 });
    router.refresh();

    return;
  }

  toast.error(result.message, { duration: 9000 });
}

function ActionLockButton({
  label,
  isDisabled,
  disabledReason,
  isLoading,
}: {
  label: string;
  isDisabled: boolean;
  disabledReason: string;
  isLoading: boolean;
}) {
  const [isBlockedSheetOpen, setIsBlockedSheetOpen] = useState(false);

  if (!isDisabled) {
    return (
      <button
        className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Anadiendo..." : label}
      </button>
    );
  }

  return (
    <>
      <div className="relative hidden sm:block group">
        <button
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-500"
          type="button"
          onClick={() => setIsBlockedSheetOpen(true)}
        >
          {label}
        </button>
        <div className="pointer-events-none absolute right-0 top-12 w-64 rounded-lg border border-slate-200 bg-slate-950 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {disabledReason}
        </div>
      </div>

      <button
        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-500 sm:hidden"
        type="button"
        onClick={() => setIsBlockedSheetOpen(true)}
      >
        {label}
      </button>

      <BlockedReasonOverlay
        isOpen={isBlockedSheetOpen}
        title="Accion no disponible"
        message={disabledReason}
        onClose={() => setIsBlockedSheetOpen(false)}
      />
    </>
  );
}

function ActionLockLink({
  href,
  label,
  isDisabled,
  disabledReason,
}: {
  href: string;
  label: string;
  isDisabled: boolean;
  disabledReason: string;
}) {
  const [isBlockedSheetOpen, setIsBlockedSheetOpen] = useState(false);

  if (!isDisabled) {
    return (
      <a
        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
        href={href}
      >
        {label}
      </a>
    );
  }

  return (
    <>
      <div className="relative hidden sm:block group">
        <button
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-500"
          type="button"
          onClick={() => setIsBlockedSheetOpen(true)}
        >
          {label}
        </button>
        <div className="pointer-events-none absolute right-0 top-12 w-64 rounded-lg border border-slate-200 bg-slate-950 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {disabledReason}
        </div>
      </div>

      <button
        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-500 sm:hidden"
        type="button"
        onClick={() => setIsBlockedSheetOpen(true)}
      >
        {label}
      </button>

      <BlockedReasonOverlay
        isOpen={isBlockedSheetOpen}
        title="Accion no disponible"
        message={disabledReason}
        onClose={() => setIsBlockedSheetOpen(false)}
      />
    </>
  );
}

function DeleteInvoiceButton({
  isDisabled,
  disabledReason,
  isLoading,
}: {
  isDisabled: boolean;
  disabledReason: string;
  isLoading: boolean;
}) {
  const [isBlockedSheetOpen, setIsBlockedSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <button
        aria-label="Eliminando factura"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-300 bg-white text-rose-700"
        type="button"
        disabled
      >
        <SpinnerIcon className="h-4 w-4" />
      </button>
    );
  }

  if (!isDisabled) {
    return (
      <button
        aria-label="Eliminar factura"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-300 bg-white text-rose-700 transition hover:bg-rose-50"
        type="submit"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <>
      <div className="relative hidden sm:block group">
        <button
          aria-label="Eliminar factura no disponible"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-400"
          type="button"
          onClick={() => setIsBlockedSheetOpen(true)}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
        <div className="pointer-events-none absolute right-0 top-11 w-64 rounded-lg border border-slate-200 bg-slate-950 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {disabledReason}
        </div>
      </div>

      <button
        aria-label="Eliminar factura no disponible"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-400 sm:hidden"
        type="button"
        onClick={() => setIsBlockedSheetOpen(true)}
      >
        <TrashIcon className="h-4 w-4" />
      </button>

      <BlockedReasonOverlay
        isOpen={isBlockedSheetOpen}
        title="Accion no disponible"
        message={disabledReason}
        onClose={() => setIsBlockedSheetOpen(false)}
      />
    </>
  );
}

function BlockedReasonOverlay({
  isOpen,
  title,
  message,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-4 sm:hidden" role="dialog" aria-modal="true">
      <button className="absolute inset-0" aria-label="Cerrar" type="button" onClick={onClose} />
      <section className="relative z-10 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
        <button
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800"
          type="button"
          onClick={onClose}
        >
          Entendido
        </button>
      </section>
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M9.5 4h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M8 7v12a1 1 0 001 1h6a1 1 0 001-1V7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
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
  const currentStep = toStageStep(status);
  const accent = toStepperAccent(status);
  const showNextAction = status !== "PAID" && status !== "REJECTED";

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-center gap-1.5">
        {STAGE_STEPS.map((step, index) => (
          <div className="contents" key={step.label}>
            <span className={toStepperCircleClass(step.value, currentStep, accent)} />
            {index < STAGE_STEPS.length - 1 ? <span className={toStepperLineClass(step.value, currentStep)} /> : null}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 text-[11px] font-medium text-slate-500">
        {STAGE_STEPS.map((step) => (
          <p className="text-left" key={`label-${step.label}`}>
            {step.label}
          </p>
        ))}
      </div>
      {showNextAction ? (
        <p className="mt-2">
          <span className="font-medium text-slate-900">Siguiente accion:</span> {toNextActionLabel(status)}
        </p>
      ) : null}
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
    <div className="space-y-1.5 sm:space-y-2">
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

const STAGE_STEPS = [
  { label: "Creada", value: 1 },
  { label: "Info", value: 2 },
  { label: "Ref", value: 3 },
  { label: "Resuelta", value: 4 },
] as const;

function toStageStep(status: Invoice["status"]): number {
  switch (status) {
    case "CREATED":
      return 1;
    case "INFORMATION_COMPLETED":
      return 2;
    case "CLAIM_REFERENCE_COMPLETED":
      return 3;
    case "PAID":
    case "REJECTED":
      return 4;
  }
}

function toStepperAccent(status: Invoice["status"]) {
  if (status === "PAID") {
    return {
      solid: "bg-emerald-600 border-emerald-600",
      glow: "shadow-[0_0_0_4px_rgba(16,185,129,0.18)]",
    };
  }

  if (status === "REJECTED") {
    return {
      solid: "bg-rose-600 border-rose-600",
      glow: "shadow-[0_0_0_4px_rgba(244,63,94,0.18)]",
    };
  }

  return {
    solid: "bg-slate-900 border-slate-900",
    glow: "shadow-[0_0_0_4px_rgba(51,65,85,0.16)]",
  };
}

function toStepperCircleClass(
  step: number,
  currentStep: number,
  accent: { solid: string; glow: string },
): string {
  const baseClassName = "h-3 w-3 rounded-full border";

  if (step < currentStep) {
    return `${baseClassName} border-slate-400 bg-slate-400`;
  }

  if (step === currentStep) {
    return `${baseClassName} ${accent.solid} ${accent.glow}`;
  }

  return `${baseClassName} border-slate-300 bg-white`;
}

function toStepperLineClass(step: number, currentStep: number): string {
  const baseClassName = "h-0.5 w-full rounded-full";

  if (step < currentStep) {
    return `${baseClassName} bg-slate-300`;
  }

  return `${baseClassName} bg-slate-200`;
}

function toInvoiceStatusBadgeClass(status: Invoice["status"]) {
  switch (status) {
    case "PAID":
      return "border-emerald-300 bg-emerald-100 text-emerald-900";
    case "REJECTED":
      return "border-rose-300 bg-rose-100 text-rose-900";
    case "CLAIM_REFERENCE_COMPLETED":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "INFORMATION_COMPLETED":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "CREATED":
      return "border-slate-300 bg-white text-slate-700";
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

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function buildCorrectionMetaLabel(correctedAt: Date, correctedByUserName: string | null) {
  const baseLabel = `Ultima correccion: ${formatDateTime(correctedAt)}`;

  if (!correctedByUserName) {
    return baseLabel;
  }

  return `${baseLabel} por ${correctedByUserName}`;
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

function toCorrectionTargetStatus(status: Invoice["status"]): Extract<Invoice["status"], "PAID" | "REJECTED"> {
  return status === "PAID" ? "REJECTED" : "PAID";
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
