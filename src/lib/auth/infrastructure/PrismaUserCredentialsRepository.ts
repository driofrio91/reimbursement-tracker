import { PrismaClient } from "@prisma/client";

import { UserCredentialsRecord, UserCredentialsRepository } from "@/lib/auth/application/ChangeOwnPasswordUseCase";

export class PrismaUserCredentialsRepository implements UserCredentialsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(userId: string): Promise<UserCredentialsRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      passwordHash: user.passwordHash,
    };
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePasswordOnFirstLogin: false,
      },
    });
  }
}
