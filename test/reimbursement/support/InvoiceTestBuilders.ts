import { CreateInvoiceForServiceInput } from "@/modules/reimbursement/application/CreateInvoiceForServiceDto";
import { Invoice } from "@/modules/reimbursement/domain/Invoice";

export function buildCreateInvoiceForServiceInput(
  overrides: Partial<CreateInvoiceForServiceInput> = {},
): CreateInvoiceForServiceInput {
  return {
    serviceId: "service-1",
    invoiceNumber: "F-2026-001",
    invoiceDate: new Date("2026-04-22T00:00:00.000Z"),
    amount: 150,
    issuerName: "Clinica Central",
    issuerTaxId: "B12345678",
    notes: "Documento original archivado",
    ...overrides,
  };
}

export function buildInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "invoice-1",
    serviceId: "service-1",
    requestId: null,
    invoiceNumber: "F-2026-001",
    invoiceDate: new Date("2026-04-22T00:00:00.000Z"),
    amount: 150,
    currency: "EUR",
    issuerName: "Clinica Central",
    issuerTaxId: "B12345678",
    status: "RECEIVED",
    reimbursedAmount: null,
    reimbursedAt: null,
    rejectionReason: null,
    notes: "Documento original archivado",
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    updatedAt: new Date("2026-04-22T10:00:00.000Z"),
    ...overrides,
  };
}
