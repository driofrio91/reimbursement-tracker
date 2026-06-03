"use client";

import { useActionState, useEffect, useState } from "react";

import {
  createInsurerAction,
  toggleInsurerActiveAction,
  updateInsurerAction,
} from "@/app/(private)/admin/insurers/actions";
import { initialAdminMutationState } from "@/app/(private)/admin/insurers/action-state";
import { InsurerAdminRecord } from "@/modules/reimbursement/application/AdminCatalogUseCases";
import { notifySuccess } from "@/lib/ui/notifications";

export function InsurersAdminClient({
  insurers,
  inUseById,
}: {
  insurers: InsurerAdminRecord[];
  inUseById: Record<string, boolean>;
}) {
  const [editing, setEditing] = useState<InsurerAdminRecord | null>(null);
  const [confirming, setConfirming] = useState<InsurerAdminRecord | null>(null);

  const [createState, createAction] = useActionState(createInsurerAction, initialAdminMutationState);
  const [updateState, updateAction] = useActionState(updateInsurerAction, initialAdminMutationState);
  const [toggleState, toggleAction] = useActionState(toggleInsurerActiveAction, initialAdminMutationState);

  useEffect(() => {
    if (createState.status === "success") notifySuccess(createState.message);
  }, [createState]);

  useEffect(() => {
    if (updateState.status === "success") {
      notifySuccess(updateState.message);
      setTimeout(() => setEditing(null), 0);
    }
  }, [updateState]);

  useEffect(() => {
    if (toggleState.status === "success") {
      notifySuccess(toggleState.message);
      setTimeout(() => setConfirming(null), 0);
    }
  }, [toggleState]);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Crear aseguradora</h2>
        <form action={createAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Nombre" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
          <input name="code" placeholder="Codigo" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
          <textarea name="notes" placeholder="Notas (opcional)" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm sm:col-span-2" />
          {createState.status === "error" ? <p className="text-sm text-rose-600 sm:col-span-2">{createState.message}</p> : null}
          <div className="sm:col-span-2">
            <button className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white" type="submit">Crear aseguradora</button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        {insurers.map((insurer) => {
          const inUse = inUseById[insurer.id] ?? false;
          return (
            <article key={insurer.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{insurer.name}</p>
                  <p className="text-xs text-slate-500">Codigo: {insurer.code}</p>
                </div>
                <span className={insurer.isActive ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700"}>
                  {insurer.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium" type="button" onClick={() => setEditing(insurer)}>Editar</button>
                <button
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={() => setConfirming(insurer)}
                  disabled={insurer.isActive && inUse}
                  title={insurer.isActive && inUse ? "No se puede desactivar porque esta en uso." : undefined}
                >
                  {insurer.isActive ? "Desactivar" : "Activar"}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
            <h3 className="text-base font-semibold text-slate-950">Editar aseguradora</h3>
            <form action={updateAction} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="insurerId" value={editing.id} />
              <input name="name" defaultValue={editing.name} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
              <input name="code" defaultValue={editing.code} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
              <select name="isActive" defaultValue={String(editing.isActive)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
              <textarea name="notes" defaultValue={editing.notes ?? ""} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
              {updateState.status === "error" ? <p className="text-sm text-rose-600 sm:col-span-2">{updateState.message}</p> : null}
              <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
                <button className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium" type="button" onClick={() => setEditing(null)}>Cancelar</button>
                <button className="rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-medium text-white" type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
            <h3 className="text-base font-semibold text-slate-950">{confirming.isActive ? "Desactivar aseguradora" : "Activar aseguradora"}</h3>
            <p className="mt-2 text-sm text-slate-600">
              {confirming.isActive
                ? "La aseguradora dejara de estar disponible para nuevos flujos. El historico seguira visible."
                : "La aseguradora volvera a estar disponible en nuevos flujos."}
            </p>
            <form action={toggleAction} className="mt-4 space-y-3">
              <input type="hidden" name="insurerId" value={confirming.id} />
              <input type="hidden" name="isActive" value={String(!confirming.isActive)} />
              {toggleState.status === "error" ? <p className="text-sm text-rose-600">{toggleState.message}</p> : null}
              <div className="grid gap-2 sm:grid-cols-2">
                <button className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium" type="button" onClick={() => setConfirming(null)}>Cancelar</button>
                <button className="rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-medium text-white" type="submit">{confirming.isActive ? "Desactivar" : "Activar"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
