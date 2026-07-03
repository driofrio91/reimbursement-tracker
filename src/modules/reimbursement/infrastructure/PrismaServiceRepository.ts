import { InvoiceStatus as PrismaInvoiceStatus, PrismaClient, ReimbursableServiceStatus } from "@prisma/client";

import {
  buildPaginationMetadata,
  clampPaginationToTotalItems,
  PaginatedResult,
  Pagination,
} from "@/modules/reimbursement/domain/Pagination";
import { NewService, Service, ServiceStatus } from "@/modules/reimbursement/domain/Service";
import { ServiceRepository } from "@/modules/reimbursement/domain/ServiceRepository";

export class PrismaServiceRepository implements ServiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(service: NewService): Promise<Service> {
    const createdService = await this.prisma.reimbursableService.create({
      data: {
        serviceDate: service.serviceDate,
        description: service.description,
        actualAmount: service.actualAmount,
        invoiceBilledAmount: service.invoiceBilledAmount,
        invoiceExpectedAmount: service.invoiceExpectedAmount,
        currency: service.currency,
        insuranceHolderPersonId: service.insuranceHolderPersonId,
        insurerId: service.insurerId,
        serviceRecipientName: service.serviceRecipientName,
        attended: service.attended,
        status: this.toPrismaStatus(service.status),
        notes: service.notes ?? null,
      },
      include: {
        insurer: true,
        insuranceHolder: true,
      },
    });

    return this.mapService(createdService);
  }

  async getById(serviceId: string): Promise<Service | null> {
    const service = await this.prisma.reimbursableService.findUnique({
      where: { id: serviceId },
      include: {
        insurer: true,
        insuranceHolder: true,
      },
    });

    return service ? this.mapService(service) : null;
  }

  async list(): Promise<Service[]> {
    const services = await this.prisma.reimbursableService.findMany({
      include: {
        insurer: true,
        insuranceHolder: true,
      },
      orderBy: [{ serviceDate: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    });

    return services.map((service) => this.mapService(service));
  }

  async listPaginated(pagination: Pagination): Promise<PaginatedResult<Service>> {
    const totalItems = await this.prisma.reimbursableService.count();
    const paginationForQuery = clampPaginationToTotalItems(pagination, totalItems);

    const services = await this.prisma.reimbursableService.findMany({
      include: {
        insurer: true,
        insuranceHolder: true,
      },
      orderBy: [{ serviceDate: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      skip: paginationForQuery.skip,
      take: paginationForQuery.take,
    });

    return {
      items: services.map((service) => this.mapService(service)),
      pagination: buildPaginationMetadata(paginationForQuery, totalItems),
    };
  }

  async updateStatus(serviceId: string, status: ServiceStatus): Promise<Service | null> {
    const existingService = await this.prisma.reimbursableService.findUnique({
      where: { id: serviceId },
      include: {
        insurer: true,
        insuranceHolder: true,
      },
    });

    if (!existingService) {
      return null;
    }

    const updatedService = await this.prisma.reimbursableService.update({
      where: { id: serviceId },
      data: {
        status: this.toPrismaStatus(status),
      },
      include: {
        insurer: true,
        insuranceHolder: true,
      },
    });

    return this.mapService(updatedService);
  }

  async deleteWithInvoicesInCreatedStatusOnly(serviceId: string): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const existingService = await tx.reimbursableService.findUnique({
          where: { id: serviceId },
          select: { id: true },
        });

        if (!existingService) {
          throw new Error("SERVICE_NOT_FOUND");
        }

        const totalInvoicesCount = await tx.invoice.count({
          where: { serviceId },
        });

        const deletedDraftInvoices = await tx.invoice.deleteMany({
          where: {
            serviceId,
            status: PrismaInvoiceStatus.CREATED,
          },
        });

        if (deletedDraftInvoices.count !== totalInvoicesCount) {
          throw new Error("INVOICES_NOT_ALL_CREATED");
        }

        await tx.reimbursableService.delete({
          where: { id: serviceId },
        });
      });
    } catch {
      return false;
    }

    return true;
  }

  async insuranceHolderExists(insuranceHolderPersonId: string): Promise<boolean> {
    const person = await this.prisma.person.findUnique({
      where: { id: insuranceHolderPersonId },
      select: { id: true, isActive: true },
    });

    return Boolean(person?.isActive);
  }

  async insurerIsActive(insurerId: string): Promise<boolean> {
    const insurer = await this.prisma.insurer.findUnique({
      where: { id: insurerId },
      select: { isActive: true },
    });

    return Boolean(insurer?.isActive);
  }

  private mapService(service: {
    id: string;
    serviceDate: Date;
    description: string;
    actualAmount: { toNumber(): number };
    invoiceBilledAmount: { toNumber(): number };
    invoiceExpectedAmount: { toNumber(): number };
    currency: string;
    insuranceHolderPersonId: string;
    insurerId: string;
    serviceRecipientName: string;
    attended: boolean;
    status: ReimbursableServiceStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    insurer: { name: string };
    insuranceHolder: { displayName: string };
  }): Service {
    return {
      id: service.id,
      serviceDate: service.serviceDate,
      description: service.description,
      actualAmount: service.actualAmount.toNumber(),
      invoiceBilledAmount: service.invoiceBilledAmount.toNumber(),
      invoiceExpectedAmount: service.invoiceExpectedAmount.toNumber(),
      currency: service.currency,
      insuranceHolderPersonId: service.insuranceHolderPersonId,
      insuranceHolderPersonName: service.insuranceHolder.displayName,
      insurerId: service.insurerId,
      insurerName: service.insurer.name,
      serviceRecipientName: service.serviceRecipientName,
      attended: service.attended,
      status: service.status,
      notes: service.notes,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }

  private toPrismaStatus(status: ServiceStatus): ReimbursableServiceStatus {
    switch (status) {
      case "REGISTERED":
        return ReimbursableServiceStatus.REGISTERED;
      case "SUBMITTED":
        return ReimbursableServiceStatus.SUBMITTED;
      case "REIMBURSED":
        return ReimbursableServiceStatus.REIMBURSED;
    }
  }
}
