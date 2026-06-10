import { PrismaClient } from "@prisma/client";

import {
  NewPersonAnnualReimbursementLimit,
  PersonAnnualReimbursementLimit,
} from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimit";
import {
  PersonAnnualLimitYearRow,
  PersonAnnualReimbursementLimitRepository,
} from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimitRepository";

export class PrismaPersonAnnualReimbursementLimitRepository implements PersonAnnualReimbursementLimitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getByPersonInsurerYear(insuranceHolderPersonId: string, insurerId: string, year: number): Promise<PersonAnnualReimbursementLimit | null> {
    const limit = await this.prisma.personAnnualReimbursementLimit.findUnique({
      where: {
        personId_insurerId_year: {
          personId: insuranceHolderPersonId,
          insurerId,
          year,
        },
      },
    });

    return limit ? this.map(limit) : null;
  }

  async create(limit: NewPersonAnnualReimbursementLimit): Promise<PersonAnnualReimbursementLimit> {
    const createdLimit = await this.prisma.personAnnualReimbursementLimit.create({
      data: {
        personId: limit.insuranceHolderPersonId,
        insurerId: limit.insurerId,
        year: limit.year,
        annualLimitAmount: limit.annualLimitAmount,
        reimbursedAccumulated: limit.reimbursedAccumulated,
        currency: limit.currency,
      },
    });

    return this.map(createdLimit);
  }

  async upsertForPersonInsurerYear(insuranceHolderPersonId: string, insurerId: string, year: number): Promise<PersonAnnualReimbursementLimit> {
    const upsertedLimit = await this.prisma.personAnnualReimbursementLimit.upsert({
      where: {
        personId_insurerId_year: {
          personId: insuranceHolderPersonId,
          insurerId,
          year,
        },
      },
      update: {},
      create: {
        personId: insuranceHolderPersonId,
        insurerId,
        year,
        annualLimitAmount: 1500,
        reimbursedAccumulated: 0,
        currency: "EUR",
      },
    });

    return this.map(upsertedLimit);
  }

  async applyDelta(insuranceHolderPersonId: string, insurerId: string, year: number, delta: number): Promise<PersonAnnualReimbursementLimit> {
    await this.upsertForPersonInsurerYear(insuranceHolderPersonId, insurerId, year);

    const updatedLimit = await this.prisma.personAnnualReimbursementLimit.update({
      where: {
        personId_insurerId_year: {
          personId: insuranceHolderPersonId,
          insurerId,
          year,
        },
      },
      data: {
        reimbursedAccumulated: {
          increment: delta,
        },
      },
    });

    return this.map(updatedLimit);
  }

  async setAccumulated(insuranceHolderPersonId: string, insurerId: string, year: number, accumulated: number): Promise<PersonAnnualReimbursementLimit> {
    await this.upsertForPersonInsurerYear(insuranceHolderPersonId, insurerId, year);

    const updatedLimit = await this.prisma.personAnnualReimbursementLimit.update({
      where: {
        personId_insurerId_year: {
          personId: insuranceHolderPersonId,
          insurerId,
          year,
        },
      },
      data: {
        reimbursedAccumulated: accumulated,
      },
    });

    return this.map(updatedLimit);
  }

  async listByYear(year: number): Promise<PersonAnnualLimitYearRow[]> {
    const rows = await this.prisma.personAnnualReimbursementLimit.findMany({
      where: { year },
      select: {
        personId: true,
        insurerId: true,
        annualLimitAmount: true,
        reimbursedAccumulated: true,
        currency: true,
        person: {
          select: {
            displayName: true,
          },
        },
        insurer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ person: { displayName: "asc" } }, { insurer: { name: "asc" } }],
    });

    return rows.map((row) => ({
      insuranceHolderPersonId: row.personId,
      insuranceHolderPersonName: row.person.displayName,
      insurerId: row.insurerId,
      insurerName: row.insurer.name,
      annualLimitAmount: row.annualLimitAmount.toNumber(),
      reimbursedAccumulated: row.reimbursedAccumulated.toNumber(),
      currency: row.currency,
    }));
  }

  private map(limit: {
    id: string;
    personId: string;
    insurerId: string;
    year: number;
    annualLimitAmount: { toNumber(): number };
    reimbursedAccumulated: { toNumber(): number };
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }): PersonAnnualReimbursementLimit {
    return {
      id: limit.id,
      insuranceHolderPersonId: limit.personId,
      insurerId: limit.insurerId,
      year: limit.year,
      annualLimitAmount: limit.annualLimitAmount.toNumber(),
      reimbursedAccumulated: limit.reimbursedAccumulated.toNumber(),
      currency: limit.currency,
      createdAt: limit.createdAt,
      updatedAt: limit.updatedAt,
    };
  }
}
