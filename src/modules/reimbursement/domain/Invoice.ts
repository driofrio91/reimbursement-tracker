export type InvoiceStatus =
  | "CREATED"
  | "INFORMATION_COMPLETED"
  | "CLAIM_REFERENCE_COMPLETED"
  | "PAID"
  | "REJECTED";

export interface Invoice {
  id: string;
  serviceId: string;
  insuranceHolderPersonId: string | null;
  insurerId: string | null;
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
  correctedAt: Date | null;
  correctionReason: string | null;
  correctedFromStatus: InvoiceStatus | null;
  correctedByUserId: string | null;
  correctedByUserName: string | null;
  notes: string | null;
  createdManually: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewInvoice {
  serviceId: string;
  insuranceHolderPersonId?: string | null;
  insurerId?: string | null;
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
  createdManually?: boolean;
}

export interface CompleteInvoiceInformationInput {
  invoiceNumber: string;
  invoiceDate: Date;
  issuerName: string;
  issuerTaxId?: string | null;
  notes?: string | null;
}

export interface CorrectInvoiceResolutionInput {
  toStatus: Extract<InvoiceStatus, "PAID" | "REJECTED">;
  correctionReason: string;
  correctedByUserId: string;
  correctedByUserName?: string | null;
  paidAmount?: number;
  paidAt?: Date;
  rejectionReason?: string | null;
}
