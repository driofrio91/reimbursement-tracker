import { NewService, Service } from "@/modules/reimbursement/domain/Service";

export interface ServiceRepository {
  create(service: NewService): Promise<Service>;
  getById(serviceId: string): Promise<Service | null>;
  list(): Promise<Service[]>;
  personExists(personId: string): Promise<boolean>;
  insurerIsActive(insurerId: string): Promise<boolean>;
}
