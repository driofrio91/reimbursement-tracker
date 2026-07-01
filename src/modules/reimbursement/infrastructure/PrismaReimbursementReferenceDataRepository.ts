import type { PrismaClient } from "@prisma/client";

import type {
  ReferenceDataRepository,
  ReimbursementReferenceData,
} from "@/modules/reimbursement/application/ReimbursementReferenceData";

export class PrismaReimbursementReferenceDataRepository implements ReferenceDataRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getReferenceData(): Promise<ReimbursementReferenceData> {
    const [people, insurers] = await Promise.all([
      this.prisma.person.findMany({
        where: { isActive: true },
        select: { id: true, displayName: true },
        orderBy: { displayName: "asc" },
      }),
      this.prisma.insurer.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return { people, insurers };
  }
}
