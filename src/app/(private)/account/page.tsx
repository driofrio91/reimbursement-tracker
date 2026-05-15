import { ChangePasswordForm } from "@/app/change-password/ChangePasswordForm";
import { requireAuth } from "@/lib/auth/authorization";

export default async function AccountPage() {
  const actor = await requireAuth();

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Mi cuenta</h1>
          <p className="mt-2 text-sm text-slate-600">Gestiona tu acceso y actualiza tu contrasena.</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Nombre</dt>
              <dd className="font-medium text-slate-900">{actor.name ?? "Sin nombre"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{actor.email ?? "Sin email"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Rol</dt>
              <dd className="font-medium text-slate-900">{actor.role}</dd>
            </div>
          </dl>
        </section>

        <ChangePasswordForm mustChangePasswordOnFirstLogin={actor.mustChangePasswordOnFirstLogin} embedded />
      </div>
    </main>
  );
}
