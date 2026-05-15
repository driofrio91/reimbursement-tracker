"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createUserAction,
  toggleUserActiveAction,
  updateUserAction,
} from "@/app/(private)/admin/users/actions";
import { initialAdminMutationState } from "@/app/(private)/admin/users/action-state";
import { AdminUserRecord } from "@/lib/auth/application/AdminUserManagementUseCases";
import { USER_ROLES } from "@/lib/auth/roles";

export function UsersAdminClient({ users, actorId }: { users: AdminUserRecord[]; actorId: string }) {
  const [editing, setEditing] = useState<AdminUserRecord | null>(null);
  const [confirming, setConfirming] = useState<AdminUserRecord | null>(null);

  const [createState, createAction] = useActionState(createUserAction, initialAdminMutationState);
  const [updateState, updateAction] = useActionState(updateUserAction, initialAdminMutationState);
  const [toggleState, toggleAction] = useActionState(toggleUserActiveAction, initialAdminMutationState);

  useEffect(() => {
    if (createState.status === "success") toast.success(createState.message);
  }, [createState]);

  useEffect(() => {
    if (updateState.status === "success") {
      toast.success(updateState.message);
      setTimeout(() => setEditing(null), 0);
    }
  }, [updateState]);

  useEffect(() => {
    if (toggleState.status === "success") {
      toast.success(toggleState.message);
      setTimeout(() => setConfirming(null), 0);
    }
  }, [toggleState]);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Crear usuario</h2>
        <form action={createAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Nombre" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
          <input name="email" type="email" placeholder="Email" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
          <select name="role" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" defaultValue={USER_ROLES.USER}>
            <option value={USER_ROLES.USER}>USER</option>
            <option value={USER_ROLES.ADMIN}>ADMIN</option>
          </select>
          <input name="temporaryPassword" type="password" minLength={8} placeholder="Contrasena temporal" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
          {createState.status === "error" ? <p className="text-sm text-rose-600 sm:col-span-2">{createState.message}</p> : null}
          <div className="sm:col-span-2">
            <button className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white" type="submit">Crear usuario</button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        {users.map((user) => (
          <article key={user.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-600">{user.email}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span>Rol: {user.role}</span>
                  {user.mustChangePasswordOnFirstLogin ? <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">Cambio pendiente</span> : null}
                </div>
              </div>
              <span className={user.isActive ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700"}>
                {user.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium" type="button" onClick={() => setEditing(user)}>Editar</button>
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={() => setConfirming(user)}
                disabled={user.id === actorId && user.isActive}
                title={user.id === actorId && user.isActive ? "No puedes desactivar tu propio usuario." : undefined}
              >
                {user.isActive ? "Desactivar" : "Activar"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
            <h3 className="text-base font-semibold text-slate-950">Editar usuario</h3>
            <form action={updateAction} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="userId" value={editing.id} />
              <input name="name" defaultValue={editing.name} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
              <input name="email" type="email" defaultValue={editing.email} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
              <select name="role" defaultValue={editing.role} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
                <option value={USER_ROLES.USER}>USER</option>
                <option value={USER_ROLES.ADMIN}>ADMIN</option>
              </select>
              <select name="isActive" defaultValue={String(editing.isActive)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
              <input name="temporaryPassword" type="password" minLength={8} placeholder="Nueva temporal (opcional)" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm sm:col-span-2" />
              <p className="text-xs text-slate-500 sm:col-span-2">Si defines una nueva contrasena temporal, el usuario debera cambiarla en su siguiente inicio de sesion.</p>
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
            <h3 className="text-base font-semibold text-slate-950">{confirming.isActive ? "Desactivar usuario" : "Activar usuario"}</h3>
            <p className="mt-2 text-sm text-slate-600">
              {confirming.isActive
                ? "El usuario no podra iniciar sesion mientras permanezca desactivado. El historico administrativo seguira visible."
                : "El usuario volvera a poder iniciar sesion."}
            </p>
            <form action={toggleAction} className="mt-4 space-y-3">
              <input type="hidden" name="userId" value={confirming.id} />
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
