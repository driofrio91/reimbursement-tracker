"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import {
  CreateInvoiceFormState,
  initialCreateInvoiceFormState,
} from "@/modules/reimbursement/entrypoints/CreateInvoiceFormSchema";

interface CreateInvoiceFormProps {
  action: (
    state: CreateInvoiceFormState,
    formData: FormData,
  ) => Promise<CreateInvoiceFormState>;
}

export function CreateInvoiceForm({ action }: CreateInvoiceFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialCreateInvoiceFormState);
  const latestNotificationNonceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state.notification) {
      return;
    }

    if (latestNotificationNonceRef.current === state.notification.nonce) {
      return;
    }

    latestNotificationNonceRef.current = state.notification.nonce;

    if (state.notification.type === "success") {
      toast.success(state.notification.message, { duration: 4500 });
      return;
    }

    toast.error(state.notification.message, { duration: 6000 });
  }, [state.notification]);

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Numero de factura" error={state.errors.invoiceNumber}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            type="text"
            name="invoiceNumber"
            defaultValue={state.values.invoiceNumber}
            placeholder="F-2026-001"
            required
          />
        </Field>

        <Field label="Fecha de factura" error={state.errors.invoiceDate}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            type="date"
            name="invoiceDate"
            defaultValue={state.values.invoiceDate}
            required
          />
        </Field>

        <Field label="Importe" error={state.errors.amount}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            type="text"
            name="amount"
            inputMode="decimal"
            placeholder="200.00"
            defaultValue={state.values.amount}
            required
          />
        </Field>

        <Field label="Emisor" error={state.errors.issuerName}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            type="text"
            name="issuerName"
            defaultValue={state.values.issuerName}
            placeholder="Clinica Central"
            required
          />
        </Field>

        <Field label="NIF/CIF emisor" error={state.errors.issuerTaxId}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            type="text"
            name="issuerTaxId"
            defaultValue={state.values.issuerTaxId}
            placeholder="B12345678"
          />
        </Field>

        <Field className="md:col-span-2" label="Notas" error={state.errors.notes}>
          <textarea
            className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            name="notes"
            defaultValue={state.values.notes}
          />
        </Field>
      </div>

      {state.errors.form ? <p className="text-sm text-red-600">{state.errors.form}</p> : null}

      <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">Se permite sobrefacturacion en esta fase.</p>
        <p>La validacion de exceso de importe se mostrara mas adelante como aviso operativo, sin bloquear el registro.</p>
      </div>

      <button
        className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Guardando..." : "Guardar factura"}
      </button>
    </form>
  );
}

function Field({
  children,
  className,
  error,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  error?: string;
  label: string;
}) {
  return (
    <label className={className ? `block space-y-2 ${className}` : "block space-y-2"}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
