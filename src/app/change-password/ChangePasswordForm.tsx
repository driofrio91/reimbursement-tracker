"use client";

import { useActionState } from "react";

import { changeOwnPasswordAction } from "@/app/change-password/actions";
import {
  ChangePasswordFormState,
  initialChangePasswordFormState,
} from "@/app/change-password/ChangePasswordFormState";

interface ChangePasswordFormProps {
  mustChangePasswordOnFirstLogin: boolean;
}

export function ChangePasswordForm({ mustChangePasswordOnFirstLogin }: ChangePasswordFormProps) {
  const [state, action, isPending] = useActionState<ChangePasswordFormState, FormData>(
    changeOwnPasswordAction,
    initialChangePasswordFormState,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
            Seguridad de cuenta
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Cambiar contrasena</h1>
          <p className="text-sm leading-6 text-slate-600">
            {mustChangePasswordOnFirstLogin
              ? "Debes cambiar tu contrasena antes de continuar en la aplicacion."
              : "Actualiza tu contrasena para mantener tu cuenta segura."}
          </p>
        </div>

        <form action={action} className="mt-8 space-y-5">
          <Field label="Contrasena actual" name="currentPassword" />
          <Field label="Nueva contrasena" name="newPassword" />
          <Field label="Confirmar nueva contrasena" name="confirmNewPassword" />

          {state.status === "error" ? <p className="text-sm text-red-600">{state.message}</p> : null}

          <button
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Guardar nueva contrasena"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, name }: { label: string; name: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-slate-400"
        type="password"
        name={name}
        required
      />
    </label>
  );
}
