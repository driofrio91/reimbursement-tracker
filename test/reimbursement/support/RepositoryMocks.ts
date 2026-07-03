import { Mock, vi } from "vitest";

import {
  CompleteInvoiceInformationInput,
  CorrectInvoiceResolutionInput,
  Invoice,
  NewInvoice,
} from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository, SearchInvoicesFilters } from "@/modules/reimbursement/domain/InvoiceRepository";
import { PaginatedResult, Pagination } from "@/modules/reimbursement/domain/Pagination";
import { PersonAnnualReimbursementLimitRepository } from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimitRepository";
import { NewService, Service } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export interface ServiceRepositoryMock extends ServiceRepository {
  create: Mock<(service: NewService) => Promise<Service>>;
  getById: Mock<(serviceId: string) => Promise<Service | null>>;
  list: Mock<() => Promise<Service[]>>;
  listPaginated: Mock<(pagination: Pagination) => Promise<PaginatedResult<Service>>>;
  updateStatus: Mock<(serviceId: string, status: Service["status"]) => Promise<Service | null>>;
  deleteWithInvoicesInCreatedStatusOnly: Mock<(serviceId: string) => Promise<boolean>>;
  insuranceHolderExists: Mock<(insuranceHolderPersonId: string) => Promise<boolean>>;
  insurerIsActive: Mock<(insurerId: string) => Promise<boolean>>;
}

export function createServiceRepositoryMock(): ServiceRepositoryMock {
  return {
    create: vi.fn(),
    getById: vi.fn(),
    list: vi.fn(),
    listPaginated: vi.fn(),
    updateStatus: vi.fn(),
    deleteWithInvoicesInCreatedStatusOnly: vi.fn(),
    insuranceHolderExists: vi.fn(),
    insurerIsActive: vi.fn(),
  };
}

export interface InvoiceRepositoryMock extends InvoiceRepository {
  getById: Mock<(invoiceId: string) => Promise<Invoice | null>>;
  search: Mock<(filters: SearchInvoicesFilters) => Promise<Invoice[]>>;
  searchPaginated: Mock<(filters: SearchInvoicesFilters, pagination: Pagination) => Promise<PaginatedResult<Invoice>>>;
  create: Mock<(invoice: NewInvoice) => Promise<Invoice>>;
  createMany: Mock<(invoices: NewInvoice[]) => Promise<Invoice[]>>;
  deleteDraftOrInformationCompleted: Mock<(invoiceId: string) => Promise<boolean>>;
  listByServiceId: Mock<(serviceId: string) => Promise<Invoice[]>>;
  listStatusesByServiceIds: Mock<(serviceIds: string[]) => Promise<Map<string, Pick<Invoice, "status">[]>>>;
  completeInformation: Mock<(invoiceId: string, input: CompleteInvoiceInformationInput) => Promise<Invoice | null>>;
  setClaimReference: Mock<(invoiceId: string, claimReference: string) => Promise<Invoice | null>>;
  setInsuranceHolder: Mock<(invoiceId: string, insuranceHolderPersonId: string) => Promise<Invoice | null>>;
  markAsPaid: Mock<(invoiceId: string, paidAmount: number, paidAt: Date) => Promise<Invoice | null>>;
  markAsRejected: Mock<(invoiceId: string, rejectionReason?: string) => Promise<Invoice | null>>;
  correctResolution: Mock<(invoiceId: string, input: CorrectInvoiceResolutionInput) => Promise<Invoice | null>>;
  getPaidAmountByPersonInsurerForYear: Mock<
    (year: number) => Promise<Array<{ insuranceHolderPersonId: string; insurerId: string; amount: number }>>
  >;
}

export function createInvoiceRepositoryMock(): InvoiceRepositoryMock {
  return {
    getById: vi.fn(),
    search: vi.fn(),
    searchPaginated: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    deleteDraftOrInformationCompleted: vi.fn(),
    listByServiceId: vi.fn(),
    listStatusesByServiceIds: vi.fn(),
    completeInformation: vi.fn(),
    setClaimReference: vi.fn(),
    setInsuranceHolder: vi.fn(),
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
  zeroAccumulatedNotInYearSnapshot: Mock;
  listByYear: Mock;
}

export function createPersonAnnualReimbursementLimitRepositoryMock(): PersonAnnualReimbursementLimitRepositoryMock {
  return {
    getByPersonInsurerYear: vi.fn(),
    create: vi.fn(),
    upsertForPersonInsurerYear: vi.fn(),
    applyDelta: vi.fn(),
    setAccumulated: vi.fn(),
    zeroAccumulatedNotInYearSnapshot: vi.fn(),
    listByYear: vi.fn(),
  };
}
