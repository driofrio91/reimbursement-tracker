import Link from "next/link";

import { PAGE_SIZE_OPTIONS, PaginationMetadata } from "@/modules/reimbursement/application/Pagination";

interface PaginationControlsProps {
  pagination: PaginationMetadata;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function PaginationControls({ pagination, basePath, searchParams = {} }: PaginationControlsProps) {
  if (pagination.totalItems === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Paginacion"
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-slate-600">
        Pagina {pagination.page} de {pagination.totalPages} · {pagination.totalItems} resultado
        {pagination.totalItems === 1 ? "" : "s"}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-slate-600" aria-label="Resultados por pagina">
          <span>Por pagina</span>
          <div className="flex overflow-hidden rounded-xl border border-slate-300">
            {PAGE_SIZE_OPTIONS.map((pageSize) => {
              const isActive = pageSize === pagination.pageSize;

              return (
                <Link
                  aria-current={isActive ? "true" : undefined}
                  className={`px-3 py-2 text-sm transition hover:bg-slate-100 ${isActive ? "bg-slate-950 text-white hover:bg-slate-950" : "text-slate-700"}`}
                  href={buildPageHref(basePath, searchParams, 1, pageSize)}
                  key={pageSize}
                >
                  {pageSize}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          {pagination.hasPreviousPage ? (
            <Link className={linkClassName} href={buildPageHref(basePath, searchParams, pagination.page - 1, pagination.pageSize)}>
              Anterior
            </Link>
          ) : (
            <span aria-disabled="true" className={disabledClassName}>
              Anterior
            </span>
          )}

          {pagination.hasNextPage ? (
            <Link className={linkClassName} href={buildPageHref(basePath, searchParams, pagination.page + 1, pagination.pageSize)}>
              Siguiente
            </Link>
          ) : (
            <span aria-disabled="true" className={disabledClassName}>
              Siguiente
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

export function buildPageHref(basePath: string, searchParams: Record<string, string>, page: number, pageSize: number): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  return `${basePath}?${params.toString()}`;
}

const linkClassName =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100";

const disabledClassName =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400";
