export interface InvoiceActionResult {
  status: "idle" | "success" | "error";
  message: string;
  token: number;
  createdInvoiceId?: string;
}
