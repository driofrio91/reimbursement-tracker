import { prisma } from "@/lib/db/prisma";

export interface ReferencePerson {
  id: string;
  displayName: string;
}

export interface ReferenceInsurer {
  id: string;
  name: string;
}

export async function getReimbursementReferenceData(): Promise<{
  people: ReferencePerson[];
  insurers: ReferenceInsurer[];
}> {
  const [people, insurers] = await Promise.all([
    prisma.person.findMany({
      where: { isActive: true },
      select: { id: true, displayName: true },
      orderBy: { displayName: "asc" },
    }),
    prisma.insurer.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { people, insurers };
}
