import { UserRole } from "@/lib/auth/roles";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mustChangePasswordOnFirstLogin: boolean;
  createdAt: Date;
}

export interface AdminUserRepository {
  list(): Promise<AdminUserRecord[]>;
  getById(userId: string): Promise<AdminUserRecord | null>;
  getByEmail(email: string): Promise<AdminUserRecord | null>;
  create(input: {
    name: string;
    email: string;
    role: UserRole;
    passwordHash: string;
    mustChangePasswordOnFirstLogin: boolean;
    isActive: boolean;
  }): Promise<AdminUserRecord>;
  update(input: {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    passwordHash?: string;
    mustChangePasswordOnFirstLogin?: boolean;
  }): Promise<AdminUserRecord | null>;
  setActive(userId: string, isActive: boolean): Promise<AdminUserRecord | null>;
}

export interface PasswordHashService {
  hash(value: string): Promise<string>;
}

export class AdminUserManagementError extends Error {
  constructor(
    readonly code: "EMAIL_ALREADY_IN_USE" | "USER_NOT_FOUND" | "SELF_DEACTIVATION_NOT_ALLOWED" | "INVALID_TEMP_PASSWORD",
    message: string,
  ) {
    super(message);
    this.name = "AdminUserManagementError";
  }
}

export async function listUsersUseCase(dependencies: { userRepository: Pick<AdminUserRepository, "list"> }) {
  return dependencies.userRepository.list();
}

export async function createUserUseCase(
  input: {
    name: string;
    email: string;
    role: UserRole;
    temporaryPassword: string;
  },
  dependencies: {
    userRepository: Pick<AdminUserRepository, "getByEmail" | "create">;
    passwordHashService: PasswordHashService;
  },
) {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (input.temporaryPassword.length < 8) {
    throw new AdminUserManagementError("INVALID_TEMP_PASSWORD", "La contrasena temporal debe tener al menos 8 caracteres.");
  }

  const existing = await dependencies.userRepository.getByEmail(normalizedEmail);

  if (existing) {
    throw new AdminUserManagementError("EMAIL_ALREADY_IN_USE", "El email ya esta en uso.");
  }

  const passwordHash = await dependencies.passwordHashService.hash(input.temporaryPassword);

  return dependencies.userRepository.create({
    name: input.name.trim(),
    email: normalizedEmail,
    role: input.role,
    passwordHash,
    mustChangePasswordOnFirstLogin: true,
    isActive: true,
  });
}

export async function updateUserUseCase(
  input: {
    userId: string;
    actorUserId: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    temporaryPassword?: string;
  },
  dependencies: {
    userRepository: Pick<AdminUserRepository, "getById" | "getByEmail" | "update">;
    passwordHashService: PasswordHashService;
  },
) {
  const existing = await dependencies.userRepository.getById(input.userId);

  if (!existing) {
    throw new AdminUserManagementError("USER_NOT_FOUND", "No se encontro el usuario.");
  }

  if (input.userId === input.actorUserId && !input.isActive) {
    throw new AdminUserManagementError("SELF_DEACTIVATION_NOT_ALLOWED", "No puedes desactivar tu propio usuario.");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const emailOwner = await dependencies.userRepository.getByEmail(normalizedEmail);

  if (emailOwner && emailOwner.id !== input.userId) {
    throw new AdminUserManagementError("EMAIL_ALREADY_IN_USE", "El email ya esta en uso.");
  }

  const temporaryPassword = (input.temporaryPassword ?? "").trim();
  let passwordHash: string | undefined;
  let mustChangePasswordOnFirstLogin: boolean | undefined;

  if (temporaryPassword.length > 0) {
    if (temporaryPassword.length < 8) {
      throw new AdminUserManagementError("INVALID_TEMP_PASSWORD", "La contrasena temporal debe tener al menos 8 caracteres.");
    }

    passwordHash = await dependencies.passwordHashService.hash(temporaryPassword);
    mustChangePasswordOnFirstLogin = true;
  }

  const updated = await dependencies.userRepository.update({
    userId: input.userId,
    name: input.name.trim(),
    email: normalizedEmail,
    role: input.role,
    isActive: input.isActive,
    passwordHash,
    mustChangePasswordOnFirstLogin,
  });

  if (!updated) {
    throw new AdminUserManagementError("USER_NOT_FOUND", "No se encontro el usuario.");
  }

  return updated;
}

export async function setUserActiveStatusUseCase(
  input: {
    userId: string;
    actorUserId: string;
    isActive: boolean;
  },
  dependencies: {
    userRepository: Pick<AdminUserRepository, "setActive">;
  },
) {
  if (input.userId === input.actorUserId && !input.isActive) {
    throw new AdminUserManagementError("SELF_DEACTIVATION_NOT_ALLOWED", "No puedes desactivar tu propio usuario.");
  }

  const updated = await dependencies.userRepository.setActive(input.userId, input.isActive);

  if (!updated) {
    throw new AdminUserManagementError("USER_NOT_FOUND", "No se encontro el usuario.");
  }

  return updated;
}
