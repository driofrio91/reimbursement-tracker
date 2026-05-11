"use server";

import { redirect } from "next/navigation";

import {
  CreateServiceUseCaseError,
  createServiceUseCase,
} from "@/modules/reimbursement/application/CreateServiceUseCase";
import {
  createServiceFormSchema,
  CreateServiceFormState,
  getCreateServiceFormValues,
} from "@/modules/reimbursement/entrypoints/CreateServiceFormSchema";
import { PrismaServiceRepository } from "@/modules/reimbursement/infrastructure/PrismaServiceRepository";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { AuthorizationError, requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";

export async function createServiceAction(
  _previousState: CreateServiceFormState,
  formData: FormData,
): Promise<CreateServiceFormState> {
  try {
    await requireRole(USER_ROLES.ADMIN, USER_ROLES.USER);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        values: getCreateServiceFormValues(formData),
        errors: {
          form: "Debes iniciar sesion para crear un servicio.",
        },
      };
    }

    throw error;
  }

  const values = getCreateServiceFormValues(formData);
  const parsedInput = createServiceFormSchema.safeParse(values);

  if (!parsedInput.success) {
    const fieldErrors = parsedInput.error.flatten().fieldErrors;

    return {
      values,
      errors: {
        serviceDate: fieldErrors.serviceDate?.[0],
        description: fieldErrors.description?.[0],
        actualAmount: fieldErrors.actualAmount?.[0],
        invoiceBilledAmount: fieldErrors.invoiceBilledAmount?.[0],
        invoiceExpectedAmount: fieldErrors.invoiceExpectedAmount?.[0],
        personId: fieldErrors.personId?.[0],
        insurerId: fieldErrors.insurerId?.[0],
        policyHolderName: fieldErrors.policyHolderName?.[0],
        notes: fieldErrors.notes?.[0],
      },
    };
  }

  try {
    const repository = new PrismaServiceRepository(prisma);
    const result = await createServiceUseCase(
      {
        serviceDate: new Date(`${parsedInput.data.serviceDate}T00:00:00`),
        description: parsedInput.data.description,
        actualAmount: parsedInput.data.actualAmount,
        invoiceBilledAmount: parsedInput.data.invoiceBilledAmount,
        invoiceExpectedAmount: parsedInput.data.invoiceExpectedAmount,
        personId: parsedInput.data.personId,
        insurerId: parsedInput.data.insurerId,
        policyHolderName: parsedInput.data.policyHolderName,
        attended: parsedInput.data.attended,
        notes: parsedInput.data.notes,
      },
      {
        serviceRepository: repository,
        invoiceRepository: new PrismaInvoiceRepository(prisma),
      },
    );

    redirect(`/services/${result.id}`);
  } catch (error) {
    if (error instanceof CreateServiceUseCaseError) {
      return {
        values,
        errors: {
          form: error.message,
        },
      };
    }

    throw error;
  }
}
