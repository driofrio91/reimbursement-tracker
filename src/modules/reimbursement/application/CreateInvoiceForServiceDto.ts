export interface CreateInvoiceForServiceInput {
  serviceId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  amount: number;
  issuerName: string;
  issuerTaxId?: string;
  notes?: string;
}

export interface CreateInvoiceForServiceResult {
  id: string;
}
