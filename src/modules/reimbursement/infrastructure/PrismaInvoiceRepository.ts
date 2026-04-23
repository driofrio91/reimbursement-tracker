import { InvoiceStatus as PrismaInvoiceStatus, PrismaClient } from "@prisma/client";

import { Invoice, InvoiceStatus, NewInvoice } from "@/modules/reimbursement/domain/Invoice";
import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";

export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(invoice: NewInvoice): Promise<Invoice> {
    const createdInvoice = await this.prisma.invoice.create({
      data: {
        serviceId: invoice.serviceId,
        requestId: invoice.requestId ?? null,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        amount: invoice.amount,
        currency: invoice.currency,
        issuerName: invoice.issuerName,
        issuerTaxId: invoice.issuerTaxId ?? null,
        status: this.toPrismaStatus(invoice.status),
        reimbursedAmount: invoice.reimbursedAmount ?? null,
        reimbursedAt: invoice.reimbursedAt ?? null,
        rejectionReason: invoice.rejectionReason ?? null,
        notes: invoice.notes ?? null,
      },
    });

    return this.mapInvoice(createdInvoice);
  }

  private mapInvoice(invoice: {
    id: string;
    serviceId: string;
    requestId: string | null;
    invoiceNumber: string;
    invoiceDate: Date;
    amount: { toNumber(): number };
    currency: string;
    issuerName: string;
    issuerTaxId: string | null;
    status: PrismaInvoiceStatus;
    reimbursedAmount: { toNumber(): number } | null;
    reimbursedAt: Date | null;
    rejectionReason: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Invoice {
    return {
      id: invoice.id,
      serviceId: invoice.serviceId,
      requestId: invoice.requestId,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      amount: invoice.amount.toNumber(),
      currency: invoice.currency,
      issuerName: invoice.issuerName,
      issuerTaxId: invoice.issuerTaxId,
      status: invoice.status,
      reimbursedAmount: invoice.reimbursedAmount ? invoice.reimbursedAmount.toNumber() : null,
      reimbursedAt: invoice.reimbursedAt,
      rejectionReason: invoice.rejectionReason,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  private toPrismaStatus(status: InvoiceStatus): PrismaInvoiceStatus {
    switch (status) {
      case "RECEIVED":
        return PrismaInvoiceStatus.RECEIVED;
      case "SUBMITTED":
        return PrismaInvoiceStatus.SUBMITTED;
      case "REJECTED":
        return PrismaInvoiceStatus.REJECTED;
      case "REIMBURSED":
        return PrismaInvoiceStatus.REIMBURSED;
    }
  }
}
