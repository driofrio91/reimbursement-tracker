import { Mock, vi } from "vitest";

import {
  CompleteInvoiceInformationInput,
  Invoice,
  NewInvoice,
} from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
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

export interface InvoiceRepositoryMock extends InvoiceRepository {
  getById: Mock<(invoiceId: string) => Promise<Invoice | null>>;
  create: Mock<(invoice: NewInvoice) => Promise<Invoice>>;
  createMany: Mock<(invoices: NewInvoice[]) => Promise<Invoice[]>>;
  listByServiceId: Mock<(serviceId: string) => Promise<Invoice[]>>;
  completeInformation: Mock<(invoiceId: string, input: CompleteInvoiceInformationInput) => Promise<Invoice | null>>;
  setClaimReference: Mock<(invoiceId: string, claimReference: string) => Promise<Invoice | null>>;
  markAsPaid: Mock<(invoiceId: string, paidAmount: number, paidAt: Date) => Promise<Invoice | null>>;
  markAsRejected: Mock<(invoiceId: string, rejectionReason?: string) => Promise<Invoice | null>>;
}

export function createInvoiceRepositoryMock(): InvoiceRepositoryMock {
  return {
    getById: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    listByServiceId: vi.fn(),
    completeInformation: vi.fn(),
    setClaimReference: vi.fn(),
    markAsPaid: vi.fn(),
    markAsRejected: vi.fn(),
  };
}
