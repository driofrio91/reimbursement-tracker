"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { USER_ROLES, UserRole } from "@/lib/auth/roles";

interface PrivateSidebarNavProps {
  onNavigate?: () => void;
  role: UserRole;
}

export function PrivateSidebarNav({ onNavigate, role }: PrivateSidebarNavProps) {
  const pathname = usePathname();

  const isHomeActive = pathname === "/";
  const isServicesExactActive = pathname === "/services";
  const isServicesSectionActive = pathname.startsWith("/services");
  const isNewServiceActive = pathname === "/services/new";
  const isInvoicesExactActive = pathname === "/invoices";
  const isInvoicesSectionActive = pathname.startsWith("/invoices");
  const isAccountActive = pathname === "/account";
  const isAdminUsersActive = pathname.startsWith("/admin/users");
  const isAdminPeopleActive = pathname.startsWith("/admin/people");
  const isAdminInsurersActive = pathname.startsWith("/admin/insurers");

  return (
    <nav className="space-y-2">
      <SidebarLink href="/" state={isHomeActive ? "page" : "idle"} label="Inicio" onNavigate={onNavigate} />

      <div className="space-y-1">
        <SidebarLink
          href="/services"
          state={isServicesExactActive ? "page" : isServicesSectionActive ? "section" : "idle"}
          label="Servicios"
          onNavigate={onNavigate}
        />

        <div className="pl-3">
          <SidebarSubLink
            href="/services/new"
            isActive={isNewServiceActive}
            label="Nuevo servicio"
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <SidebarLink
        href="/invoices"
        state={isInvoicesExactActive ? "page" : isInvoicesSectionActive ? "section" : "idle"}
        label="Facturas"
        onNavigate={onNavigate}
      />

      <SidebarLink href="/account" state={isAccountActive ? "page" : "idle"} label="Mi cuenta" onNavigate={onNavigate} />

      {role === USER_ROLES.ADMIN ? (
        <div className="space-y-1">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Administracion</p>
          <SidebarLink href="/admin/users" state={isAdminUsersActive ? "page" : "idle"} label="Usuarios" onNavigate={onNavigate} />
          <SidebarLink href="/admin/people" state={isAdminPeopleActive ? "page" : "idle"} label="Personas" onNavigate={onNavigate} />
          <SidebarLink href="/admin/insurers" state={isAdminInsurersActive ? "page" : "idle"} label="Aseguradoras" onNavigate={onNavigate} />
        </div>
      ) : null}
    </nav>
  );
}

function SidebarLink({
  href,
  label,
  onNavigate,
  state,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
  state: "page" | "section" | "idle";
}) {
  return (
    <Link
      aria-current={state === "page" ? "page" : undefined}
      className={
        state === "page"
          ? "inline-flex w-full items-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-900"
          : state === "section"
            ? "inline-flex w-full items-center rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800"
            : "inline-flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      }
      href={href}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}

function SidebarSubLink({
  href,
  isActive,
  label,
  onNavigate,
}: {
  href: string;
  isActive: boolean;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "inline-flex w-full items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900"
          : "inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
      }
      href={href}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}
