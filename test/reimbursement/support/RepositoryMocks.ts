import { Mock, vi } from "vitest";

import {
  CompleteInvoiceInformationInput,
  CorrectInvoiceResolutionInput,
  Invoice,
  NewInvoice,
} from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository, SearchInvoicesFilters } from "@/modules/reimbursement/domain/InvoiceRepository";
import { PersonAnnualReimbursementLimitRepository } from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimitRepository";
import { NewService, Service } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export interface ServiceRepositoryMock extends ServiceRepository {
  create: Mock<(service: NewService) => Promise<Service>>;
  getById: Mock<(serviceId: string) => Promise<Service | null>>;
  list: Mock<() => Promise<Service[]>>;
  updateStatus: Mock<(serviceId: string, status: Service["status"]) => Promise<Service | null>>;
  personExists: Mock<(personId: string) => Promise<boolean>>;
  insurerIsActive: Mock<(insurerId: string) => Promise<boolean>>;
}

export function createServiceRepositoryMock(): ServiceRepositoryMock {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    list: vi.fn(),
    updateStatus: vi.fn(),
    personExists: vi.fn(),
    insurerIsActive: vi.fn(),
  };
}

export interface InvoiceRepositoryMock extends InvoiceRepository {
  getById: Mock<(invoiceId: string) => Promise<Invoice | null>>;
  search: Mock<(filters: SearchInvoicesFilters) => Promise<Invoice[]>>;
  create: Mock<(invoice: NewInvoice) => Promise<Invoice>>;
  createMany: Mock<(invoices: NewInvoice[]) => Promise<Invoice[]>>;
  listByServiceId: Mock<(serviceId: string) => Promise<Invoice[]>>;
  completeInformation: Mock<(invoiceId: string, input: CompleteInvoiceInformationInput) => Promise<Invoice | null>>;
  setClaimReference: Mock<(invoiceId: string, claimReference: string) => Promise<Invoice | null>>;
  setPerson: Mock<(invoiceId: string, personId: string) => Promise<Invoice | null>>;
  markAsPaid: Mock<(invoiceId: string, paidAmount: number, paidAt: Date) => Promise<Invoice | null>>;
  markAsRejected: Mock<(invoiceId: string, rejectionReason?: string) => Promise<Invoice | null>>;
  correctResolution: Mock<(invoiceId: string, input: CorrectInvoiceResolutionInput) => Promise<Invoice | null>>;
  getPaidAmountByPersonInsurerForYear: Mock<
    (year: number) => Promise<Array<{ personId: string; insurerId: string; amount: number }>>
  >;
}

export function createInvoiceRepositoryMock(): InvoiceRepositoryMock {
  return {
    getById: vi.fn(),
    search: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    listByServiceId: vi.fn(),
    completeInformation: vi.fn(),
    setClaimReference: vi.fn(),
    setPerson: vi.fn(),
    markAsPaid: vi.fn(),
    markAsRejected: vi.fn(),
    correctResolution: vi.fn(),
    getPaidAmountByPersonInsurerForYear: vi.fn(),
  };
}

export interface PersonAnnualReimbursementLimitRepositoryMock extends PersonAnnualReimbursementLimitRepository {
  getByPersonInsurerYear: Mock;
  create: Mock;
  upsertForPersonInsurerYear: Mock;
  applyDelta: Mock;
  setAccumulated: Mock;
}

export function createPersonAnnualReimbursementLimitRepositoryMock(): PersonAnnualReimbursementLimitRepositoryMock {
  return {
    getByPersonInsurerYear: vi.fn(),
    create: vi.fn(),
    upsertForPersonInsurerYear: vi.fn(),
    applyDelta: vi.fn(),
    setAccumulated: vi.fn(),
  };
}
