import { CreateServiceInput, CreateServiceResult } from "@/modules/reimbursement/application/CreateServiceDto";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export type CreateServiceUseCaseErrorCode =
  | "INVALID_AMOUNT"
  | "INVALID_INVOICE_CONFIGURATION"
  | "PERSON_NOT_FOUND"
  | "INSURER_NOT_FOUND_OR_INACTIVE";

export class CreateServiceUseCaseError extends Error {
  constructor(public readonly code: CreateServiceUseCaseErrorCode, message: string) {
    super(message);
    this.name = "CreateServiceUseCaseError";
  }
}

interface CreateServiceUseCaseDependencies {
  serviceRepository: ServiceRepository;
  invoiceRepository: Pick<InvoiceRepository, "createMany">;
}

export async function createServiceUseCase(
  input: CreateServiceInput,
  dependencies: CreateServiceUseCaseDependencies,
): Promise<CreateServiceResult> {
  const description = input.description.trim();
  const serviceRecipientName = input.serviceRecipientName.trim();
  const notes = input.notes?.trim() || undefined;

  if (input.actualAmount <= 0) {
    throw new CreateServiceUseCaseError("INVALID_AMOUNT", "El importe debe ser mayor que cero.");
  }

  if (input.invoiceBilledAmount <= 0 || input.invoiceExpectedAmount <= 0) {
    throw new CreateServiceUseCaseError(
      "INVALID_INVOICE_CONFIGURATION",
      "Los importes de configuracion de factura deben ser mayores que cero.",
    );
  }

  const [insuranceHolderExists, insurerIsActive] = await Promise.all([
    dependencies.serviceRepository.insuranceHolderExists(input.insuranceHolderPersonId),
    dependencies.serviceRepository.insurerIsActive(input.insurerId),
  ]);

  if (!insuranceHolderExists) {
    throw new CreateServiceUseCaseError("PERSON_NOT_FOUND", "El titular del seguro seleccionado no existe.");
  }

  if (!insurerIsActive) {
    throw new CreateServiceUseCaseError(
      "INSURER_NOT_FOUND_OR_INACTIVE",
      "La aseguradora seleccionada no existe o esta inactiva.",
    );
  }

  const service = await dependencies.serviceRepository.create({
    serviceDate: input.serviceDate,
    description,
    actualAmount: input.actualAmount,
    invoiceBilledAmount: input.invoiceBilledAmount,
    invoiceExpectedAmount: input.invoiceExpectedAmount,
    currency: "EUR",
    insuranceHolderPersonId: input.insuranceHolderPersonId,
    insurerId: input.insurerId,
    serviceRecipientName,
    attended: input.attended ?? true,
    status: "REGISTERED",
    notes,
  });

  const invoiceCount = Math.ceil(input.actualAmount / input.invoiceExpectedAmount);

  const generatedInvoices = Array.from({ length: invoiceCount }, () => ({
    serviceId: service.id,
    invoiceNumber: null,
    invoiceDate: null,
    invoiceBilledAmount: input.invoiceBilledAmount,
    invoiceExpectedAmount: input.invoiceExpectedAmount,
    currency: "EUR",
    issuerName: null,
    issuerTaxId: null,
    claimReference: null,
    insuranceHolderPersonId: input.insuranceHolderPersonId,
    insurerId: input.insurerId,
    status: "CREATED" as const,
    paidAmount: null,
    paidAt: null,
    rejectionReason: null,
    notes: null,
    createdManually: false,
  }));

  await dependencies.invoiceRepository.createMany(generatedInvoices);

  return { id: service.id };
}
