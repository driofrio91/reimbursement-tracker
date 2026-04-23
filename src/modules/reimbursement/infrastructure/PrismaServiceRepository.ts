import { PrismaClient, ReimbursableServiceStatus } from "@prisma/client";

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
        currency: service.currency,
        personId: service.personId,
        insurerId: service.insurerId,
        policyHolderName: service.policyHolderName,
        attended: service.attended,
        status: this.toPrismaStatus(service.status),
        notes: service.notes ?? null,
      },
      include: {
        insurer: true,
        person: true,
      },
    });

    return this.mapService(createdService);
  }

  async getById(serviceId: string): Promise<Service | null> {
    const service = await this.prisma.reimbursableService.findUnique({
      where: { id: serviceId },
      include: {
        insurer: true,
        person: true,
      },
    });

    return service ? this.mapService(service) : null;
  }

  async list(): Promise<Service[]> {
    const services = await this.prisma.reimbursableService.findMany({
      include: {
        insurer: true,
        person: true,
      },
      orderBy: [{ serviceDate: "desc" }, { createdAt: "desc" }],
    });

    return services.map((service) => this.mapService(service));
  }

  async personExists(personId: string): Promise<boolean> {
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
      select: { id: true },
    });

    return Boolean(person);
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
    currency: string;
    personId: string;
    insurerId: string;
    policyHolderName: string;
    attended: boolean;
    status: ReimbursableServiceStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    insurer: { name: string };
    person: { displayName: string };
  }): Service {
    return {
      id: service.id,
      serviceDate: service.serviceDate,
      description: service.description,
      actualAmount: service.actualAmount.toNumber(),
      currency: service.currency,
      personId: service.personId,
      personName: service.person.displayName,
      insurerId: service.insurerId,
      insurerName: service.insurer.name,
      policyHolderName: service.policyHolderName,
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
