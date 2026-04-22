import { Invoice, NewInvoice } from "@/modules/reimbursement/domain/Invoice";

export interface InvoiceRepository {
  create(invoice: NewInvoice): Promise<Invoice>;
}
