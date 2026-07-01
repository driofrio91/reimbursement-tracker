import { describe, expect, it, vi } from "vitest";

import {
  changeOwnPasswordUseCase,
  PasswordService,
  UserCredentialsRepository,
} from "@/lib/auth/application/ChangeOwnPasswordUseCase";

function buildDependencies() {
  const userCredentialsRepository: UserCredentialsRepository = {
    getById: vi.fn(),
    updatePassword: vi.fn(),
  };

  const passwordService: PasswordService = {
    compare: vi.fn(),
    hash: vi.fn(),
  };

  return { userCredentialsRepository, passwordService };
}

describe("changeOwnPasswordUseCase", () => {
  it("updates password hash and clears first-login flag through repository", async () => {
    const dependencies = buildDependencies();

    vi.mocked(dependencies.userCredentialsRepository.getById).mockResolvedValue({
      id: "user-1",
      passwordHash: "old-hash",
    });
    vi.mocked(dependencies.passwordService.compare)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    vi.mocked(dependencies.passwordService.hash).mockResolvedValue("new-hash");

    await changeOwnPasswordUseCase("user-1", "CurrentPass123", "NewPass456", dependencies);

    expect(dependencies.userCredentialsRepository.updatePassword).toHaveBeenCalledWith("user-1", "new-hash");
  });

  it("throws when current password is invalid", async () => {
    const dependencies = buildDependencies();

    vi.mocked(dependencies.userCredentialsRepository.getById).mockResolvedValue({
      id: "user-1",
      passwordHash: "old-hash",
    });
    vi.mocked(dependencies.passwordService.compare).mockResolvedValue(false);

    await expect(
      changeOwnPasswordUseCase("user-1", "WrongPass", "NewPass456", dependencies),
    ).rejects.toMatchObject({
      code: "INVALID_CURRENT_PASSWORD",
    });
  });

  it("throws when new password equals current password", async () => {
    const dependencies = buildDependencies();

    vi.mocked(dependencies.userCredentialsRepository.getById).mockResolvedValue({
      id: "user-1",
      passwordHash: "old-hash",
    });
    vi.mocked(dependencies.passwordService.compare)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    await expect(
      changeOwnPasswordUseCase("user-1", "CurrentPass123", "CurrentPass123", dependencies),
    ).rejects.toMatchObject({
      code: "NEW_PASSWORD_EQUALS_CURRENT",
    });
  });
});
