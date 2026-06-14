import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { listInsurersUseCase } from "@/modules/reimbursement/application/AdminCatalogUseCases";
import { PrismaReimbursementAdminCatalogRepository } from "@/modules/reimbursement/infrastructure/PrismaReimbursementAdminCatalogRepository";
import { prisma } from "@/lib/db/prisma";
import { InsurersAdminClient } from "@/app/(private)/admin/insurers/InsurersAdminClient";

export default async function AdminInsurersPage() {
  await requireRole(USER_ROLES.ADMIN).catch(() => {
    redirect("/");
  });
  const repository = new PrismaReimbursementAdminCatalogRepository(prisma);
  const insurers = await listInsurersUseCase({
    catalogRepository: repository,
  });
  const inUseById = new Map<string, boolean>(
    await Promise.all(insurers.map(async (insurer) => [insurer.id, await repository.isInsurerInUse(insurer.id)] as const)),
  );
  const inUseMap = Object.fromEntries(Array.from(inUseById.entries()));

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Gestion de aseguradoras</h1>
          <p className="mt-2 text-sm text-slate-600">Catalogo administrativo con bloqueo de desactivacion cuando hay uso historico.</p>
        </section>

        <InsurersAdminClient insurers={insurers} inUseById={inUseMap} />
      </div>
    </main>
  );
}
