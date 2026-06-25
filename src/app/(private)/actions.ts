"use server";

import { revalidatePath } from "next/cache";

import { syncAnnualReimbursementLimitsUseCase } from "@/modules/reimbursement/application/SyncAnnualReimbursementLimitsUseCase";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { PrismaPersonAnnualReimbursementLimitRepository } from "@/modules/reimbursement/infrastructure/PrismaPersonAnnualReimbursementLimitRepository";
import { AuthorizationError, requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";
import {
  createSyncAnnualLimitsActionResult,
  SyncAnnualLimitsActionResult,
} from "@/app/(private)/sync-annual-limits-state";

export async function syncAnnualLimitsAction(
  _previousState: SyncAnnualLimitsActionResult,
  formData: FormData,
): Promise<SyncAnnualLimitsActionResult> {
  void _previousState;

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

  const currentYear = new Date().getUTCFullYear();
  const parsedYear = Number(formData.get("year"));
  const year = Number.isInteger(parsedYear) && parsedYear > 2000 && parsedYear <= currentYear ? parsedYear : currentYear;

  const result = await syncAnnualReimbursementLimitsUseCase(year, {
    invoiceRepository: new PrismaInvoiceRepository(prisma),
    annualLimitRepository: new PrismaPersonAnnualReimbursementLimitRepository(prisma),
  });

  revalidatePath("/");

  return createSyncAnnualLimitsActionResult(result, Date.now());
}
