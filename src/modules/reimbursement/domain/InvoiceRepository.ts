import {
  CompleteInvoiceInformationInput,
  CorrectInvoiceResolutionInput,
  Invoice,
  InvoiceStatus,
  NewInvoice,
} from "@/modules/reimbursement/domain/Invoice";
import { PaginatedResult, Pagination } from "@/modules/reimbursement/domain/Pagination";

export interface SearchInvoicesFilters {
  invoiceNumber?: string;
  claimReference?: string;
  status?: InvoiceStatus;
}

export interface PaidAmountByInsuranceHolderInsurer {
  insuranceHolderPersonId: string;
  insurerId: string;
  amount: number;
}

export interface InvoiceRepository {
  getById(invoiceId: string): Promise<Invoice | null>;
  search(filters: SearchInvoicesFilters): Promise<Invoice[]>;
  searchPaginated(filters: SearchInvoicesFilters, pagination: Pagination): Promise<PaginatedResult<Invoice>>;
  create(invoice: NewInvoice): Promise<Invoice>;
  createMany(invoices: NewInvoice[]): Promise<Invoice[]>;
  deleteDraftOrInformationCompleted(invoiceId: string): Promise<boolean>;
  listByServiceId(serviceId: string): Promise<Invoice[]>;
  listStatusesByServiceIds(serviceIds: string[]): Promise<Map<string, Pick<Invoice, "status">[]>>;
  completeInformation(invoiceId: string, input: CompleteInvoiceInformationInput): Promise<Invoice | null>;
  setClaimReference(invoiceId: string, claimReference: string): Promise<Invoice | null>;
  setInsuranceHolder(invoiceId: string, insuranceHolderPersonId: string): Promise<Invoice | null>;
  markAsPaid(invoiceId: string, paidAmount: number, paidAt: Date): Promise<Invoice | null>;
  markAsRejected(invoiceId: string, rejectionReason?: string): Promise<Invoice | null>;
  correctResolution(invoiceId: string, input: CorrectInvoiceResolutionInput): Promise<Invoice | null>;
  getPaidAmountByPersonInsurerForYear(year: number): Promise<PaidAmountByInsuranceHolderInsurer[]>;
}
