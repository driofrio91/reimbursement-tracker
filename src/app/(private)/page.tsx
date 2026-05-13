import Link from "next/link";
import { ReactNode, Suspense } from "react";

import { requireAuth } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { SyncAnnualLimitsButtonBase } from "@/app/(private)/_components/SyncAnnualLimitsButton";
import {
  AnnualLimitDashboardRow,
  AnnualLimitTrafficLight,
  getAnnualLimitsDashboardUseCase,
} from "@/modules/reimbursement/application/GetAnnualLimitsDashboardUseCase";
import { PrismaPersonAnnualReimbursementLimitRepository } from "@/modules/reimbursement/infrastructure/PrismaPersonAnnualReimbursementLimitRepository";
import { prisma } from "@/lib/db/prisma";

interface HomePageProps {
  searchParams?: Promise<{ historyYear?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const actor = await requireAuth();
  const currentYear = new Date().getUTCFullYear();
  const resolvedParams = (await searchParams) ?? {};
  const selectedHistoryYear = normalizeHistoryYear(resolvedParams.historyYear, currentYear);

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Home operativa</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Topes anuales {currentYear}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Visibilidad global del consumo anual por persona y aseguradora.</p>
          <p className="mt-2 text-sm text-slate-500">
            Usuario actual: <span className="font-medium text-slate-900">{actor.name}</span>
          </p>
        </section>

        <Suspense fallback={<AnnualLimitsDashboardSkeleton compact={false} />}>
          <AnnualLimitsDashboardSection
            year={currentYear}
            canSync={actor.role === USER_ROLES.ADMIN}
            title="Consumo anual actual"
            description="Barras por persona y aseguradora con semaforo de consumo."
            compact={false}
          />
        </Suspense>

        <Suspense fallback={<AnnualLimitsDashboardSkeleton compact={true} />}>
          <AnnualLimitsHistoricalSection
            year={selectedHistoryYear}
            currentYear={currentYear}
            canSync={actor.role === USER_ROLES.ADMIN}
          />
        </Suspense>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Accesos rapidos</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800"
                href="/services/new"
              >
                Crear servicio
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                href="/services"
              >
                Ver listado de servicios
              </Link>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Ya disponible</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Conexion real a PostgreSQL en Neon.</li>
              <li>Schema Prisma de la V1.</li>
              <li>Seed con usuarios, aseguradoras y personas.</li>
              <li>Login con `email + password` y rutas protegidas.</li>
              <li>Alta de servicio reembolsable con validacion en servidor.</li>
              <li>Listado y detalle inicial de servicios.</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}

async function AnnualLimitsHistoricalSection({
  year,
  currentYear,
  canSync,
}: {
  year: number;
  currentYear: number;
  canSync: boolean;
}) {
  const previousYear = year - 1;
  const nextYear = year + 1;
  const isNextDisabled = nextYear >= currentYear;

  return (
    <AnnualLimitsDashboardSection
      year={year}
      canSync={canSync}
      title={`Historico anual ${year}`}
      description="Consulta anos pasados sin bloquear el bloque principal del ano actual."
      compact={true}
      navSlot={
        <div className="flex items-center gap-2">
          <Link
            aria-label={`Ir al ano ${previousYear}`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            href={`/?historyYear=${previousYear}`}
          >
            {`← ${previousYear}`}
          </Link>
          <span
            aria-label={`Ano seleccionado ${year}`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-700"
          >
            {year}
          </span>
          {isNextDisabled ? (
            <span
              aria-label={`Ano ${nextYear} no disponible`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-400"
            >
              {`${nextYear} →`}
            </span>
          ) : (
            <Link
              aria-label={`Ir al ano ${nextYear}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              href={`/?historyYear=${nextYear}`}
            >
              {`${nextYear} →`}
            </Link>
          )}
        </div>
      }
    />
  );
}

async function AnnualLimitsDashboardSection({
  year,
  canSync,
  title,
  description,
  compact,
  navSlot,
}: {
  year: number;
  canSync: boolean;
  title: string;
  description: string;
  compact: boolean;
  navSlot?: ReactNode;
}) {
  const rows = await getAnnualLimitsDashboardUseCase(year, {
    annualLimitRepository: new PrismaPersonAnnualReimbursementLimitRepository(prisma),
  });

  return (
    <section className={compact ? "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" : "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={compact ? "text-base font-semibold text-slate-950 sm:text-lg" : "text-lg font-semibold text-slate-950 sm:text-xl"}>{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <SyncAnnualLimitsButtonBase canSync={canSync} year={year} />
      </div>

      {navSlot ? <div className="mt-4">{navSlot}</div> : null}

      {rows.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
          Sin datos para {year}.
        </p>
      ) : (
        <div className={compact ? "mt-4 space-y-2" : "mt-5 space-y-3"}>
          {rows.map((row) => (
            <AnnualLimitRow key={`${row.personId}:${row.insurerId}`} row={row} compact={compact} />
          ))}
        </div>
      )}
    </section>
  );
}

function AnnualLimitRow({ row, compact }: { row: AnnualLimitDashboardRow; compact: boolean }) {
  return (
    <article className={compact ? "rounded-xl border border-slate-200 bg-slate-50 p-3" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{row.personDisplayName}</p>
          <p className="text-xs text-slate-500">{row.insurerName}</p>
        </div>
        <span className={badgeClassName(row.trafficLight)}>{toTrafficLightLabel(row.trafficLight)}</span>
      </div>

      <p className="mt-3 text-sm font-medium text-slate-800">
        {formatCurrency(row.reimbursedAccumulated, row.currency)} / {formatCurrency(row.annualLimitAmount, row.currency)}
      </p>

      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={progressClassName(row.trafficLight)} style={{ width: `${row.progressPercentage}%` }} />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
        <span>{formatPercentage(row.percentageUsed)}</span>
        <span>
          {row.excessAmount > 0
            ? `Exceso: ${formatCurrency(row.excessAmount, row.currency)}`
            : `Disponible: ${formatCurrency(row.remainingAmount, row.currency)}`}
        </span>
      </div>
    </article>
  );
}

function AnnualLimitsDashboardSkeleton({ compact }: { compact: boolean }) {
  return (
    <section className={compact ? "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" : "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"} aria-hidden="true">
      <div className={compact ? "h-5 w-44 animate-pulse rounded bg-slate-200" : "h-6 w-56 animate-pulse rounded bg-slate-200"} />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />
      <div className="mt-4 space-y-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </section>
  );
}

function badgeClassName(trafficLight: AnnualLimitTrafficLight) {
  if (trafficLight === "green") {
    return "inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700";
  }

  if (trafficLight === "amber") {
    return "inline-flex rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700";
  }

  return "inline-flex rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700";
}

function progressClassName(trafficLight: AnnualLimitTrafficLight) {
  if (trafficLight === "green") {
    return "h-full rounded-full bg-emerald-500";
  }

  if (trafficLight === "amber") {
    return "h-full rounded-full bg-amber-500";
  }

  return "h-full rounded-full bg-rose-500";
}

function toTrafficLightLabel(trafficLight: AnnualLimitTrafficLight) {
  if (trafficLight === "green") {
    return "Disponible";
  }

  if (trafficLight === "amber") {
    return "En riesgo";
  }

  return "Excedido";
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatPercentage(value: number) {
  return `${Math.round(value)}% consumido`;
}

function normalizeHistoryYear(rawHistoryYear: string | undefined, currentYear: number) {
  const fallback = currentYear - 1;

  if (!rawHistoryYear) {
    return fallback;
  }

  const parsed = Number(rawHistoryYear);

  if (!Number.isInteger(parsed) || parsed >= currentYear) {
    return fallback;
  }

  return parsed;
}
