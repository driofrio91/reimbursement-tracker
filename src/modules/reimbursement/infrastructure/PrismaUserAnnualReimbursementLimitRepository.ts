import { PrismaClient } from "@prisma/client";

import {
  NewUserAnnualReimbursementLimit,
  UserAnnualReimbursementLimit,
} from "@/modules/reimbursement/domain/UserAnnualReimbursementLimit";
import { UserAnnualReimbursementLimitRepository } from "@/modules/reimbursement/domain/UserAnnualReimbursementLimitRepository";

export class PrismaUserAnnualReimbursementLimitRepository implements UserAnnualReimbursementLimitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getByUserIdAndYear(userId: string, year: number): Promise<UserAnnualReimbursementLimit | null> {
    const limit = await this.prisma.userAnnualReimbursementLimit.findUnique({
      where: {
        userId_year: {
          userId,
          year,
        },
      },
    });

    return limit ? this.map(limit) : null;
  }

  async create(limit: NewUserAnnualReimbursementLimit): Promise<UserAnnualReimbursementLimit> {
    const createdLimit = await this.prisma.userAnnualReimbursementLimit.create({
      data: {
        userId: limit.userId,
        year: limit.year,
        annualLimitAmount: limit.annualLimitAmount,
        reimbursedAccumulated: limit.reimbursedAccumulated,
        currency: limit.currency,
      },
    });

    return this.map(createdLimit);
  }

  private map(limit: {
    id: string;
    userId: string;
    year: number;
    annualLimitAmount: { toNumber(): number };
    reimbursedAccumulated: { toNumber(): number };
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserAnnualReimbursementLimit {
    return {
      id: limit.id,
      userId: limit.userId,
      year: limit.year,
      annualLimitAmount: limit.annualLimitAmount.toNumber(),
      reimbursedAccumulated: limit.reimbursedAccumulated.toNumber(),
      currency: limit.currency,
      createdAt: limit.createdAt,
      updatedAt: limit.updatedAt,
    };
  }
}
