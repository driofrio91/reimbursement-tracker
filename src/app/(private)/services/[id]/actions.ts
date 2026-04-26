"use server";

import { revalidatePath } from "next/cache";
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

export interface InvoiceActionResult {
  status: "idle" | "success" | "error";
  message: string;
  token: number;
}

export async function completeInvoiceInformationAction(
  serviceId: string,
  invoiceId: string,
  _previousState: InvoiceActionResult,
  formData: FormData,
): Promise<InvoiceActionResult> {
  const parsedInput = completeInvoiceInformationSchema.safeParse({
    invoiceNumber: getString(formData, "invoiceNumber"),
    invoiceDate: getString(formData, "invoiceDate"),
    issuerName: getString(formData, "issuerName"),
    issuerTaxId: getString(formData, "issuerTaxId"),
    notes: getString(formData, "notes"),
  });

  if (!parsedInput.success) {
    return buildActionResult("error", "Revisa los datos de factura antes de guardar.");
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
      return buildActionResult("error", error.message);
    }

    return buildActionResult("error", "No se pudo completar la informacion de la factura.");
  }

  revalidatePath(`/services/${serviceId}`);
  return buildActionResult("success", "Informacion de factura guardada.");
}

export async function registerInvoiceClaimReferenceAction(
  serviceId: string,
  invoiceId: string,
  _previousState: InvoiceActionResult,
  formData: FormData,
): Promise<InvoiceActionResult> {
  const parsedInput = claimReferenceSchema.safeParse({
    claimReference: getString(formData, "claimReference"),
  });

  if (!parsedInput.success) {
    return buildActionResult("error", "La referencia de solicitud es obligatoria.");
  }

  try {
    await registerInvoiceClaimReferenceUseCase(invoiceId, parsedInput.data.claimReference, {
      invoiceRepository: new PrismaInvoiceRepository(prisma),
    });
  } catch (error) {
    if (error instanceof RegisterInvoiceClaimReferenceUseCaseError) {
      return buildActionResult("error", error.message);
    }

    return buildActionResult("error", "No se pudo registrar la referencia de solicitud.");
  }

  revalidatePath(`/services/${serviceId}`);
  return buildActionResult("success", "Referencia de solicitud guardada.");
}

export async function markInvoiceAsPaidAction(
  serviceId: string,
  invoiceId: string,
  _previousState: InvoiceActionResult,
  formData: FormData,
): Promise<InvoiceActionResult> {
  const parsedInput = paidSchema.safeParse({
    paidAmount: getString(formData, "paidAmount"),
    paidAt: getString(formData, "paidAt"),
  });

  if (!parsedInput.success) {
    return buildActionResult("error", "El importe pagado y la fecha de pago son obligatorios.");
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
      return buildActionResult("error", error.message);
    }

    return buildActionResult("error", "No se pudo marcar la factura como pagada.");
  }

  revalidatePath(`/services/${serviceId}`);
  return buildActionResult("success", "Factura marcada como pagada.");
}

export async function markInvoiceAsRejectedAction(
  serviceId: string,
  invoiceId: string,
  _previousState: InvoiceActionResult,
  formData: FormData,
): Promise<InvoiceActionResult> {
  const parsedInput = rejectedSchema.safeParse({
    rejectionReason: getString(formData, "rejectionReason"),
  });

  if (!parsedInput.success) {
    return buildActionResult("error", "No se pudo validar el motivo de rechazo.");
  }

  try {
    await markInvoiceAsRejectedUseCase(invoiceId, parsedInput.data.rejectionReason || undefined, {
      invoiceRepository: new PrismaInvoiceRepository(prisma),
    });
  } catch (error) {
    if (error instanceof MarkInvoiceAsRejectedUseCaseError) {
      return buildActionResult("error", error.message);
    }

    return buildActionResult("error", "No se pudo marcar la factura como rechazada.");
  }

  revalidatePath(`/services/${serviceId}`);
  return buildActionResult("success", "Factura marcada como rechazada.");
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function buildActionResult(status: "success" | "error", message: string): InvoiceActionResult {
  return {
    status,
    message,
    token: Date.now(),
  };
}
