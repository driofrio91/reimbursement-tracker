import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { Service } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export interface ServiceInvoiceSummary {
  service: Service;
  invoices: Invoice[];
  totalBilledAmount: number;
  totalExpectedAmount: number;
  totalPaidAmount: number;
  pendingExpectedAmount: number;
  overBilledAmount: number;
  overExpectedAmount: number;
  paidInvoicesCount: number;
  rejectedInvoicesCount: number;
}

interface GetServiceInvoiceSummaryUseCaseDependencies {
  serviceRepository: Pick<ServiceRepository, "getById">;
  invoiceRepository: Pick<InvoiceRepository, "listByServiceId">;
}

export async function getServiceInvoiceSummaryUseCase(
  serviceId: string,
  dependencies: GetServiceInvoiceSummaryUseCaseDependencies,
): Promise<ServiceInvoiceSummary | null> {
  const service = await dependencies.serviceRepository.getById(serviceId);

  if (!service) {
    return null;
  }

  const invoices = await dependencies.invoiceRepository.listByServiceId(serviceId);
  const totalBilledAmount = roundMoney(invoices.reduce((sum, invoice) => sum + invoice.invoiceBilledAmount, 0));
  const totalExpectedAmount = roundMoney(invoices.reduce((sum, invoice) => sum + invoice.invoiceExpectedAmount, 0));
  const totalPaidAmount = roundMoney(
    invoices.reduce((sum, invoice) => sum + (invoice.status === "PAID" ? (invoice.paidAmount ?? 0) : 0), 0),
  );
  const pendingExpectedAmount = roundMoney(Math.max(service.actualAmount - totalExpectedAmount, 0));
  const overBilledAmount = roundMoney(Math.max(totalBilledAmount - service.actualAmount, 0));
  const overExpectedAmount = roundMoney(Math.max(totalExpectedAmount - service.actualAmount, 0));
  const paidInvoicesCount = invoices.filter((invoice) => invoice.status === "PAID").length;
  const rejectedInvoicesCount = invoices.filter((invoice) => invoice.status === "REJECTED").length;

  return {
    service,
    invoices,
    totalBilledAmount,
    totalExpectedAmount,
    totalPaidAmount,
    pendingExpectedAmount,
    overBilledAmount,
    overExpectedAmount,
    paidInvoicesCount,
    rejectedInvoicesCount,
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
