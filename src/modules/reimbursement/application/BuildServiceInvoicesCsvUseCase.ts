import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export interface ServiceInvoicesCsv {
  content: string;
  filename: string;
}

export type BuildServiceInvoicesCsvUseCaseErrorCode = "SERVICE_NOT_FOUND" | "NO_CREATED_INVOICES";

export class BuildServiceInvoicesCsvUseCaseError extends Error {
  constructor(public readonly code: BuildServiceInvoicesCsvUseCaseErrorCode, message: string) {
    super(message);
    this.name = "BuildServiceInvoicesCsvUseCaseError";
  }
}

interface BuildServiceInvoicesCsvUseCaseDependencies {
  serviceRepository: Pick<ServiceRepository, "getById">;
  invoiceRepository: Pick<InvoiceRepository, "listByServiceId">;
  now?: () => Date;
}

const CSV_HEADERS = ["TRATAMIENTO", "IMPORTE DE LA FACTURA", "TITULAR", "FECHA FACTURA", "SOLICITADA"];
const FIXED_TREATMENT = "FISIOTERAPIA - CERVICAL";

export async function buildServiceInvoicesCsvUseCase(
  serviceId: string,
  dependencies: BuildServiceInvoicesCsvUseCaseDependencies,
): Promise<ServiceInvoicesCsv> {
  const service = await dependencies.serviceRepository.getById(serviceId);

  if (!service) {
    throw new BuildServiceInvoicesCsvUseCaseError("SERVICE_NOT_FOUND", "El servicio seleccionado no existe.");
  }

  const invoices = await dependencies.invoiceRepository.listByServiceId(serviceId);
  const createdInvoices = invoices.filter((invoice) => invoice.status === "CREATED");

  if (createdInvoices.length === 0) {
    throw new BuildServiceInvoicesCsvUseCaseError(
      "NO_CREATED_INVOICES",
      "No hay facturas en estado Created para exportar.",
    );
  }

  const lines = [
    CSV_HEADERS.join(";"),
    ...createdInvoices.map((invoice) => [FIXED_TREATMENT, formatDecimalComma(invoice.invoiceBilledAmount), "", "", ""].join(";")),
  ];

  const csvWithoutBom = lines.join("\r\n");
  const now = dependencies.now ? dependencies.now() : new Date();

  return {
    content: `\uFEFF${csvWithoutBom}`,
    filename: `facturas-${sanitizeFilenamePart(service.description)}-${formatTimestamp(now)}.csv`,
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

function sanitizeFilenamePart(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "servicio";
}
