"use client";

import { useActionState } from "react";

import {
  CreateServiceFormState,
  initialCreateServiceFormState,
} from "@/modules/reimbursement/entrypoints/CreateServiceFormSchema";
import {
  ReferenceInsurer,
  ReferencePerson,
} from "@/modules/reimbursement/infrastructure/ReimbursementReferenceData";

interface CreateServiceFormProps {
  action: (
    state: CreateServiceFormState,
    formData: FormData,
  ) => Promise<CreateServiceFormState>;
  insurers: ReferenceInsurer[];
  people: ReferencePerson[];
}

export function CreateServiceForm({ action, insurers, people }: CreateServiceFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialCreateServiceFormState);

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Fecha del servicio" error={state.errors.serviceDate}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
            type="date"
            name="serviceDate"
            defaultValue={state.values.serviceDate}
            required
          />
        </Field>

        <Field label="Importe real" error={state.errors.actualAmount}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
            type="text"
            name="actualAmount"
            inputMode="decimal"
            placeholder="200.00"
            defaultValue={state.values.actualAmount}
            required
          />
        </Field>

        <Field label="Importe facturado por factura" error={state.errors.invoiceBilledAmount}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
            type="text"
            name="invoiceBilledAmount"
            inputMode="decimal"
            placeholder="55.00"
            defaultValue={state.values.invoiceBilledAmount}
            required
          />
        </Field>

        <Field label="Importe esperado por factura" error={state.errors.invoiceExpectedAmount}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
            type="text"
            name="invoiceExpectedAmount"
            inputMode="decimal"
            placeholder="49.50"
            defaultValue={state.values.invoiceExpectedAmount}
            required
          />
        </Field>

        <Field className="md:col-span-2" label="Concepto" error={state.errors.description}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
            type="text"
            name="description"
            defaultValue={state.values.description}
            required
          />
        </Field>

        <Field label="Persona" error={state.errors.personId}>
          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
            name="personId"
            defaultValue={state.values.personId}
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

        <Field label="Aseguradora" error={state.errors.insurerId}>
          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
            name="insurerId"
            defaultValue={state.values.insurerId}
            required
          >
            <option value="">Selecciona una aseguradora</option>
            {insurers.map((insurer) => (
              <option key={insurer.id} value={insurer.id}>
                {insurer.name}
              </option>
            ))}
          </select>
        </Field>

        <Field className="md:col-span-2" label="Titular" error={state.errors.policyHolderName}>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
            type="text"
            name="policyHolderName"
            defaultValue={state.values.policyHolderName}
            required
          />
        </Field>

        <Field className="md:col-span-2" label="Notas" error={state.errors.notes}>
          <textarea
            className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
            name="notes"
            defaultValue={state.values.notes}
          />
        </Field>
      </div>

      <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <input
          className="mt-1 h-4 w-4 rounded border-slate-300"
          type="checkbox"
          name="attended"
          defaultChecked={state.values.attended}
        />
        <span>La persona asistio o recibio efectivamente el servicio.</span>
      </label>

      {state.errors.form ? <p className="text-sm text-red-600">{state.errors.form}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          El servicio se creara con facturas autogeneradas para igualar o superar el importe real.
        </p>

        <button
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Guardando..." : "Crear servicio"}
        </button>
      </div>
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
