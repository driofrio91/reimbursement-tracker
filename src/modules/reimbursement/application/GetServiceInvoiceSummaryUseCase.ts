import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { Service } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export interface ServiceInvoiceSummary {
  service: Service;
  invoices: Invoice[];
  totalInvoicedAmount: number;
  pendingToInvoiceAmount: number;
  overInvoicedAmount: number;
  isOverInvoiced: boolean;
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
  const totalInvoicedAmount = roundMoney(invoices.reduce((sum, invoice) => sum + invoice.amount, 0));
  const pendingToInvoiceAmount = roundMoney(Math.max(service.actualAmount - totalInvoicedAmount, 0));
  const overInvoicedAmount = roundMoney(Math.max(totalInvoicedAmount - service.actualAmount, 0));

  return {
    service,
    invoices,
    totalInvoicedAmount,
    pendingToInvoiceAmount,
    overInvoicedAmount,
    isOverInvoiced: overInvoicedAmount > 0,
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
