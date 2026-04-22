"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PrivateSidebarNav() {
  const pathname = usePathname();

  const isHomeActive = pathname === "/";
  const isServicesSectionActive = pathname.startsWith("/services");
  const isNewServiceActive = pathname === "/services/new";

  return (
    <nav className="space-y-2">
      <SidebarLink href="/" isActive={isHomeActive} label="Inicio" />

      <div className="space-y-1">
        <SidebarLink href="/services" isActive={isServicesSectionActive} label="Servicios" />

        <div className="pl-3">
          <SidebarSubLink href="/services/new" isActive={isNewServiceActive} label="Nuevo servicio" />
        </div>
      </div>
    </nav>
  );
}

function SidebarLink({ href, isActive, label }: { href: string; isActive: boolean; label: string }) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "inline-flex w-full items-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-900"
          : "inline-flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      }
      href={href}
    >
      {label}
    </Link>
  );
}

function SidebarSubLink({ href, isActive, label }: { href: string; isActive: boolean; label: string }) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "inline-flex w-full items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900"
          : "inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
      }
      href={href}
    >
      {label}
    </Link>
  );
}
