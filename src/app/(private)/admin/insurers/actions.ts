"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  AdminCatalogError,
  createInsurerUseCase,
  setInsurerActiveStatusUseCase,
  updateInsurerUseCase,
} from "@/modules/reimbursement/application/AdminCatalogUseCases";
import { PrismaReimbursementAdminCatalogRepository } from "@/modules/reimbursement/infrastructure/PrismaReimbursementAdminCatalogRepository";
import { AuthorizationError, requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";
import type { AdminMutationState } from "@/app/(private)/admin/insurers/action-state";

const createSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  notes: z.string().trim().optional(),
});

const updateSchema = z.object({
  insurerId: z.string().trim().uuid(),
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  notes: z.string().trim().optional(),
  isActive: z.enum(["true", "false"]),
});

const activeSchema = z.object({
  insurerId: z.string().trim().uuid(),
  isActive: z.enum(["true", "false"]),
});

export async function createInsurerAction(_previous: AdminMutationState, formData: FormData): Promise<AdminMutationState> {
  if (!(await isAdmin())) {
    return fail("Solo un ADMIN puede crear aseguradoras.");
  }

  const parsed = createSchema.safeParse(values(formData, ["name", "code", "notes"]));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
  }

  try {
    await createInsurerUseCase(parsed.data, {
      catalogRepository: new PrismaReimbursementAdminCatalogRepository(prisma),
    });
  } catch (error) {
    if (error instanceof AdminCatalogError) {
      return fail(error.message);
    }
    throw error;
  }

  revalidatePath("/admin/insurers");
  return ok("Aseguradora creada.");
}

export async function updateInsurerAction(_previous: AdminMutationState, formData: FormData): Promise<AdminMutationState> {
  if (!(await isAdmin())) {
    return fail("Solo un ADMIN puede editar aseguradoras.");
  }

  const parsed = updateSchema.safeParse(values(formData, ["insurerId", "name", "code", "notes", "isActive"]));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.");
  }

  try {
    await updateInsurerUseCase(
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

  revalidatePath("/admin/insurers");
  return ok("Aseguradora actualizada.");
}

export async function toggleInsurerActiveAction(_previous: AdminMutationState, formData: FormData): Promise<AdminMutationState> {
  if (!(await isAdmin())) {
    return fail("Solo un ADMIN puede activar o desactivar aseguradoras.");
  }

  const parsed = activeSchema.safeParse(values(formData, ["insurerId", "isActive"]));
  if (!parsed.success) {
    return fail("Revisa los datos de estado.");
  }

  try {
    await setInsurerActiveStatusUseCase(
      {
        insurerId: parsed.data.insurerId,
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

  revalidatePath("/admin/insurers");
  return ok(parsed.data.isActive === "true" ? "Aseguradora activada." : "Aseguradora desactivada.");
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
