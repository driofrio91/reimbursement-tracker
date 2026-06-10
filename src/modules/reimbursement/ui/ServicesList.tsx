"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import type { InvoiceActionResult } from "@/app/(private)/services/[id]/invoice-action-state";
import { Service } from "@/modules/reimbursement/domain/Service";
import { notifyError, notifySuccess } from "@/lib/ui/notifications";

const initialActionResult: InvoiceActionResult = {
  status: "idle",
  message: "",
  token: 0,
};

interface ServicesListItem {
  service: Service;
  canDelete: boolean;
  deleteBlockedReason: string;
}

interface ServicesListProps {
  services: ServicesListItem[];
  deleteServiceAction: (
    serviceId: string,
    previousState: InvoiceActionResult,
    formData: FormData,
  ) => Promise<InvoiceActionResult>;
}

export function ServicesList({ services, deleteServiceAction }: ServicesListProps) {
  if (services.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Todavia no hay servicios</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Empieza creando el primer servicio reembolsable para sustituir el seguimiento manual.
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          href="/services/new"
        >
          Crear servicio
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {services.map((item) => (
        <ServiceListRow key={item.service.id} item={item} deleteServiceAction={deleteServiceAction} />
      ))}
    </section>
  );
}

function ServiceListRow({
  item,
  deleteServiceAction,
}: {
  item: ServicesListItem;
  deleteServiceAction: ServicesListProps["deleteServiceAction"];
}) {
  const deleteAction = deleteServiceAction.bind(null, item.service.id);
  const [deleteResult, deleteFormAction, isDeleting] = useActionState(deleteAction, initialActionResult);
  const isRemoving = deleteResult.status === "success" && deleteResult.token > 0;

  useEffect(() => {
    if (deleteResult.status === "idle" || deleteResult.token === 0) {
      return;
    }

    if (deleteResult.status === "success") {
      notifySuccess(deleteResult.message);
      return;
    }

    notifyError(deleteResult.message);
  }, [deleteResult]);

  return (
    <div
      className={`overflow-hidden transition-all duration-450 ${
        isRemoving ? "mb-0 max-h-0 scale-[0.99] opacity-0" : "mb-3 max-h-[400px] opacity-100"
      }`}
    >
      <article className={`rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm ${isDeleting ? "opacity-65" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/services/${item.service.id}`}
          className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label={`Ver servicio ${item.service.description}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{formatDate(item.service.serviceDate)}</p>
          <p className="mt-1 truncate text-base font-semibold text-slate-950">{item.service.description}</p>
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toStatusClassName(item.service.status)}`}
          >
            {toDisplayStatus(item.service.status)}
          </span>
          <form action={deleteFormAction}>
            <DeleteServiceButton
              isDisabled={!item.canDelete || isDeleting}
              disabledReason={item.deleteBlockedReason}
              isLoading={isDeleting}
            />
          </form>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <p>
          <span className="font-medium text-slate-900">Titular del seguro:</span> {item.service.insuranceHolderPersonName}
        </p>
        <p>
          <span className="font-medium text-slate-900">Aseguradora:</span> {item.service.insurerName}
        </p>
        <p>
          <span className="font-medium text-slate-900">Importe:</span> {formatCurrency(item.service.actualAmount, item.service.currency)}
        </p>
      </div>
      </article>
    </div>
  );
}

function DeleteServiceButton({
  isDisabled,
  disabledReason,
  isLoading,
}: {
  isDisabled: boolean;
  disabledReason: string;
  isLoading: boolean;
}) {
  const [isBlockedSheetOpen, setIsBlockedSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <button
        aria-label="Eliminando servicio"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-300 bg-white text-rose-700"
        type="button"
        disabled
      >
        <SpinnerIcon className="h-4 w-4" />
      </button>
    );
  }

  if (!isDisabled) {
    return (
      <button
        aria-label="Eliminar servicio"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-300 bg-white text-rose-700 transition hover:bg-rose-50"
        type="submit"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <>
      <div className="relative hidden sm:block group">
        <button
          aria-label="Eliminar servicio no disponible"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-400"
          type="button"
          onClick={() => setIsBlockedSheetOpen(true)}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
        <div className="pointer-events-none absolute right-0 top-11 z-20 w-80 max-w-[min(20rem,calc(100vw-2rem))] whitespace-normal rounded-lg border border-slate-200 bg-slate-950 px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {disabledReason}
        </div>
      </div>

      <button
        aria-label="Eliminar servicio no disponible"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-400 sm:hidden"
        type="button"
        onClick={() => setIsBlockedSheetOpen(true)}
      >
        <TrashIcon className="h-4 w-4" />
      </button>

      <BlockedReasonOverlay
        isOpen={isBlockedSheetOpen}
        title="Accion no disponible"
        message={disabledReason}
        onClose={() => setIsBlockedSheetOpen(false)}
      />
    </>
  );
}

function BlockedReasonOverlay({
  isOpen,
  title,
  message,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-4 sm:hidden" role="dialog" aria-modal="true">
      <button className="absolute inset-0" aria-label="Cerrar" type="button" onClick={onClose} />
      <section className="relative z-10 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
        <button
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800"
          type="button"
          onClick={onClose}
        >
          Entendido
        </button>
      </section>
    </div>
  );
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function toDisplayStatus(status: Service["status"]) {
  switch (status) {
    case "REGISTERED":
      return "Registrado";
    case "SUBMITTED":
      return "Enviado";
    case "REIMBURSED":
      return "Reembolsado";
  }
}

function toStatusClassName(status: Service["status"]) {
  switch (status) {
    case "REGISTERED":
      return "border-slate-300 bg-slate-100 text-slate-700";
    case "SUBMITTED":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "REIMBURSED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M9.5 4h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M8 7v12a1 1 0 001 1h6a1 1 0 001-1V7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
