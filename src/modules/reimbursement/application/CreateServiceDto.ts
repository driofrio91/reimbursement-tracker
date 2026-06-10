export interface CreateServiceInput {
  serviceDate: Date;
  description: string;
  actualAmount: number;
  invoiceBilledAmount: number;
  invoiceExpectedAmount: number;
  insuranceHolderPersonId: string;
  insurerId: string;
  serviceRecipientName: string;
  attended?: boolean;
  notes?: string;
}

export interface CreateServiceResult {
  id: string;
}
