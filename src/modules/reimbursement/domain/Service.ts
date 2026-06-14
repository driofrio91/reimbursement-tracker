export type ServiceStatus = "REGISTERED" | "SUBMITTED" | "REIMBURSED";

export interface Service {
  id: string;
  serviceDate: Date;
  description: string;
  actualAmount: number;
  invoiceBilledAmount: number;
  invoiceExpectedAmount: number;
  currency: string;
  insuranceHolderPersonId: string;
  insuranceHolderPersonName: string;
  insurerId: string;
  insurerName: string;
  serviceRecipientName: string;
  attended: boolean;
  status: ServiceStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewService {
  serviceDate: Date;
  description: string;
  actualAmount: number;
  invoiceBilledAmount: number;
  invoiceExpectedAmount: number;
  currency: string;
  insuranceHolderPersonId: string;
  insurerId: string;
  serviceRecipientName: string;
  attended: boolean;
  status: ServiceStatus;
  notes?: string | null;
}
