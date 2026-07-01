import { InvoiceRepository, SearchInvoicesFilters } from "@/modules/reimbursement/domain/InvoiceRepository";

export interface FilteredInvoicesCsv {
  content: string;
  filename: string;
}

export type BuildFilteredInvoicesCsvUseCaseErrorCode = "NO_INVOICES";

export class BuildFilteredInvoicesCsvUseCaseError extends Error {
  constructor(public readonly code: BuildFilteredInvoicesCsvUseCaseErrorCode, message: string) {
    super(message);
    this.name = "BuildFilteredInvoicesCsvUseCaseError";
  }
}

interface BuildFilteredInvoicesCsvUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "search">;
  now?: () => Date;
}

const CSV_HEADERS = ["TRATAMIENTO", "IMPORTE DE LA FACTURA", "TITULAR", "FECHA FACTURA", "SOLICITADA"];
const FIXED_TREATMENT = "FISIOTERAPIA - CERVICAL";

export async function buildFilteredInvoicesCsvUseCase(
  filters: SearchInvoicesFilters,
  dependencies: BuildFilteredInvoicesCsvUseCaseDependencies,
): Promise<FilteredInvoicesCsv> {
  const invoices = await dependencies.invoiceRepository.search(filters);

  if (invoices.length === 0) {
    throw new BuildFilteredInvoicesCsvUseCaseError("NO_INVOICES", "No hay facturas para exportar.");
  }

  const lines = [
    CSV_HEADERS.join(";"),
    ...invoices.map((invoice) => [FIXED_TREATMENT, formatDecimalComma(invoice.invoiceBilledAmount), "", "", ""].join(";")),
  ];
  const csvWithoutBom = lines.join("\r\n");
  const now = dependencies.now ? dependencies.now() : new Date();

  return {
    content: `\uFEFF${csvWithoutBom}`,
    filename: `facturas-filtradas-${formatTimestamp(now)}.csv`,
  };
}

function formatDecimalComma(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function formatTimestamp(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}${mm}${dd}-${hh}${min}`;
}
