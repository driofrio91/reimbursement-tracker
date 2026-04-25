export type InvoiceStatus =
  | "CREATED"
  | "INFORMATION_COMPLETED"
  | "CLAIM_REFERENCE_COMPLETED"
  | "PAID"
  | "REJECTED";

export interface Invoice {
  id: string;
  serviceId: string;
  requestId: string | null;
  invoiceNumber: string | null;
  invoiceDate: Date | null;
  invoiceBilledAmount: number;
  invoiceExpectedAmount: number;
  currency: string;
  issuerName: string | null;
  issuerTaxId: string | null;
  claimReference: string | null;
  status: InvoiceStatus;
  paidAmount: number | null;
  paidAt: Date | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewInvoice {
  serviceId: string;
  requestId?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: Date | null;
  invoiceBilledAmount: number;
  invoiceExpectedAmount: number;
  currency: string;
  issuerName?: string | null;
  issuerTaxId?: string | null;
  claimReference?: string | null;
  status: InvoiceStatus;
  paidAmount?: number | null;
  paidAt?: Date | null;
  rejectionReason?: string | null;
  notes?: string | null;
}

export interface CompleteInvoiceInformationInput {
  invoiceNumber: string;
  invoiceDate: Date;
  issuerName: string;
  issuerTaxId?: string | null;
  notes?: string | null;
}
