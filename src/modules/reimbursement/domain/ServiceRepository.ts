import { NewService, Service } from "@/modules/reimbursement/domain/Service";

export interface ServiceRepository {
  create(service: NewService): Promise<Service>;
  getById(serviceId: string): Promise<Service | null>;
  list(): Promise<Service[]>;
  updateStatus(serviceId: string, status: Service["status"]): Promise<Service | null>;
  deleteWithInvoicesInCreatedStatusOnly(serviceId: string): Promise<boolean>;
  insuranceHolderExists(insuranceHolderPersonId: string): Promise<boolean>;
  insurerIsActive(insurerId: string): Promise<boolean>;
}
