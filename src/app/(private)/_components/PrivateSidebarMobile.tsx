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
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const lastScrollYRef = useRef(0);

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

  useEffect(() => {
    const collapseThreshold = 56;
    const directionThreshold = 12;

    const handleScroll = () => {
      if (isOpen) {
        return;
      }

      const currentY = Math.max(window.scrollY, 0);
      const previousY = lastScrollYRef.current;
      const delta = currentY - previousY;

      if (currentY <= collapseThreshold) {
        setIsHeaderCollapsed(false);
      } else if (delta > directionThreshold) {
        setIsHeaderCollapsed(true);
      } else if (delta < -directionThreshold) {
        setIsHeaderCollapsed(false);
      }

      lastScrollYRef.current = currentY;
    };

    lastScrollYRef.current = Math.max(window.scrollY, 0);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  const headerClassName = isHeaderCollapsed
    ? "pointer-events-none sticky top-0 z-30 max-h-0 overflow-hidden opacity-0 transition-all duration-250 ease-out"
    : "pointer-events-auto sticky top-0 z-30 max-h-20 opacity-100 transition-all duration-250 ease-out";

  const floatingButtonClassName = isHeaderCollapsed && !isOpen
    ? "pointer-events-auto fixed right-4 top-3 z-30 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white/95 text-slate-700 shadow-md backdrop-blur transition duration-250 ease-out"
    : "pointer-events-none fixed right-4 top-3 z-30 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white/95 text-slate-700 opacity-0 transition duration-200 ease-out";

  return (
    <div className="md:hidden">
      <div className={headerClassName}>
        <div className="flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
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
      </div>

      <button
        aria-controls="private-mobile-menu"
        aria-expanded={isOpen}
        aria-label="Abrir menu"
        className={floatingButtonClassName}
        onClick={() => setIsOpen(true)}
        ref={isHeaderCollapsed ? toggleButtonRef : undefined}
        type="button"
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      </button>

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
          <PrivateSidebarNav onNavigate={closeMenu} role={role} />

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
