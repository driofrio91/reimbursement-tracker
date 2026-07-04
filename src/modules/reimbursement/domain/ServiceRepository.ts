import { NewService, Service } from "@/modules/reimbursement/domain/Service";
import { PaginatedResult, Pagination } from "@/modules/reimbursement/domain/Pagination";

export interface ServiceRepository {
  create(service: NewService): Promise<Service>;
  getById(serviceId: string): Promise<Service | null>;
  list(): Promise<Service[]>;
  listPaginated(pagination: Pagination): Promise<PaginatedResult<Service>>;
  updateStatus(serviceId: string, status: Service["status"]): Promise<Service | null>;
  deleteWithInvoicesInCreatedStatusOnly(serviceId: string): Promise<boolean>;
  insuranceHolderExists(insuranceHolderPersonId: string): Promise<boolean>;
  insurerIsActive(insurerId: string): Promise<boolean>;
}
