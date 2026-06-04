"use client";

import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import type { InvoiceActionResult } from "@/app/(private)/services/[id]/invoice-action-state";

type CorrectionSourceStatus = Extract<Invoice["status"], "PAID" | "REJECTED">;

interface InvoiceCorrectionModalProps {
  invoice: Invoice;
  sourceStatus: CorrectionSourceStatus;
  isOpen: boolean;
  defaultPaidDate: string;
  correctionState: InvoiceActionResult;
  correctionFormAction: (formData: FormData) => void;
  isCorrectingResolution: boolean;
  inputBaseClassName: string;
  primaryButtonClassName: string;
  onClose: () => void;
}

export function InvoiceCorrectionModal({
  invoice,
  sourceStatus,
  isOpen,
  defaultPaidDate,
  correctionState,
  correctionFormAction,
  isCorrectingResolution,
  inputBaseClassName,
  primaryButtonClassName,
  onClose,
}: InvoiceCorrectionModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
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
          Vas a cambiar la factura de <strong>{toDisplayInvoiceStatus(sourceStatus)}</strong> a{" "}
          <strong>{toDisplayInvoiceStatus(toCorrectionTargetStatus(sourceStatus))}</strong>.
        </p>

        <form action={correctionFormAction} className="mt-4 space-y-3">
          <input type="hidden" name="toStatus" value={toCorrectionTargetStatus(sourceStatus)} />
          <Field label="Motivo de correccion" htmlFor={`correctionReason-${invoice.id}`} helper="Obligatorio. Describe por que corriges el estado final.">
            <textarea
              id={`correctionReason-${invoice.id}`}
              className={`${inputBaseClassName} min-h-24`}
              name="correctionReason"
              required
            />
          </Field>

          {sourceStatus === "REJECTED" ? (
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
              onClick={onClose}
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
      <label className="block text-sm font-medium text-slate-700" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {helper ? <p className="text-xs text-slate-500/90">{helper}</p> : null}
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

function toInputDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toCorrectionTargetStatus(status: CorrectionSourceStatus): CorrectionSourceStatus {
  return status === "PAID" ? "REJECTED" : "PAID";
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
