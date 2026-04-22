import { signOut } from "@/lib/auth/auth";
import { PrivateSidebarNav } from "@/app/(private)/_components/PrivateSidebarNav";

interface PrivateSidebarProps {
  userName?: string | null;
}

export function PrivateSidebar({ userName }: PrivateSidebarProps) {
  return (
    <aside className="border-b border-slate-200 bg-white md:min-h-screen md:border-b-0 md:border-r">
      <div className="flex h-full flex-col gap-6 p-5 md:p-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Backoffice</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Reimbursement Tracker</p>
        </div>

        <PrivateSidebarNav />

        <div className="mt-auto space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Usuario actual: <span className="font-medium text-slate-900">{userName || "Sin nombre"}</span>
          </p>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white"
              type="submit"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
