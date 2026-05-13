import {
  CompleteInvoiceInformationInput,
  CorrectInvoiceResolutionInput,
  Invoice,
  InvoiceStatus,
  NewInvoice,
} from "@/modules/reimbursement/domain/Invoice";

export interface SearchInvoicesFilters {
  invoiceNumber?: string;
  claimReference?: string;
  status?: InvoiceStatus;
}

export interface PaidAmountByPersonInsurer {
  personId: string;
  insurerId: string;
  amount: number;
}

export interface InvoiceRepository {
  getById(invoiceId: string): Promise<Invoice | null>;
  search(filters: SearchInvoicesFilters): Promise<Invoice[]>;
  create(invoice: NewInvoice): Promise<Invoice>;
  createMany(invoices: NewInvoice[]): Promise<Invoice[]>;
  listByServiceId(serviceId: string): Promise<Invoice[]>;
  completeInformation(invoiceId: string, input: CompleteInvoiceInformationInput): Promise<Invoice | null>;
  setClaimReference(invoiceId: string, claimReference: string): Promise<Invoice | null>;
  setPerson(invoiceId: string, personId: string): Promise<Invoice | null>;
  markAsPaid(invoiceId: string, paidAmount: number, paidAt: Date): Promise<Invoice | null>;
  markAsRejected(invoiceId: string, rejectionReason?: string): Promise<Invoice | null>;
  correctResolution(invoiceId: string, input: CorrectInvoiceResolutionInput): Promise<Invoice | null>;
  getPaidAmountByPersonInsurerForYear(year: number): Promise<PaidAmountByPersonInsurer[]>;
}
