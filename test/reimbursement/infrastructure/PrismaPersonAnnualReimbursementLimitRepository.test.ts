import { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { PrismaPersonAnnualReimbursementLimitRepository } from "@/modules/reimbursement/infrastructure/PrismaPersonAnnualReimbursementLimitRepository";

type AnnualLimitRow = {
  id: string;
  insuranceHolderPersonId: string;
  insurerId: string;
  year: number;
  annualLimitAmount: number;
  reimbursedAccumulated: number;
  currency: string;
};

type ActiveCombination = {
  insuranceHolderPersonId: string;
  insurerId: string;
};

type UpdateManyArgs = {
  where: {
    year: number;
    reimbursedAccumulated?: {
      not: number;
    };
    NOT?: {
      OR: ActiveCombination[];
    };
  };
  data: {
    reimbursedAccumulated: number;
  };
};

class InMemoryAnnualLimitPrismaClient {
  deleteCalls = 0;
  deleteManyCalls = 0;

  constructor(readonly rows: AnnualLimitRow[]) {}

  readonly insuranceHolderAnnualReimbursementLimit = {
    updateMany: async (args: UpdateManyArgs): Promise<{ count: number }> => {
      let count = 0;

      for (const row of this.rows) {
        if (!this.matchesUpdateManyWhere(row, args.where)) {
          continue;
        }

        row.reimbursedAccumulated = args.data.reimbursedAccumulated;
        count += 1;
      }

      return { count };
    },
    delete: async (): Promise<never> => {
      this.deleteCalls += 1;
      throw new Error("delete must not be called");
    },
    deleteMany: async (): Promise<never> => {
      this.deleteManyCalls += 1;
      throw new Error("deleteMany must not be called");
    },
  };

  private matchesUpdateManyWhere(row: AnnualLimitRow, where: UpdateManyArgs["where"]): boolean {
    if (row.year !== where.year) {
      return false;
    }

    if (where.reimbursedAccumulated && row.reimbursedAccumulated === where.reimbursedAccumulated.not) {
      return false;
    }

    const activeCombinations = where.NOT?.OR ?? [];
    const isActiveCombination = activeCombinations.some(
      (combination) =>
        combination.insuranceHolderPersonId === row.insuranceHolderPersonId && combination.insurerId === row.insurerId,
    );

    return !isActiveCombination;
  }
}

function createRepository(rows: AnnualLimitRow[]): {
  prisma: InMemoryAnnualLimitPrismaClient;
  repository: PrismaPersonAnnualReimbursementLimitRepository;
} {
  const prisma = new InMemoryAnnualLimitPrismaClient(rows);

  return {
    prisma,
    repository: new PrismaPersonAnnualReimbursementLimitRepository(prisma as unknown as PrismaClient),
  };
}

function annualLimitRow(overrides: Partial<AnnualLimitRow>): AnnualLimitRow {
  return {
    id: "limit-id",
    insuranceHolderPersonId: "person-id",
    insurerId: "insurer-id",
    year: 2025,
    annualLimitAmount: 1500,
    reimbursedAccumulated: 100,
    currency: "EUR",
    ...overrides,
  };
}

describe("PrismaPersonAnnualReimbursementLimitRepository.zeroAccumulatedNotInYearSnapshot", () => {
  it("zeroes stale requested-year rows, preserves active requested-year keys, leaves other years untouched, and does not delete rows", async () => {
    const initialRows = [
      annualLimitRow({
        id: "active-2025",
        insuranceHolderPersonId: "person-active",
        insurerId: "insurer-active",
        year: 2025,
        reimbursedAccumulated: 275,
      }),
      annualLimitRow({
        id: "stale-2025",
        insuranceHolderPersonId: "person-stale",
        insurerId: "insurer-stale",
        year: 2025,
        reimbursedAccumulated: 180,
      }),
      annualLimitRow({
        id: "already-zero-2025",
        insuranceHolderPersonId: "person-zero",
        insurerId: "insurer-zero",
        year: 2025,
        reimbursedAccumulated: 0,
      }),
      annualLimitRow({
        id: "other-year-2024",
        insuranceHolderPersonId: "person-stale",
        insurerId: "insurer-stale",
        year: 2024,
        reimbursedAccumulated: 420,
      }),
    ];
    const { prisma, repository } = createRepository(initialRows);

    const zeroed = await repository.zeroAccumulatedNotInYearSnapshot(2025, [
      { insuranceHolderPersonId: "person-active", insurerId: "insurer-active" },
    ]);

    expect(zeroed).toBe(1);
    expect(initialRows).toHaveLength(4);
    expect(prisma.deleteCalls).toBe(0);
    expect(prisma.deleteManyCalls).toBe(0);
    expect(initialRows.find((row) => row.id === "active-2025")?.reimbursedAccumulated).toBe(275);
    expect(initialRows.find((row) => row.id === "stale-2025")?.reimbursedAccumulated).toBe(0);
    expect(initialRows.find((row) => row.id === "already-zero-2025")?.reimbursedAccumulated).toBe(0);
    expect(initialRows.find((row) => row.id === "other-year-2024")?.reimbursedAccumulated).toBe(420);
  });

  it("zeroes all non-zero rows for the requested year when the active snapshot is empty and does not delete rows", async () => {
    const initialRows = [
      annualLimitRow({ id: "first-2025", year: 2025, reimbursedAccumulated: 120 }),
      annualLimitRow({ id: "second-2025", year: 2025, reimbursedAccumulated: 340 }),
      annualLimitRow({ id: "other-year-2026", year: 2026, reimbursedAccumulated: 560 }),
    ];
    const { prisma, repository } = createRepository(initialRows);

    const zeroed = await repository.zeroAccumulatedNotInYearSnapshot(2025, []);

    expect(zeroed).toBe(2);
    expect(initialRows).toHaveLength(3);
    expect(prisma.deleteCalls).toBe(0);
    expect(prisma.deleteManyCalls).toBe(0);
    expect(initialRows.find((row) => row.id === "first-2025")?.reimbursedAccumulated).toBe(0);
    expect(initialRows.find((row) => row.id === "second-2025")?.reimbursedAccumulated).toBe(0);
    expect(initialRows.find((row) => row.id === "other-year-2026")?.reimbursedAccumulated).toBe(560);
  });
});
