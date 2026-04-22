"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface PrivateSidebarNavProps {
  onNavigate?: () => void;
}

export function PrivateSidebarNav({ onNavigate }: PrivateSidebarNavProps) {
  const pathname = usePathname();

  const isHomeActive = pathname === "/";
  const isServicesExactActive = pathname === "/services";
  const isServicesSectionActive = pathname.startsWith("/services");
  const isNewServiceActive = pathname === "/services/new";

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
