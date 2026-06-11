import { InvoiceStatus as PrismaInvoiceStatus, PrismaClient } from "@prisma/client";

import {
  CompleteInvoiceInformationInput,
  CorrectInvoiceResolutionInput,
  Invoice,
  InvoiceStatus,
  NewInvoice,
} from "@/modules/reimbursement/domain/Invoice";
import {
  InvoiceRepository,
  PaidAmountByInsuranceHolderInsurer,
  SearchInvoicesFilters,
} from "@/modules/reimbursement/domain/InvoiceRepository";

export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(invoiceId: string): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });

    return invoice ? this.mapInvoice(invoice) : null;
  }

  async search(filters: SearchInvoicesFilters): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        invoiceNumber: filters.invoiceNumber
          ? {
              contains: filters.invoiceNumber,
              mode: "insensitive",
            }
          : undefined,
        claimReference: filters.claimReference
          ? {
              contains: filters.claimReference,
              mode: "insensitive",
            }
          : undefined,
        status: filters.status ? this.toPrismaStatus(filters.status) : undefined,
      },
      orderBy: { updatedAt: "desc" },
    });

    return invoices.map((invoice) => this.mapInvoice(invoice));
  }

  async create(invoice: NewInvoice): Promise<Invoice> {
    const createdInvoice = await this.prisma.invoice.create({
      data: {
        serviceId: invoice.serviceId,
        insuranceHolderPersonId: invoice.insuranceHolderPersonId ?? null,
        insurerId: invoice.insurerId ?? null,
        invoiceNumber: invoice.invoiceNumber ?? null,
        invoiceDate: invoice.invoiceDate ?? null,
        invoiceBilledAmount: invoice.invoiceBilledAmount,
        invoiceExpectedAmount: invoice.invoiceExpectedAmount,
        currency: invoice.currency,
        issuerName: invoice.issuerName ?? null,
        issuerTaxId: invoice.issuerTaxId ?? null,
        claimReference: invoice.claimReference ?? null,
        status: this.toPrismaStatus(invoice.status),
        paidAmount: invoice.paidAmount ?? null,
        paidAt: invoice.paidAt ?? null,
        rejectionReason: invoice.rejectionReason ?? null,
        notes: invoice.notes ?? null,
        createdManually: invoice.createdManually ?? false,
      },
    });

    return this.mapInvoice(createdInvoice);
  }

  async createMany(invoices: NewInvoice[]): Promise<Invoice[]> {
    if (invoices.length === 0) {
      return [];
    }

    const createdInvoices = await Promise.all(
      invoices.map((invoice) =>
        this.prisma.invoice.create({
          data: {
            serviceId: invoice.serviceId,
            insuranceHolderPersonId: invoice.insuranceHolderPersonId ?? null,
            insurerId: invoice.insurerId ?? null,
            invoiceNumber: invoice.invoiceNumber ?? null,
            invoiceDate: invoice.invoiceDate ?? null,
            invoiceBilledAmount: invoice.invoiceBilledAmount,
            invoiceExpectedAmount: invoice.invoiceExpectedAmount,
            currency: invoice.currency,
            issuerName: invoice.issuerName ?? null,
            issuerTaxId: invoice.issuerTaxId ?? null,
            claimReference: invoice.claimReference ?? null,
            status: this.toPrismaStatus(invoice.status),
            paidAmount: invoice.paidAmount ?? null,
            paidAt: invoice.paidAt ?? null,
            rejectionReason: invoice.rejectionReason ?? null,
            notes: invoice.notes ?? null,
            createdManually: invoice.createdManually ?? false,
          },
        }),
      ),
    );

    return createdInvoices.map((invoice) => this.mapInvoice(invoice));
  }

  async deleteDraftOrInformationCompleted(invoiceId: string): Promise<boolean> {
    const deleteResult = await this.prisma.invoice.deleteMany({
      where: {
        id: invoiceId,
        status: {
          in: [PrismaInvoiceStatus.CREATED, PrismaInvoiceStatus.INFORMATION_COMPLETED],
        },
      },
    });

    return deleteResult.count > 0;
  }

  async listByServiceId(serviceId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { serviceId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return invoices.map((invoice) => this.mapInvoice(invoice));
  }

  async completeInformation(invoiceId: string, input: CompleteInvoiceInformationInput): Promise<Invoice | null> {
    const updateResult = await this.prisma.invoice.updateMany({
      where: {
        id: invoiceId,
        status: PrismaInvoiceStatus.CREATED,
      },
      data: {
        invoiceNumber: input.invoiceNumber,
        invoiceDate: input.invoiceDate,
        issuerName: input.issuerName,
        issuerTaxId: input.issuerTaxId ?? null,
        notes: input.notes ?? null,
        status: PrismaInvoiceStatus.INFORMATION_COMPLETED,
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    return this.getById(invoiceId);
  }

  async setClaimReference(invoiceId: string, claimReference: string): Promise<Invoice | null> {
    const updateResult = await this.prisma.invoice.updateMany({
      where: {
        id: invoiceId,
        status: PrismaInvoiceStatus.INFORMATION_COMPLETED,
      },
      data: {
        claimReference,
        status: PrismaInvoiceStatus.CLAIM_REFERENCE_COMPLETED,
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    return this.getById(invoiceId);
  }

  async setInsuranceHolder(invoiceId: string, insuranceHolderPersonId: string): Promise<Invoice | null> {
    const updateResult = await this.prisma.invoice.updateMany({
      where: {
        id: invoiceId,
        status: {
          not: PrismaInvoiceStatus.PAID,
        },
      },
      data: {
        insuranceHolderPersonId,
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    return this.getById(invoiceId);
  }

  async markAsPaid(invoiceId: string, paidAmount: number, paidAt: Date): Promise<Invoice | null> {
    const updateResult = await this.prisma.invoice.updateMany({
      where: {
        id: invoiceId,
        status: PrismaInvoiceStatus.CLAIM_REFERENCE_COMPLETED,
      },
      data: {
        status: PrismaInvoiceStatus.PAID,
        paidAmount,
        paidAt,
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    return this.getById(invoiceId);
  }

  async markAsRejected(invoiceId: string, rejectionReason?: string): Promise<Invoice | null> {
    const updateResult = await this.prisma.invoice.updateMany({
      where: {
        id: invoiceId,
        status: PrismaInvoiceStatus.CLAIM_REFERENCE_COMPLETED,
      },
      data: {
        status: PrismaInvoiceStatus.REJECTED,
        rejectionReason: rejectionReason ?? null,
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    return this.getById(invoiceId);
  }

  async correctResolution(invoiceId: string, input: CorrectInvoiceResolutionInput): Promise<Invoice | null> {
    const existingInvoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!existingInvoice) {
      return null;
    }

    if (existingInvoice.status !== PrismaInvoiceStatus.PAID && existingInvoice.status !== PrismaInvoiceStatus.REJECTED) {
      return null;
    }

    const updateResult = await this.prisma.invoice.updateMany({
      where: {
        id: invoiceId,
        status: existingInvoice.status,
      },
      data:
        input.toStatus === "PAID"
          ? {
              status: PrismaInvoiceStatus.PAID,
              paidAmount: input.paidAmount,
              paidAt: input.paidAt,
              rejectionReason: null,
              correctedAt: new Date(),
              correctionReason: input.correctionReason,
              correctedFromStatus: existingInvoice.status,
              correctedByUserId: input.correctedByUserId,
              correctedByUserName: input.correctedByUserName ?? null,
            }
          : {
              status: PrismaInvoiceStatus.REJECTED,
              rejectionReason: input.rejectionReason ?? null,
              paidAmount: null,
              paidAt: null,
              correctedAt: new Date(),
              correctionReason: input.correctionReason,
              correctedFromStatus: existingInvoice.status,
              correctedByUserId: input.correctedByUserId,
              correctedByUserName: input.correctedByUserName ?? null,
            },
    });

    if (updateResult.count === 0) {
      return null;
    }

    return this.getById(invoiceId);
  }

  async getPaidAmountByPersonInsurerForYear(year: number): Promise<PaidAmountByInsuranceHolderInsurer[]> {
    const rows = await this.prisma.invoice.findMany({
      select: {
        insuranceHolderPersonId: true,
        paidAmount: true,
        service: {
          select: {
            insurerId: true,
          },
        },
      },
      where: {
        status: PrismaInvoiceStatus.PAID,
        insuranceHolderPersonId: {
          not: null,
        },
        invoiceDate: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    });

    const bucket = new Map<string, PaidAmountByInsuranceHolderInsurer>();

    for (const row of rows) {
      if (!row.insuranceHolderPersonId) {
        continue;
      }

      const key = `${row.insuranceHolderPersonId}:${row.service.insurerId}`;
      const current = bucket.get(key);
      const amount = row.paidAmount?.toNumber() ?? 0;

      if (!current) {
        bucket.set(key, {
          insuranceHolderPersonId: row.insuranceHolderPersonId,
          insurerId: row.service.insurerId,
          amount,
        });
        continue;
      }

      current.amount += amount;
    }

    return Array.from(bucket.values());
  }

  private mapInvoice(invoice: {
    id: string;
    serviceId: string;
    insuranceHolderPersonId: string | null;
    insurerId: string | null;
    invoiceNumber: string | null;
    invoiceDate: Date | null;
    invoiceBilledAmount: { toNumber(): number };
    invoiceExpectedAmount: { toNumber(): number };
    currency: string;
    issuerName: string | null;
    issuerTaxId: string | null;
    claimReference: string | null;
    status: PrismaInvoiceStatus;
    paidAmount: { toNumber(): number } | null;
    paidAt: Date | null;
    rejectionReason: string | null;
    correctedAt: Date | null;
    correctionReason: string | null;
    correctedFromStatus: PrismaInvoiceStatus | null;
    correctedByUserId: string | null;
    correctedByUserName: string | null;
    notes: string | null;
    createdManually: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Invoice {
    return {
      id: invoice.id,
      serviceId: invoice.serviceId,
      insuranceHolderPersonId: invoice.insuranceHolderPersonId,
      insurerId: invoice.insurerId,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      invoiceBilledAmount: invoice.invoiceBilledAmount.toNumber(),
      invoiceExpectedAmount: invoice.invoiceExpectedAmount.toNumber(),
      currency: invoice.currency,
      issuerName: invoice.issuerName,
      issuerTaxId: invoice.issuerTaxId,
      claimReference: invoice.claimReference,
      status: invoice.status,
      paidAmount: invoice.paidAmount ? invoice.paidAmount.toNumber() : null,
      paidAt: invoice.paidAt,
      rejectionReason: invoice.rejectionReason,
      correctedAt: invoice.correctedAt,
      correctionReason: invoice.correctionReason,
      correctedFromStatus: invoice.correctedFromStatus,
      correctedByUserId: invoice.correctedByUserId,
      correctedByUserName: invoice.correctedByUserName,
      notes: invoice.notes,
      createdManually: invoice.createdManually,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  private toPrismaStatus(status: InvoiceStatus): PrismaInvoiceStatus {
    switch (status) {
      case "CREATED":
        return PrismaInvoiceStatus.CREATED;
      case "INFORMATION_COMPLETED":
        return PrismaInvoiceStatus.INFORMATION_COMPLETED;
      case "CLAIM_REFERENCE_COMPLETED":
        return PrismaInvoiceStatus.CLAIM_REFERENCE_COMPLETED;
      case "PAID":
        return PrismaInvoiceStatus.PAID;
      case "REJECTED":
        return PrismaInvoiceStatus.REJECTED;
    }
  }
}
