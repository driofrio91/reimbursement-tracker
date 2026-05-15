import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { listUsersUseCase } from "@/lib/auth/application/AdminUserManagementUseCases";
import { PrismaAdminUserRepository } from "@/lib/auth/infrastructure/PrismaAdminUserRepository";
import { USER_ROLES } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";
import { UsersAdminClient } from "@/app/(private)/admin/users/UsersAdminClient";

export default async function AdminUsersPage() {
  const actor = await requireRole(USER_ROLES.ADMIN).catch(() => {
    redirect("/");
  });
  const users = await listUsersUseCase({
    userRepository: new PrismaAdminUserRepository(prisma),
  });

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Gestion de usuarios</h1>
          <p className="mt-2 text-sm text-slate-600">Solo ADMIN. Crea usuarios, asigna roles y gestiona activacion.</p>
        </section>

        <UsersAdminClient users={users} actorId={actor.id} />
      </div>
    </main>
  );
}
