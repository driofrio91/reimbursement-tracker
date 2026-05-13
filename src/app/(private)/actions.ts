"use server";

import { revalidatePath } from "next/cache";

import { syncAnnualReimbursementLimitsUseCase } from "@/modules/reimbursement/application/SyncAnnualReimbursementLimitsUseCase";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { PrismaPersonAnnualReimbursementLimitRepository } from "@/modules/reimbursement/infrastructure/PrismaPersonAnnualReimbursementLimitRepository";
import { AuthorizationError, requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";
import { SyncAnnualLimitsActionResult } from "@/app/(private)/sync-annual-limits-state";

export async function syncAnnualLimitsAction(
  _previousState: SyncAnnualLimitsActionResult,
  _formData: FormData,
): Promise<SyncAnnualLimitsActionResult> {
  void _previousState;
  void _formData;

  try {
    await requireRole(USER_ROLES.ADMIN);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        status: "error",
        message: "Solo un ADMIN puede ejecutar Sync.",
        token: Date.now(),
      };
    }

    throw error;
  }

  const year = new Date().getUTCFullYear();

  const result = await syncAnnualReimbursementLimitsUseCase(year, {
    invoiceRepository: new PrismaInvoiceRepository(prisma),
    annualLimitRepository: new PrismaPersonAnnualReimbursementLimitRepository(prisma),
  });

  revalidatePath("/");

  return {
    status: "success",
    message: `Sync ${result.year}: ${result.combinationsProcessed} combinaciones persona+aseguradora, ${result.adjusted} ajustados, ${result.unchanged} sin cambios, ${result.errors} errores.`,
    token: Date.now(),
  };
}
