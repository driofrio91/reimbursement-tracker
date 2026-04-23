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
import { prisma } from "@/lib/db/prisma";

export async function createServiceAction(
  _previousState: CreateServiceFormState,
  formData: FormData,
): Promise<CreateServiceFormState> {
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
        personId: parsedInput.data.personId,
        insurerId: parsedInput.data.insurerId,
        policyHolderName: parsedInput.data.policyHolderName,
        attended: parsedInput.data.attended,
        notes: parsedInput.data.notes,
      },
      { serviceRepository: repository },
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
