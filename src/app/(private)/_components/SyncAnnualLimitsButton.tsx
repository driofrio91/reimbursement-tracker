"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { syncAnnualLimitsAction } from "@/app/(private)/actions";
import {
  initialSyncAnnualLimitsActionResult,
  type SyncAnnualLimitsActionResult,
} from "@/app/(private)/sync-annual-limits-state";

export function SyncAnnualLimitsButton() {
  const [state, formAction, isPending] = useActionState<SyncAnnualLimitsActionResult, FormData>(
    syncAnnualLimitsAction,
    initialSyncAnnualLimitsActionResult,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <button
        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Sincronizando..." : "Sync anual"}
      </button>
    </form>
  );
}
