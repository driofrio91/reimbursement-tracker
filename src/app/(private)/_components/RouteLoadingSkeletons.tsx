import { ReactNode } from "react";

type LoadingPageShellProps = {
  maxWidthClassName: string;
  label: string;
  eyebrowWidthClassName?: string;
  titleWidthClassName?: string;
  descriptionWidthClassName?: string;
  children: ReactNode;
};

const skeletonClassName = "motion-safe:animate-pulse rounded bg-slate-200";
const subtleSkeletonClassName = "motion-safe:animate-pulse rounded bg-slate-100";

export function LoadingPageShell({
  maxWidthClassName,
  label,
  eyebrowWidthClassName,
  titleWidthClassName = "w-48",
  descriptionWidthClassName = "w-72",
  children,
}: LoadingPageShellProps) {
  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950" aria-busy="true" aria-live="polite">
      <p className="sr-only" role="status">
        {label}
      </p>
      <div className={`mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-10 sm:py-10 ${maxWidthClassName}`} aria-hidden="true">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm" />
            <div className="space-y-2">
              {eyebrowWidthClassName ? <SkeletonLine className={`h-4 ${eyebrowWidthClassName}`} subtle /> : null}
              <SkeletonLine className={`h-8 ${titleWidthClassName}`} />
              <SkeletonLine className={`h-4 max-w-full ${descriptionWidthClassName}`} subtle />
            </div>
          </div>
          <div className="h-11 w-full rounded-xl bg-slate-200 motion-safe:animate-pulse sm:w-36" />
        </div>

        {children}
      </div>
    </main>
  );
}

export function ServicesListLoading() {
  return (
    <LoadingPageShell maxWidthClassName="max-w-6xl" label="Cargando servicios..." titleWidthClassName="w-40" descriptionWidthClassName="w-80">
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <section key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonLine className="h-3 w-28" subtle />
                <SkeletonLine className="h-5 w-3/4" />
              </div>
              <SkeletonLine className="h-7 w-24 rounded-full" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <SkeletonLine className="h-4 w-full" subtle />
              <SkeletonLine className="h-4 w-full" subtle />
              <SkeletonLine className="h-4 w-full" subtle />
            </div>
          </section>
        ))}
      </div>
    </LoadingPageShell>
  );
}

export function ServiceDetailLoading() {
  return (
    <LoadingPageShell
      maxWidthClassName="max-w-5xl"
      label="Cargando detalle del servicio..."
      eyebrowWidthClassName="w-36"
      titleWidthClassName="w-56"
      descriptionWidthClassName="w-80"
    >
      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <SkeletonLine className="h-7 w-28 rounded-full" />
            <SkeletonLine className="h-8 w-64" />
          </div>
          <div className="h-20 rounded-2xl bg-slate-100 motion-safe:animate-pulse sm:w-56" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <SkeletonLine className="h-3 w-24" subtle />
              <SkeletonLine className="mt-3 h-6 w-28" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonLine key={index} className="h-4 w-full" subtle />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <SkeletonLine className="h-7 w-52" />
            <SkeletonLine className="h-4 w-80 max-w-full" subtle />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div className="h-10 rounded-xl bg-slate-200 motion-safe:animate-pulse sm:w-32" />
            <div className="h-10 rounded-xl bg-slate-100 motion-safe:animate-pulse sm:w-32" />
          </div>
        </div>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <SkeletonLine className="h-5 w-44" />
                <SkeletonLine className="h-4 w-28" subtle />
              </div>
              <SkeletonLine className="h-7 w-24 rounded-full" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((__, itemIndex) => (
                <SkeletonLine key={itemIndex} className="h-4 w-full" subtle />
              ))}
            </div>
          </div>
        ))}
      </section>
    </LoadingPageShell>
  );
}

export function InvoicesListLoading() {
  return (
    <LoadingPageShell maxWidthClassName="max-w-6xl" label="Cargando facturas..." titleWidthClassName="w-40" descriptionWidthClassName="w-80">
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonLine className="h-4 w-28" subtle />
                <div className="h-10 rounded-xl border border-slate-200 bg-slate-100 motion-safe:animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <SkeletonLine className="h-6 w-28" />
          <SkeletonLine className="mt-2 h-4 w-44" subtle />
        </div>
        <LoadingCardList count={3} />
      </section>
    </LoadingPageShell>
  );
}

export function InvoiceDetailLoading() {
  return (
    <LoadingPageShell
      maxWidthClassName="max-w-5xl"
      label="Cargando detalle de factura..."
      eyebrowWidthClassName="w-32"
      titleWidthClassName="w-48"
      descriptionWidthClassName="w-80"
    >
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <SkeletonLine className="h-4 w-20" subtle />
            <SkeletonLine className="h-7 w-56" />
          </div>
          <SkeletonLine className="h-8 w-24 rounded-full" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <SkeletonLine key={index} className="h-4 w-full" subtle />
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="h-10 rounded-xl bg-slate-100 motion-safe:animate-pulse sm:w-40" />
          <div className="h-10 rounded-xl bg-slate-200 motion-safe:animate-pulse sm:w-48" />
        </div>
      </section>
    </LoadingPageShell>
  );
}

export function AdminListPageLoading({ label, titleWidthClassName }: { label: string; titleWidthClassName: string }) {
  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950" aria-busy="true" aria-live="polite">
      <p className="sr-only" role="status">
        {label}
      </p>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8" aria-hidden="true">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SkeletonLine className={`h-7 ${titleWidthClassName}`} />
          <SkeletonLine className="mt-3 h-4 w-96 max-w-full" subtle />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SkeletonLine className="h-6 w-36" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 rounded-xl border border-slate-200 bg-slate-100 motion-safe:animate-pulse" />
            ))}
          </div>
        </section>
        <LoadingCardList count={3} />
      </div>
    </main>
  );
}

function LoadingCardList({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonLine className="h-5 w-48" />
              <SkeletonLine className="h-4 w-64 max-w-full" subtle />
            </div>
            <SkeletonLine className="h-7 w-20 rounded-full" />
          </div>
          <div className="mt-4 flex gap-2">
            <SkeletonLine className="h-9 w-20" subtle />
            <SkeletonLine className="h-9 w-24" subtle />
          </div>
        </article>
      ))}
    </div>
  );
}

function SkeletonLine({ className, subtle = false }: { className: string; subtle?: boolean }) {
  return <div className={`${subtle ? subtleSkeletonClassName : skeletonClassName} ${className}`} />;
}
