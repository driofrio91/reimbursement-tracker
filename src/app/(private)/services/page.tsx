import { listServicesUseCase } from "@/modules/reimbursement/application/ListServicesUseCase";
import { PrismaServiceRepository } from "@/modules/reimbursement/infrastructure/PrismaServiceRepository";
import { ServicesList } from "@/modules/reimbursement/ui/ServicesList";
import { prisma } from "@/lib/db/prisma";

export default async function ServicesPage() {
  const services = await listServicesUseCase({
    serviceRepository: new PrismaServiceRepository(prisma),
  });

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16 sm:px-10">
        <ServicesList services={services} />
      </div>
    </main>
  );
}
