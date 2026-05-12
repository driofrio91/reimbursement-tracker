export interface UserCredentialsRecord {
  id: string;
  passwordHash: string;
}

export interface UserCredentialsRepository {
  getById(userId: string): Promise<UserCredentialsRecord | null>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}

export interface PasswordService {
  compare(plainText: string, hash: string): Promise<boolean>;
  hash(plainText: string): Promise<string>;
}

export type ChangeOwnPasswordUseCaseErrorCode =
  | "USER_NOT_FOUND"
  | "INVALID_CURRENT_PASSWORD"
  | "INVALID_NEW_PASSWORD"
  | "NEW_PASSWORD_EQUALS_CURRENT";

export class ChangeOwnPasswordUseCaseError extends Error {
  constructor(public readonly code: ChangeOwnPasswordUseCaseErrorCode, message: string) {
    super(message);
    this.name = "ChangeOwnPasswordUseCaseError";
  }
}

interface ChangeOwnPasswordUseCaseDependencies {
  userCredentialsRepository: UserCredentialsRepository;
  passwordService: PasswordService;
}

export async function changeOwnPasswordUseCase(
  userId: string,
  currentPassword: string,
  newPassword: string,
  dependencies: ChangeOwnPasswordUseCaseDependencies,
): Promise<void> {
  const normalizedCurrentPassword = currentPassword.trim();
  const normalizedNewPassword = newPassword.trim();

  if (!normalizedCurrentPassword || !normalizedNewPassword || normalizedNewPassword.length < 8) {
    throw new ChangeOwnPasswordUseCaseError(
      "INVALID_NEW_PASSWORD",
      "La nueva contrasena debe tener al menos 8 caracteres.",
    );
  }

  const user = await dependencies.userCredentialsRepository.getById(userId);

  if (!user) {
    throw new ChangeOwnPasswordUseCaseError("USER_NOT_FOUND", "El usuario no existe o ya no esta activo.");
  }

  const isCurrentPasswordValid = await dependencies.passwordService.compare(normalizedCurrentPassword, user.passwordHash);

  if (!isCurrentPasswordValid) {
    throw new ChangeOwnPasswordUseCaseError(
      "INVALID_CURRENT_PASSWORD",
      "La contrasena actual no coincide.",
    );
  }

  const isSamePassword = await dependencies.passwordService.compare(normalizedNewPassword, user.passwordHash);

  if (isSamePassword) {
    throw new ChangeOwnPasswordUseCaseError(
      "NEW_PASSWORD_EQUALS_CURRENT",
      "La nueva contrasena debe ser diferente a la actual.",
    );
  }

  const nextPasswordHash = await dependencies.passwordService.hash(normalizedNewPassword);

  await dependencies.userCredentialsRepository.updatePassword(user.id, nextPasswordHash);
}
