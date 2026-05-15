import { PrismaClient, UserRole as PrismaUserRole } from "@prisma/client";

import { AdminUserRecord, AdminUserRepository } from "@/lib/auth/application/AdminUserManagementUseCases";
import { USER_ROLES, UserRole } from "@/lib/auth/roles";

export class PrismaAdminUserRepository implements AdminUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<AdminUserRecord[]> {
    const users = await this.prisma.user.findMany({
      orderBy: [{ createdAt: "desc" }],
    });

    return users.map((user) => this.map(user));
  }

  async getById(userId: string): Promise<AdminUserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user ? this.map(user) : null;
  }

  async getByEmail(email: string): Promise<AdminUserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.map(user) : null;
  }

  async create(input: {
    name: string;
    email: string;
    role: UserRole;
    passwordHash: string;
    mustChangePasswordOnFirstLogin: boolean;
    isActive: boolean;
  }): Promise<AdminUserRecord> {
    const created = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: this.toPrismaRole(input.role),
        passwordHash: input.passwordHash,
        mustChangePasswordOnFirstLogin: input.mustChangePasswordOnFirstLogin,
        isActive: input.isActive,
      },
    });

    return this.map(created);
  }

  async update(input: {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    passwordHash?: string;
    mustChangePasswordOnFirstLogin?: boolean;
  }): Promise<AdminUserRecord | null> {
    const updated = await this.prisma.user.updateMany({
      where: { id: input.userId },
      data: {
        name: input.name,
        email: input.email,
        role: this.toPrismaRole(input.role),
        isActive: input.isActive,
        ...(input.passwordHash
          ? {
              passwordHash: input.passwordHash,
              mustChangePasswordOnFirstLogin: input.mustChangePasswordOnFirstLogin ?? true,
            }
          : {}),
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return this.getById(input.userId);
  }

  async setActive(userId: string, isActive: boolean): Promise<AdminUserRecord | null> {
    const updated = await this.prisma.user.updateMany({
      where: { id: userId },
      data: { isActive },
    });

    if (updated.count === 0) {
      return null;
    }

    return this.getById(userId);
  }

  private toPrismaRole(role: UserRole): PrismaUserRole {
    return role === USER_ROLES.ADMIN ? PrismaUserRole.ADMIN : PrismaUserRole.USER;
  }

  private map(user: {
    id: string;
    name: string;
    email: string;
    role: PrismaUserRole;
    isActive: boolean;
    mustChangePasswordOnFirstLogin: boolean;
    createdAt: Date;
  }): AdminUserRecord {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      mustChangePasswordOnFirstLogin: user.mustChangePasswordOnFirstLogin,
      createdAt: user.createdAt,
    };
  }
}
