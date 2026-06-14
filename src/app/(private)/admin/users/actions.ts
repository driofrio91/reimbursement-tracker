"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  AdminUserManagementError,
  createUserUseCase,
  setUserActiveStatusUseCase,
  updateUserUseCase,
} from "@/lib/auth/application/AdminUserManagementUseCases";
import { BcryptPasswordService } from "@/lib/auth/infrastructure/BcryptPasswordService";
import { PrismaAdminUserRepository } from "@/lib/auth/infrastructure/PrismaAdminUserRepository";
import { AuthorizationError, requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";
import type { AdminMutationState } from "@/app/(private)/admin/users/action-state";

const createUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.USER]),
  temporaryPassword: z.string().min(8),
});

const updateUserSchema = z.object({
  userId: z.string().trim().uuid(),
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.USER]),
  isActive: z.enum(["true", "false"]),
  temporaryPassword: z.string().optional(),
});

const toggleActiveSchema = z.object({
  userId: z.string().trim().uuid(),
  isActive: z.enum(["true", "false"]),
});

export async function createUserAction(
  _previous: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  const actor = await requireAdmin();
  if (!actor) {
    return fail("Solo un ADMIN puede crear usuarios.");
  }

  const parsed = createUserSchema.safeParse({
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    role: getString(formData, "role"),
    temporaryPassword: getString(formData, "temporaryPassword"),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
  }

  try {
    await createUserUseCase(parsed.data, {
      userRepository: new PrismaAdminUserRepository(prisma),
      passwordHashService: new BcryptPasswordService(),
    });
  } catch (error) {
    if (error instanceof AdminUserManagementError) {
      return fail(error.message);
    }
    throw error;
  }

  revalidatePath("/admin/users");
  return ok("Usuario creado. Debe cambiar su contrasena en el siguiente inicio de sesion.");
}

export async function updateUserAction(
  _previous: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  const actor = await requireAdmin();
  if (!actor) {
    return fail("Solo un ADMIN puede editar usuarios.");
  }

  const parsed = updateUserSchema.safeParse({
    userId: getString(formData, "userId"),
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    role: getString(formData, "role"),
    isActive: getString(formData, "isActive"),
    temporaryPassword: getString(formData, "temporaryPassword"),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
  }

  try {
    await updateUserUseCase(
      {
        userId: parsed.data.userId,
        actorUserId: actor.id,
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        isActive: parsed.data.isActive === "true",
        temporaryPassword: parsed.data.temporaryPassword,
      },
      {
        userRepository: new PrismaAdminUserRepository(prisma),
        passwordHashService: new BcryptPasswordService(),
      },
    );
  } catch (error) {
    if (error instanceof AdminUserManagementError) {
      return fail(error.message);
    }
    throw error;
  }

  revalidatePath("/admin/users");
  return ok("Usuario actualizado.");
}

export async function toggleUserActiveAction(
  _previous: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  const actor = await requireAdmin();
  if (!actor) {
    return fail("Solo un ADMIN puede activar o desactivar usuarios.");
  }

  const parsed = toggleActiveSchema.safeParse({
    userId: getString(formData, "userId"),
    isActive: getString(formData, "isActive"),
  });

  if (!parsed.success) {
    return fail("Revisa los datos de estado.");
  }

  try {
    await setUserActiveStatusUseCase(
      {
        userId: parsed.data.userId,
        actorUserId: actor.id,
        isActive: parsed.data.isActive === "true",
      },
      {
        userRepository: new PrismaAdminUserRepository(prisma),
      },
    );
  } catch (error) {
    if (error instanceof AdminUserManagementError) {
      return fail(error.message);
    }
    throw error;
  }

  revalidatePath("/admin/users");
  return ok(parsed.data.isActive === "true" ? "Usuario activado." : "Usuario desactivado.");
}

async function requireAdmin() {
  try {
    return await requireRole(USER_ROLES.ADMIN);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return null;
    }
    throw error;
  }
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function ok(message: string): AdminMutationState {
  return { status: "success", message, token: Date.now() };
}

function fail(message: string): AdminMutationState {
  return { status: "error", message, token: Date.now() };
}
