import { auth, signOut } from "@/lib/auth/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 sm:px-10">
        <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              Sesion iniciada
            </span>
            <h1 className="text-4xl font-semibold tracking-tight">Reimbursement Tracker</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              La base tecnica ya esta lista con `Next.js`, `Prisma`, `Auth.js` y acceso autenticado para empezar el primer flujo de servicios reembolsables.
            </p>
            <p className="text-sm text-slate-500">
              Usuario actual: <span className="font-medium text-slate-900">{session?.user?.name}</span>
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              type="submit"
            >
              Cerrar sesion
            </button>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Ya disponible</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Conexion real a PostgreSQL en Neon.</li>
              <li>Schema Prisma de la V1.</li>
              <li>Seed con usuarios, aseguradoras y personas.</li>
              <li>Login con `email + password` y rutas protegidas.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Siguiente paso</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Implementar el primer caso de uso real: crear un servicio reembolsable y mostrar su listado y detalle sin meter logica de negocio en la UI.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
