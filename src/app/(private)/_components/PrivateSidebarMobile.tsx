"use client";

import { useRef, useState } from "react";

import { PrivateSidebarNav } from "@/app/(private)/_components/PrivateSidebarNav";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserRole } from "@/lib/auth/roles";

interface PrivateSidebarMobileProps {
  logoutAction: () => Promise<void>;
  userName?: string | null;
  role: UserRole;
}

export function PrivateSidebarMobile({ logoutAction, userName, role }: PrivateSidebarMobileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="md:hidden">
      <Sheet
        open={isOpen}
        onOpenChange={(nextOpen) => {
          setIsOpen(nextOpen);
          if (!nextOpen) {
            requestAnimationFrame(() => {
              toggleButtonRef.current?.focus();
            });
          }
        }}
      >
        <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur">
          <div>
            <p className="text-xs font-medium text-slate-500">Backoffice</p>
            <p className="text-sm font-semibold text-slate-900">Reimbursement Tracker</p>
          </div>

          <SheetTrigger asChild>
            <button
              aria-controls="private-mobile-menu"
              aria-expanded={isOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700"
              ref={toggleButtonRef}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
            </button>
          </SheetTrigger>
        </div>

        <SheetContent side="left" open={isOpen} className="h-dvh overflow-y-auto pb-4 pt-5" id="private-mobile-menu">
          <SheetTitle className="sr-only">Menu de navegacion privada</SheetTitle>
          <div className="flex min-h-full flex-col">
            <PrivateSidebarNav onNavigate={() => setIsOpen(false)} role={role} />

            <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Usuario actual: <span className="font-medium text-slate-900">{userName || "Sin nombre"}</span>
              </p>
              <p className="text-sm text-slate-600">
                Rol: <span className="font-medium text-slate-900">{role}</span>
              </p>

              <form action={logoutAction}>
                <button
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white"
                  onClick={() => setIsOpen(false)}
                  type="submit"
                >
                  Cerrar sesion
                </button>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
