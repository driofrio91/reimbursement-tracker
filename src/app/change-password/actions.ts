"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth/auth";
import { z } from "zod";

import {
  ChangeOwnPasswordUseCaseError,
  changeOwnPasswordUseCase,
} from "@/lib/auth/application/ChangeOwnPasswordUseCase";
import { requireAuth } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import { BcryptPasswordService } from "@/lib/auth/infrastructure/BcryptPasswordService";
import { PrismaUserCredentialsRepository } from "@/lib/auth/infrastructure/PrismaUserCredentialsRepository";
import { ChangePasswordFormState } from "@/app/change-password/ChangePasswordFormState";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string().min(1),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    message: "La confirmacion de la nueva contrasena no coincide.",
    path: ["confirmNewPassword"],
  });

export async function changeOwnPasswordAction(
  _previousState: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> {
  const actor = await requireAuth();

  const parsedInput = changePasswordSchema.safeParse({
    currentPassword: getString(formData, "currentPassword"),
    newPassword: getString(formData, "newPassword"),
    confirmNewPassword: getString(formData, "confirmNewPassword"),
  });

  if (!parsedInput.success) {
    return {
      status: "error",
      message: parsedInput.error.issues[0]?.message ?? "Revisa los datos del formulario.",
    };
  }

  try {
    await changeOwnPasswordUseCase(actor.id, parsedInput.data.currentPassword, parsedInput.data.newPassword, {
      userCredentialsRepository: new PrismaUserCredentialsRepository(prisma),
      passwordService: new BcryptPasswordService(),
    });
  } catch (error) {
    if (error instanceof ChangeOwnPasswordUseCaseError) {
      return {
        status: "error",
        message: toChangePasswordErrorMessage(error),
      };
    }

    return {
      status: "error",
      message: "No se pudo actualizar la contrasena en este momento.",
    };
  }

  await signOut({ redirect: false });
  redirect("/login?passwordChanged=1");
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function toChangePasswordErrorMessage(error: ChangeOwnPasswordUseCaseError): string {
  switch (error.code) {
    case "USER_NOT_FOUND":
      return "No se encontro el usuario autenticado.";
    case "INVALID_CURRENT_PASSWORD":
      return "La contrasena actual no coincide.";
    case "INVALID_NEW_PASSWORD":
      return "La nueva contrasena debe tener al menos 8 caracteres.";
    case "NEW_PASSWORD_EQUALS_CURRENT":
      return "La nueva contrasena debe ser diferente a la actual.";
  }
}
