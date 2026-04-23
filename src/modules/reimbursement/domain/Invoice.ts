export type InvoiceStatus = "RECEIVED" | "SUBMITTED" | "REJECTED" | "REIMBURSED";

export interface Invoice {
  id: string;
  serviceId: string;
  requestId: string | null;
  invoiceNumber: string;
  invoiceDate: Date;
  amount: number;
  currency: string;
  issuerName: string;
  issuerTaxId: string | null;
  status: InvoiceStatus;
  reimbursedAmount: number | null;
  reimbursedAt: Date | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewInvoice {
  serviceId: string;
  requestId?: string | null;
  invoiceNumber: string;
  invoiceDate: Date;
  amount: number;
  currency: string;
  issuerName: string;
  issuerTaxId?: string | null;
  status: InvoiceStatus;
  reimbursedAmount?: number | null;
  reimbursedAt?: Date | null;
  rejectionReason?: string | null;
  notes?: string | null;
}
