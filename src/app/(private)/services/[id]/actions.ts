"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { completeInvoiceInformationUseCase } from "@/modules/reimbursement/application/CompleteInvoiceInformationUseCase";
import { markInvoiceAsPaidUseCase } from "@/modules/reimbursement/application/MarkInvoiceAsPaidUseCase";
import { markInvoiceAsRejectedUseCase } from "@/modules/reimbursement/application/MarkInvoiceAsRejectedUseCase";
import { registerInvoiceClaimReferenceUseCase } from "@/modules/reimbursement/application/RegisterInvoiceClaimReferenceUseCase";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { prisma } from "@/lib/db/prisma";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const completeInvoiceInformationSchema = z.object({
  invoiceNumber: z.string().trim().min(1),
  invoiceDate: z.string().trim().regex(datePattern),
  issuerName: z.string().trim().min(1),
  issuerTaxId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const claimReferenceSchema = z.object({
  claimReference: z.string().trim().min(1),
});

const paidSchema = z.object({
  paidAmount: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.replace(",", "."))
    .refine((value) => !Number.isNaN(Number(value)))
    .transform((value) => Number(value))
    .refine((value) => value > 0),
  paidAt: z.string().trim().regex(datePattern),
});

const rejectedSchema = z.object({
  rejectionReason: z.string().trim().optional(),
});

export async function completeInvoiceInformationAction(
  serviceId: string,
  invoiceId: string,
  formData: FormData,
): Promise<void> {
  const parsedInput = completeInvoiceInformationSchema.safeParse({
    invoiceNumber: getString(formData, "invoiceNumber"),
    invoiceDate: getString(formData, "invoiceDate"),
    issuerName: getString(formData, "issuerName"),
    issuerTaxId: getString(formData, "issuerTaxId"),
    notes: getString(formData, "notes"),
  });

  if (!parsedInput.success) {
    return;
  }

  await completeInvoiceInformationUseCase(
    invoiceId,
    {
      invoiceNumber: parsedInput.data.invoiceNumber,
      invoiceDate: new Date(`${parsedInput.data.invoiceDate}T00:00:00`),
      issuerName: parsedInput.data.issuerName,
      issuerTaxId: parsedInput.data.issuerTaxId || null,
      notes: parsedInput.data.notes || null,
    },
    {
      invoiceRepository: new PrismaInvoiceRepository(prisma),
    },
  );

  revalidatePath(`/services/${serviceId}`);
}

export async function registerInvoiceClaimReferenceAction(
  serviceId: string,
  invoiceId: string,
  formData: FormData,
): Promise<void> {
  const parsedInput = claimReferenceSchema.safeParse({
    claimReference: getString(formData, "claimReference"),
  });

  if (!parsedInput.success) {
    return;
  }

  await registerInvoiceClaimReferenceUseCase(invoiceId, parsedInput.data.claimReference, {
    invoiceRepository: new PrismaInvoiceRepository(prisma),
  });

  revalidatePath(`/services/${serviceId}`);
}

export async function markInvoiceAsPaidAction(serviceId: string, invoiceId: string, formData: FormData): Promise<void> {
  const parsedInput = paidSchema.safeParse({
    paidAmount: getString(formData, "paidAmount"),
    paidAt: getString(formData, "paidAt"),
  });

  if (!parsedInput.success) {
    return;
  }

  await markInvoiceAsPaidUseCase(
    invoiceId,
    parsedInput.data.paidAmount,
    new Date(`${parsedInput.data.paidAt}T00:00:00`),
    {
      invoiceRepository: new PrismaInvoiceRepository(prisma),
    },
  );

  revalidatePath(`/services/${serviceId}`);
}

export async function markInvoiceAsRejectedAction(
  serviceId: string,
  invoiceId: string,
  formData: FormData,
): Promise<void> {
  const parsedInput = rejectedSchema.safeParse({
    rejectionReason: getString(formData, "rejectionReason"),
  });

  if (!parsedInput.success) {
    return;
  }

  await markInvoiceAsRejectedUseCase(invoiceId, parsedInput.data.rejectionReason || undefined, {
    invoiceRepository: new PrismaInvoiceRepository(prisma),
  });

  revalidatePath(`/services/${serviceId}`);
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
