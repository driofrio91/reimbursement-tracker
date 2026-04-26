"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  CompleteInvoiceInformationUseCaseError,
  completeInvoiceInformationUseCase,
} from "@/modules/reimbursement/application/CompleteInvoiceInformationUseCase";
import { MarkInvoiceAsPaidUseCaseError, markInvoiceAsPaidUseCase } from "@/modules/reimbursement/application/MarkInvoiceAsPaidUseCase";
import {
  MarkInvoiceAsRejectedUseCaseError,
  markInvoiceAsRejectedUseCase,
} from "@/modules/reimbursement/application/MarkInvoiceAsRejectedUseCase";
import {
  RegisterInvoiceClaimReferenceUseCaseError,
  registerInvoiceClaimReferenceUseCase,
} from "@/modules/reimbursement/application/RegisterInvoiceClaimReferenceUseCase";
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
    redirectWithFeedback(serviceId, "error", "Revisa los datos de factura antes de guardar.");
  }

  try {
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
  } catch (error) {
    if (error instanceof CompleteInvoiceInformationUseCaseError) {
      redirectWithFeedback(serviceId, "error", error.message);
    }

    redirectWithFeedback(serviceId, "error", "No se pudo completar la informacion de la factura.");
  }

  revalidatePath(`/services/${serviceId}`);
  redirectWithFeedback(serviceId, "success", "Informacion de factura guardada.");
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
    redirectWithFeedback(serviceId, "error", "La referencia de solicitud es obligatoria.");
  }

  try {
    await registerInvoiceClaimReferenceUseCase(invoiceId, parsedInput.data.claimReference, {
      invoiceRepository: new PrismaInvoiceRepository(prisma),
    });
  } catch (error) {
    if (error instanceof RegisterInvoiceClaimReferenceUseCaseError) {
      redirectWithFeedback(serviceId, "error", error.message);
    }

    redirectWithFeedback(serviceId, "error", "No se pudo registrar la referencia de solicitud.");
  }

  revalidatePath(`/services/${serviceId}`);
  redirectWithFeedback(serviceId, "success", "Referencia de solicitud guardada.");
}

export async function markInvoiceAsPaidAction(serviceId: string, invoiceId: string, formData: FormData): Promise<void> {
  const parsedInput = paidSchema.safeParse({
    paidAmount: getString(formData, "paidAmount"),
    paidAt: getString(formData, "paidAt"),
  });

  if (!parsedInput.success) {
    redirectWithFeedback(serviceId, "error", "El importe pagado y la fecha de pago son obligatorios.");
  }

  try {
    await markInvoiceAsPaidUseCase(
      invoiceId,
      parsedInput.data.paidAmount,
      new Date(`${parsedInput.data.paidAt}T00:00:00`),
      {
        invoiceRepository: new PrismaInvoiceRepository(prisma),
      },
    );
  } catch (error) {
    if (error instanceof MarkInvoiceAsPaidUseCaseError) {
      redirectWithFeedback(serviceId, "error", error.message);
    }

    redirectWithFeedback(serviceId, "error", "No se pudo marcar la factura como pagada.");
  }

  revalidatePath(`/services/${serviceId}`);
  redirectWithFeedback(serviceId, "success", "Factura marcada como pagada.");
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
    redirectWithFeedback(serviceId, "error", "No se pudo validar el motivo de rechazo.");
  }

  try {
    await markInvoiceAsRejectedUseCase(invoiceId, parsedInput.data.rejectionReason || undefined, {
      invoiceRepository: new PrismaInvoiceRepository(prisma),
    });
  } catch (error) {
    if (error instanceof MarkInvoiceAsRejectedUseCaseError) {
      redirectWithFeedback(serviceId, "error", error.message);
    }

    redirectWithFeedback(serviceId, "error", "No se pudo marcar la factura como rechazada.");
  }

  revalidatePath(`/services/${serviceId}`);
  redirectWithFeedback(serviceId, "success", "Factura marcada como rechazada.");
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function redirectWithFeedback(serviceId: string, feedback: "success" | "error", message: string): never {
  const params = new URLSearchParams({
    feedback,
    message,
  });

  redirect(`/services/${serviceId}?${params.toString()}`);
}
