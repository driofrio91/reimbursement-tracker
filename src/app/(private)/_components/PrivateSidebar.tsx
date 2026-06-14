import { signOut } from "@/lib/auth/auth";
import { PrivateSidebarMobile } from "@/app/(private)/_components/PrivateSidebarMobile";
import { PrivateSidebarNav } from "@/app/(private)/_components/PrivateSidebarNav";
import { UserRole } from "@/lib/auth/roles";

interface PrivateSidebarProps {
  userName?: string | null;
  role: UserRole;
}

export function PrivateSidebar({ userName, role }: PrivateSidebarProps) {
  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <>
      <PrivateSidebarMobile logoutAction={logoutAction} userName={userName} role={role} />

      <aside className="hidden border-r border-slate-200 bg-white md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto">
        <div className="flex h-full flex-col gap-6 p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Backoffice</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Reimbursement Tracker</p>
          </div>

          <PrivateSidebarNav role={role} />

          <div className="mt-auto space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              Usuario actual: <span className="font-medium text-slate-900">{userName || "Sin nombre"}</span>
            </p>
            <p className="text-sm text-slate-600">
              Rol: <span className="font-medium text-slate-900">{role}</span>
            </p>

            <form action={logoutAction}>
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
    </>
  );
}
