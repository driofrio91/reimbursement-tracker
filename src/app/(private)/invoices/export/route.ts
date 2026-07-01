import { NextResponse } from "next/server";

import {
  BuildFilteredInvoicesCsvUseCaseError,
  buildFilteredInvoicesCsvUseCase,
} from "@/modules/reimbursement/application/BuildFilteredInvoicesCsvUseCase";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { AuthorizationError, requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";

import { parseInvoicesSearchFilters } from "../invoiceSearchParams";

export async function GET(request: Request) {
  try {
    await requireRole(USER_ROLES.ADMIN, USER_ROLES.USER);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ message: "Debes iniciar sesion para completar esta accion." }, { status: 401 });
    }

    throw error;
  }

  const { searchParams } = new URL(request.url);
  const filters = parseInvoicesSearchFilters({
    invoiceNumber: searchParams.get("invoiceNumber") ?? undefined,
    claimReference: searchParams.get("claimReference") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  try {
    const csv = await buildFilteredInvoicesCsvUseCase(filters, {
      invoiceRepository: new PrismaInvoiceRepository(prisma),
    });

    return new Response(csv.content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${csv.filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof BuildFilteredInvoicesCsvUseCaseError) {
      return NextResponse.json({ message: "No hay facturas para exportar con los filtros actuales." }, { status: 400 });
    }

    throw error;
  }
}
