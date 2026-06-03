"use client";

import { useActionState, useEffect, useState } from "react";

import { syncAnnualLimitsAction } from "@/app/(private)/actions";
import {
  initialSyncAnnualLimitsActionResult,
  type SyncAnnualLimitsActionResult,
} from "@/app/(private)/sync-annual-limits-state";
import { notifyError, notifySuccess } from "@/lib/ui/notifications";

export function SyncAnnualLimitsButton() {
  return <SyncAnnualLimitsButtonBase canSync={true} />;
}

interface SyncAnnualLimitsButtonBaseProps {
  canSync: boolean;
  year?: number;
}

export function SyncAnnualLimitsButtonBase({ canSync, year }: SyncAnnualLimitsButtonBaseProps) {
  const [state, formAction, isPending] = useActionState<SyncAnnualLimitsActionResult, FormData>(
    syncAnnualLimitsAction,
    initialSyncAnnualLimitsActionResult,
  );
  const [isBlockedSheetOpen, setIsBlockedSheetOpen] = useState(false);

  useEffect(() => {
    if (!canSync) {
      return;
    }

    if (state.status === "success") {
      notifySuccess(state.message);
    }

    if (state.status === "error") {
      notifyError(state.message);
    }
  }, [canSync, state]);

  if (!canSync) {
    return (
      <>
        <div className="relative hidden md:block">
          <button
            aria-label="Sincronizar topes anuales"
            className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-400 opacity-80"
            type="button"
            onClick={() => setIsBlockedSheetOpen(true)}
          >
            <SyncIcon className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute right-0 top-12 w-56 rounded-lg border border-slate-200 bg-slate-950 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Solo un ADMIN puede ejecutar Sync.
          </div>
        </div>

        <button
          aria-label="Sincronizar topes anuales"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-400 opacity-80 md:hidden"
          type="button"
          onClick={() => setIsBlockedSheetOpen(true)}
        >
          <SyncIcon className="h-4 w-4" />
        </button>

        {isBlockedSheetOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-4 md:hidden" role="dialog" aria-modal="true" aria-labelledby="sync-locked-title">
            <button className="absolute inset-0" aria-label="Cerrar" type="button" onClick={() => setIsBlockedSheetOpen(false)} />
            <section className="relative z-10 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-950" id="sync-locked-title">Accion no disponible</h3>
              <p className="mt-1 text-sm text-slate-600">Solo un ADMIN puede ejecutar Sync.</p>
              <button
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800"
                type="button"
                onClick={() => setIsBlockedSheetOpen(false)}
              >
                Entendido
              </button>
            </section>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <form action={formAction}>
      {typeof year === "number" ? <input type="hidden" name="year" value={String(year)} /> : null}
      <button
        aria-label={isPending ? "Sincronizando topes anuales" : "Sincronizar topes anuales"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isPending}
      >
        <SyncIcon className={isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
      </button>
    </form>
  );
}

function SyncIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8.5V4m0 0h-4.5M20 4l-4.2 4.2a6.5 6.5 0 00-10.6 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M4 15.5V20m0 0h4.5M4 20l4.2-4.2a6.5 6.5 0 0010.6-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
