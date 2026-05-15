"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  AdminCatalogError,
  createPersonUseCase,
  setPersonActiveStatusUseCase,
  updatePersonUseCase,
} from "@/modules/reimbursement/application/AdminCatalogUseCases";
import { PrismaReimbursementAdminCatalogRepository } from "@/modules/reimbursement/infrastructure/PrismaReimbursementAdminCatalogRepository";
import { AuthorizationError, requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";
import type { AdminMutationState } from "@/app/(private)/admin/people/action-state";

const createSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  documentNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateSchema = z.object({
  personId: z.string().trim().uuid(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  documentNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  isActive: z.enum(["true", "false"]),
});

const activeSchema = z.object({
  personId: z.string().trim().uuid(),
  isActive: z.enum(["true", "false"]),
});

export async function createPersonAction(_previous: AdminMutationState, formData: FormData): Promise<AdminMutationState> {
  if (!(await isAdmin())) {
    return fail("Solo un ADMIN puede crear personas.");
  }

  const parsed = createSchema.safeParse(values(formData, ["firstName", "lastName", "displayName", "documentNumber", "notes"]));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
  }

  try {
    await createPersonUseCase(parsed.data, {
      catalogRepository: new PrismaReimbursementAdminCatalogRepository(prisma),
    });
  } catch (error) {
    if (error instanceof AdminCatalogError) {
      return fail(error.message);
    }
    throw error;
  }

  revalidatePath("/admin/people");
  return ok("Persona creada.");
}

export async function updatePersonAction(_previous: AdminMutationState, formData: FormData): Promise<AdminMutationState> {
  if (!(await isAdmin())) {
    return fail("Solo un ADMIN puede editar personas.");
  }

  const parsed = updateSchema.safeParse(values(formData, ["personId", "firstName", "lastName", "displayName", "documentNumber", "notes", "isActive"]));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
  }

  try {
    await updatePersonUseCase(
      {
        ...parsed.data,
        isActive: parsed.data.isActive === "true",
      },
      {
        catalogRepository: new PrismaReimbursementAdminCatalogRepository(prisma),
      },
    );
  } catch (error) {
    if (error instanceof AdminCatalogError) {
      return fail(error.message);
    }
    throw error;
  }

  revalidatePath("/admin/people");
  return ok("Persona actualizada.");
}

export async function togglePersonActiveAction(_previous: AdminMutationState, formData: FormData): Promise<AdminMutationState> {
  if (!(await isAdmin())) {
    return fail("Solo un ADMIN puede activar o desactivar personas.");
  }

  const parsed = activeSchema.safeParse(values(formData, ["personId", "isActive"]));
  if (!parsed.success) {
    return fail("Revisa los datos de estado.");
  }

  try {
    await setPersonActiveStatusUseCase(
      {
        personId: parsed.data.personId,
        isActive: parsed.data.isActive === "true",
      },
      {
        catalogRepository: new PrismaReimbursementAdminCatalogRepository(prisma),
      },
    );
  } catch (error) {
    if (error instanceof AdminCatalogError) {
      return fail(error.message);
    }
    throw error;
  }

  revalidatePath("/admin/people");
  return ok(parsed.data.isActive === "true" ? "Persona activada." : "Persona desactivada.");
}

async function isAdmin() {
  try {
    await requireRole(USER_ROLES.ADMIN);
    return true;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return false;
    }
    throw error;
  }
}

function values(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, toString(formData.get(key))]));
}

function toString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function ok(message: string): AdminMutationState {
  return { status: "success", message, token: Date.now() };
}

function fail(message: string): AdminMutationState {
  return { status: "error", message, token: Date.now() };
}
