import { CreateServiceInput } from "@/modules/reimbursement/application/CreateServiceDto";
import { Service } from "@/modules/reimbursement/domain/Service";

export function buildCreateServiceInput(overrides: Partial<CreateServiceInput> = {}): CreateServiceInput {
  return {
    serviceDate: new Date("2026-04-22T00:00:00.000Z"),
    description: "Consulta de fisioterapia",
    actualAmount: 200,
    invoiceBilledAmount: 55,
    invoiceExpectedAmount: 49.5,
    insuranceHolderPersonId: "person-1",
    insurerId: "insurer-1",
    serviceRecipientName: "Ana Perez",
    attended: true,
    notes: "Sin incidencias",
    ...overrides,
  };
}

export function buildService(overrides: Partial<Service> = {}): Service {
  return {
    id: "service-1",
    serviceDate: new Date("2026-04-22T00:00:00.000Z"),
    description: "Consulta de fisioterapia",
    actualAmount: 200,
    invoiceBilledAmount: 55,
    invoiceExpectedAmount: 49.5,
    currency: "EUR",
    insuranceHolderPersonId: "person-1",
    insuranceHolderPersonName: "Ana Perez",
    insurerId: "insurer-1",
    insurerName: "DKV",
    serviceRecipientName: "Ana Perez",
    attended: true,
    status: "REGISTERED",
    notes: "Sin incidencias",
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    updatedAt: new Date("2026-04-22T10:00:00.000Z"),
    ...overrides,
  };
}
