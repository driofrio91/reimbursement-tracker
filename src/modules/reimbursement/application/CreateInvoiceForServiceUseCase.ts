import {
  CreateInvoiceForServiceInput,
  CreateInvoiceForServiceResult,
} from "@/modules/reimbursement/application/CreateInvoiceForServiceDto";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export type CreateInvoiceForServiceUseCaseErrorCode = "INVALID_AMOUNT" | "SERVICE_NOT_FOUND";

export class CreateInvoiceForServiceUseCaseError extends Error {
  constructor(public readonly code: CreateInvoiceForServiceUseCaseErrorCode, message: string) {
    super(message);
    this.name = "CreateInvoiceForServiceUseCaseError";
  }
}

interface CreateInvoiceForServiceUseCaseDependencies {
  serviceRepository: Pick<ServiceRepository, "getById">;
  invoiceRepository: InvoiceRepository;
}

export async function createInvoiceForServiceUseCase(
  input: CreateInvoiceForServiceInput,
  dependencies: CreateInvoiceForServiceUseCaseDependencies,
): Promise<CreateInvoiceForServiceResult> {
  if (input.amount <= 0) {
    throw new CreateInvoiceForServiceUseCaseError("INVALID_AMOUNT", "El importe debe ser mayor que cero.");
  }

  const service = await dependencies.serviceRepository.getById(input.serviceId);

  if (!service) {
    throw new CreateInvoiceForServiceUseCaseError("SERVICE_NOT_FOUND", "El servicio seleccionado no existe.");
  }

  const invoiceNumber = input.invoiceNumber.trim();
  const issuerName = input.issuerName.trim();
  const issuerTaxId = input.issuerTaxId?.trim() || undefined;
  const notes = input.notes?.trim() || undefined;

  const invoice = await dependencies.invoiceRepository.create({
    serviceId: input.serviceId,
    requestId: null,
    invoiceNumber,
    invoiceDate: input.invoiceDate,
    amount: input.amount,
    currency: "EUR",
    issuerName,
    issuerTaxId,
    status: "RECEIVED",
    reimbursedAmount: null,
    reimbursedAt: null,
    rejectionReason: null,
    notes,
  });

  return { id: invoice.id };
}
