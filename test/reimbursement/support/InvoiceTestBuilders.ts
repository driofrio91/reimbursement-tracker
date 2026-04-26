import { Invoice } from "@/modules/reimbursement/domain/Invoice";

export function buildInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "invoice-1",
    serviceId: "service-1",
    invoiceNumber: null,
    invoiceDate: null,
    invoiceBilledAmount: 55,
    invoiceExpectedAmount: 49.5,
    currency: "EUR",
    issuerName: null,
    issuerTaxId: null,
    claimReference: null,
    status: "CREATED",
    paidAmount: null,
    paidAt: null,
    rejectionReason: null,
    notes: null,
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    updatedAt: new Date("2026-04-22T10:00:00.000Z"),
    ...overrides,
  };
}
