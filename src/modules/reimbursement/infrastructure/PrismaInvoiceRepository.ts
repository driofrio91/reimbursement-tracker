import { InvoiceStatus as PrismaInvoiceStatus, PrismaClient } from "@prisma/client";

import {
  CompleteInvoiceInformationInput,
  CorrectInvoiceResolutionInput,
  Invoice,
  InvoiceStatus,
  NewInvoice,
} from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";

export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(invoiceId: string): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });

    return invoice ? this.mapInvoice(invoice) : null;
  }

  async create(invoice: NewInvoice): Promise<Invoice> {
    const createdInvoice = await this.prisma.invoice.create({
      data: {
        serviceId: invoice.serviceId,
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
          },
        }),
      ),
    );

    return createdInvoices.map((invoice) => this.mapInvoice(invoice));
  }

  async listByServiceId(serviceId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { serviceId },
      orderBy: [{ invoiceDate: "desc" }, { createdAt: "desc" }],
    });

    return invoices.map((invoice) => this.mapInvoice(invoice));
  }

  async completeInformation(invoiceId: string, input: CompleteInvoiceInformationInput): Promise<Invoice | null> {
    const existingInvoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!existingInvoice) {
      return null;
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        invoiceNumber: input.invoiceNumber,
        invoiceDate: input.invoiceDate,
        issuerName: input.issuerName,
        issuerTaxId: input.issuerTaxId ?? null,
        notes: input.notes ?? null,
        status: PrismaInvoiceStatus.INFORMATION_COMPLETED,
      },
    });

    return this.mapInvoice(updatedInvoice);
  }

  async setClaimReference(invoiceId: string, claimReference: string): Promise<Invoice | null> {
    const existingInvoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!existingInvoice) {
      return null;
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        claimReference,
        status: PrismaInvoiceStatus.CLAIM_REFERENCE_COMPLETED,
      },
    });

    return this.mapInvoice(updatedInvoice);
  }

  async markAsPaid(invoiceId: string, paidAmount: number, paidAt: Date): Promise<Invoice | null> {
    const existingInvoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!existingInvoice) {
      return null;
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: PrismaInvoiceStatus.PAID,
        paidAmount,
        paidAt,
      },
    });

    return this.mapInvoice(updatedInvoice);
  }

  async markAsRejected(invoiceId: string, rejectionReason?: string): Promise<Invoice | null> {
    const existingInvoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!existingInvoice) {
      return null;
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: PrismaInvoiceStatus.REJECTED,
        rejectionReason: rejectionReason ?? null,
      },
    });

    return this.mapInvoice(updatedInvoice);
  }

  async correctResolution(invoiceId: string, input: CorrectInvoiceResolutionInput): Promise<Invoice | null> {
    const existingInvoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!existingInvoice) {
      return null;
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
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

    return this.mapInvoice(updatedInvoice);
  }

  private mapInvoice(invoice: {
    id: string;
    serviceId: string;
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
    createdAt: Date;
    updatedAt: Date;
  }): Invoice {
    return {
      id: invoice.id,
      serviceId: invoice.serviceId,
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
