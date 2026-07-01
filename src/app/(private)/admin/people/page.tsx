import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { USER_ROLES } from "@/lib/auth/roles";
import { listPeopleUseCase } from "@/modules/reimbursement/application/AdminCatalogUseCases";
import { PrismaReimbursementAdminCatalogRepository } from "@/modules/reimbursement/infrastructure/PrismaReimbursementAdminCatalogRepository";
import { prisma } from "@/lib/db/prisma";
import { PeopleAdminClient } from "@/app/(private)/admin/people/PeopleAdminClient";

export default async function AdminPeoplePage() {
  await requireRole(USER_ROLES.ADMIN).catch(() => {
    redirect("/");
  });
  const people = await listPeopleUseCase({
    catalogRepository: new PrismaReimbursementAdminCatalogRepository(prisma),
  });

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Gestion de personas</h1>
          <p className="mt-2 text-sm text-slate-600">Catalogo operativo para imputacion de servicios y facturas.</p>
        </section>

        <PeopleAdminClient people={people} />
      </div>
    </main>
  );
}
