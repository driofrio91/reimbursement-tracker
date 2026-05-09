import { HomeIconLink } from "@/app/(private)/_components/HomeIconLink";
import { searchInvoicesUseCase } from "@/modules/reimbursement/application/SearchInvoicesUseCase";
import { InvoiceStatus } from "@/modules/reimbursement/domain/Invoice";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { InvoicesSearchView } from "@/modules/reimbursement/ui/InvoicesSearchView";
import { prisma } from "@/lib/db/prisma";

const invoiceStatuses: InvoiceStatus[] = [
  "CREATED",
  "INFORMATION_COMPLETED",
  "CLAIM_REFERENCE_COMPLETED",
  "PAID",
  "REJECTED",
];

interface InvoicesPageSearchParams {
  invoiceNumber?: string | string[];
  claimReference?: string | string[];
  status?: string | string[];
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<InvoicesPageSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const invoiceNumber = getSingleQueryParam(resolvedSearchParams.invoiceNumber).trim();
  const claimReference = getSingleQueryParam(resolvedSearchParams.claimReference).trim();
  const statusValue = getSingleQueryParam(resolvedSearchParams.status).trim();
  const status = invoiceStatuses.find((item) => item === statusValue);

  const invoices = await searchInvoicesUseCase(
    {
      invoiceNumber: invoiceNumber || undefined,
      claimReference: claimReference || undefined,
      status,
    },
    {
      invoiceRepository: new PrismaInvoiceRepository(prisma),
    },
  );

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-10 sm:py-10">
        <div className="flex items-start gap-3">
          <HomeIconLink />

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Facturas</h1>
            <p className="mt-1 text-sm text-slate-600">Buscador operativo con acceso directo a detalle y servicio.</p>
          </div>
        </div>

        <InvoicesSearchView
          invoices={invoices}
          filters={{
            invoiceNumber,
            claimReference,
            status: status ?? "",
          }}
        />
      </div>
    </main>
  );
}

function getSingleQueryParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
