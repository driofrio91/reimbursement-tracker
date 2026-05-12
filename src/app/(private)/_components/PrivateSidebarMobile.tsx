"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PrivateSidebarNav } from "@/app/(private)/_components/PrivateSidebarNav";
import { UserRole } from "@/lib/auth/roles";

interface PrivateSidebarMobileProps {
  logoutAction: () => Promise<void>;
  userName?: string | null;
  role: UserRole;
}

export function PrivateSidebarMobile({ logoutAction, userName, role }: PrivateSidebarMobileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      toggleButtonRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Backoffice</p>
          <p className="text-sm font-semibold text-slate-900">Reimbursement Tracker</p>
        </div>

        <button
          aria-controls="private-mobile-menu"
          aria-expanded={isOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700"
          onClick={() => {
            if (isOpen) {
              closeMenu();
              return;
            }

            setIsOpen(true);
          }}
          ref={toggleButtonRef}
          type="button"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          </svg>
        </button>
      </div>

      <div
        className={
          isOpen
            ? "pointer-events-auto fixed inset-0 z-40"
            : "pointer-events-none fixed inset-0 z-40"
        }
      >
        <button
          aria-label="Cerrar menu"
          className={
            isOpen
              ? "absolute inset-0 bg-slate-900/35 opacity-100 transition-opacity duration-300 ease-out motion-reduce:transition-none"
              : "absolute inset-0 bg-slate-900/35 opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none"
          }
          onClick={closeMenu}
          type="button"
        />

        <aside
          className={
            isOpen
              ? "relative z-10 flex h-full w-[280px] translate-x-0 transform flex-col gap-6 border-r border-slate-200 bg-white p-5 shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none"
              : "relative z-10 flex h-full w-[280px] -translate-x-full transform flex-col gap-6 border-r border-slate-200 bg-white p-5 shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none"
          }
          id="private-mobile-menu"
        >
          <PrivateSidebarNav onNavigate={closeMenu} />

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
        </aside>
      </div>
    </div>
  );
}
