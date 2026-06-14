import { NextResponse } from "next/server";

import {
  BuildServiceInvoicesCsvUseCaseError,
  buildServiceInvoicesCsvUseCase,
} from "@/modules/reimbursement/application/BuildServiceInvoicesCsvUseCase";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { PrismaServiceRepository } from "@/modules/reimbursement/infrastructure/PrismaServiceRepository";
import { AuthorizationError, requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(USER_ROLES.ADMIN, USER_ROLES.USER);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ message: "Debes iniciar sesion para completar esta accion." }, { status: 401 });
    }

    throw error;
  }

  const { id: serviceId } = await params;

  try {
    const csv = await buildServiceInvoicesCsvUseCase(serviceId, {
      serviceRepository: new PrismaServiceRepository(prisma),
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
    if (error instanceof BuildServiceInvoicesCsvUseCaseError) {
      if (error.code === "SERVICE_NOT_FOUND") {
        return NextResponse.json({ message: "El servicio seleccionado no existe." }, { status: 404 });
      }

      return NextResponse.json({ message: "No hay facturas en estado Created para exportar." }, { status: 400 });
    }

    throw error;
  }
}
