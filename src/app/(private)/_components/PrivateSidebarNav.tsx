"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
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
    <nav className="space-y-3">
      <div className="space-y-1">
        <SidebarLink href="/" state={isHomeActive ? "page" : "idle"} label="Inicio" icon={<HomeIcon />} onNavigate={onNavigate} />
        <SidebarLink
          href="/services"
          state={isServicesExactActive ? "page" : isServicesSectionActive ? "section" : "idle"}
          label="Servicios"
          icon={<ServicesIcon />}
          onNavigate={onNavigate}
        />
        <SidebarLink
          href="/invoices"
          state={isInvoicesExactActive ? "page" : isInvoicesSectionActive ? "section" : "idle"}
          label="Facturas"
          icon={<InvoiceIcon />}
          onNavigate={onNavigate}
        />
        <SidebarLink href="/account" state={isAccountActive ? "page" : "idle"} label="Mi cuenta" icon={<AccountIcon />} onNavigate={onNavigate} />
      </div>

      <SidebarCtaLink href="/services/new" isActive={isNewServiceActive} label="Nuevo servicio" onNavigate={onNavigate} />

      {role === USER_ROLES.ADMIN ? (
        <div className="space-y-1">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Administracion</p>
          <SidebarLink href="/admin/users" state={isAdminUsersActive ? "page" : "idle"} label="Usuarios" icon={<UsersIcon />} onNavigate={onNavigate} />
          <SidebarLink href="/admin/people" state={isAdminPeopleActive ? "page" : "idle"} label="Personas" icon={<PeopleIcon />} onNavigate={onNavigate} />
          <SidebarLink href="/admin/insurers" state={isAdminInsurersActive ? "page" : "idle"} label="Aseguradoras" icon={<ShieldIcon />} onNavigate={onNavigate} />
        </div>
      ) : null}
    </nav>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  onNavigate,
  state,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  onNavigate?: () => void;
  state: "page" | "section" | "idle";
}) {
  return (
    <Link
      aria-current={state === "page" ? "page" : undefined}
      className={
        state === "page"
          ? "inline-flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-900"
          : state === "section"
            ? "inline-flex w-full items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800"
            : "inline-flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
      }
      href={href}
      onClick={onNavigate}
    >
      <span aria-hidden="true" className="text-slate-500">
        {icon}
      </span>
      {label}
    </Link>
  );
}

function SidebarCtaLink({
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
          ? "inline-flex w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white"
          : "inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
      }
      href={href}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}

function HomeIcon() {
  return <IconPath d="M3.75 10.5 12 4l8.25 6.5v8.25a1.5 1.5 0 0 1-1.5 1.5h-4.5v-5.25h-4.5v5.25h-4.5a1.5 1.5 0 0 1-1.5-1.5V10.5Z" />;
}

function ServicesIcon() {
  return <IconPath d="M4 7.5h16M4 12h16M4 16.5h10" />;
}

function InvoiceIcon() {
  return <IconPath d="M7.5 4.5h9l3 3v12h-15v-15h3Zm1.5 7h6m-6 3h6" />;
}

function AccountIcon() {
  return <IconPath d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 7a6 6 0 0 1 12 0" />;
}

function UsersIcon() {
  return <IconPath d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a2.5 2.5 0 1 0 0-5M3.5 19a5.5 5.5 0 0 1 11 0m1.5 0a4.5 4.5 0 0 1 4.5-4" />;
}

function PeopleIcon() {
  return <IconPath d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 7a6 6 0 0 1 12 0" />;
}

function ShieldIcon() {
  return <IconPath d="M12 3.5 5.5 6v5.2c0 4 2.6 7.6 6.5 9.3 3.9-1.7 6.5-5.3 6.5-9.3V6L12 3.5Z" />;
}

function IconPath({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d={d} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}
