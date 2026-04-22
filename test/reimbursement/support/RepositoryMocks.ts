import { Mock, vi } from "vitest";

import { NewService, Service } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export interface ServiceRepositoryMock extends ServiceRepository {
  create: Mock<(service: NewService) => Promise<Service>>;
  getById: Mock<(serviceId: string) => Promise<Service | null>>;
  list: Mock<() => Promise<Service[]>>;
  personExists: Mock<(personId: string) => Promise<boolean>>;
  insurerIsActive: Mock<(insurerId: string) => Promise<boolean>>;
}

export function createServiceRepositoryMock(): ServiceRepositoryMock {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    list: vi.fn(),
    personExists: vi.fn(),
    insurerIsActive: vi.fn(),
  };
}
