import {
  CompleteInvoiceInformationInput,
  Invoice,
  NewInvoice,
} from "@/modules/reimbursement/domain/Invoice";

export interface InvoiceRepository {
  getById(invoiceId: string): Promise<Invoice | null>;
  create(invoice: NewInvoice): Promise<Invoice>;
  createMany(invoices: NewInvoice[]): Promise<Invoice[]>;
  listByServiceId(serviceId: string): Promise<Invoice[]>;
  completeInformation(invoiceId: string, input: CompleteInvoiceInformationInput): Promise<Invoice | null>;
  setClaimReference(invoiceId: string, claimReference: string): Promise<Invoice | null>;
  markAsPaid(invoiceId: string, paidAmount: number, paidAt: Date): Promise<Invoice | null>;
  markAsRejected(invoiceId: string, rejectionReason?: string): Promise<Invoice | null>;
}
