"use server";

import {
  CreateInvoiceForServiceUseCaseError,
  createInvoiceForServiceUseCase,
} from "@/modules/reimbursement/application/CreateInvoiceForServiceUseCase";
import {
  createInvoiceFormSchema,
  CreateInvoiceFormState,
  getCreateInvoiceFormValues,
  initialCreateInvoiceFormValues,
} from "@/modules/reimbursement/entrypoints/CreateInvoiceFormSchema";
import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { PrismaServiceRepository } from "@/modules/reimbursement/infrastructure/PrismaServiceRepository";
import { prisma } from "@/lib/db/prisma";

export async function createInvoiceAction(
  serviceId: string,
  _previousState: CreateInvoiceFormState,
  formData: FormData,
): Promise<CreateInvoiceFormState> {
  const values = getCreateInvoiceFormValues(formData);
  const parsedInput = createInvoiceFormSchema.safeParse(values);

  if (!parsedInput.success) {
    const fieldErrors = parsedInput.error.flatten().fieldErrors;

    return {
      values,
      errors: {
        invoiceNumber: fieldErrors.invoiceNumber?.[0],
        invoiceDate: fieldErrors.invoiceDate?.[0],
        amount: fieldErrors.amount?.[0],
        issuerName: fieldErrors.issuerName?.[0],
        issuerTaxId: fieldErrors.issuerTaxId?.[0],
        notes: fieldErrors.notes?.[0],
      },
      notification: {
        type: "error",
        message: "Revisa los campos del formulario para continuar.",
        nonce: Date.now(),
      },
    };
  }

  try {
    await createInvoiceForServiceUseCase(
      {
        serviceId,
        invoiceNumber: parsedInput.data.invoiceNumber,
        invoiceDate: new Date(`${parsedInput.data.invoiceDate}T00:00:00`),
        amount: parsedInput.data.amount,
        issuerName: parsedInput.data.issuerName,
        issuerTaxId: parsedInput.data.issuerTaxId,
        notes: parsedInput.data.notes,
      },
      {
        serviceRepository: new PrismaServiceRepository(prisma),
        invoiceRepository: new PrismaInvoiceRepository(prisma),
      },
    );

    return {
      values: initialCreateInvoiceFormValues,
      errors: {},
      notification: {
        type: "success",
        message: "Factura registrada correctamente.",
        nonce: Date.now(),
      },
    };
  } catch (error) {
    if (error instanceof CreateInvoiceForServiceUseCaseError) {
      return {
        values,
        errors: {
          form: error.message,
        },
        notification: {
          type: "error",
          message: error.message,
          nonce: Date.now(),
        },
      };
    }

    return {
      values,
      errors: {
        form: "No se pudo guardar la factura. Intentalo de nuevo.",
      },
      notification: {
        type: "error",
        message: "No se pudo guardar la factura. Intentalo de nuevo.",
        nonce: Date.now(),
      },
    };
  }
}
