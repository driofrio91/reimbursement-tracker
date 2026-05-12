import { describe, expect, it, vi } from "vitest";

import {
  getOrCreateUserAnnualReimbursementLimitUseCase,
  GetOrCreateUserAnnualReimbursementLimitUseCaseError,
} from "@/modules/reimbursement/application/GetOrCreateUserAnnualReimbursementLimitUseCase";
import { UserAnnualReimbursementLimitRepository } from "@/modules/reimbursement/domain/UserAnnualReimbursementLimitRepository";

function createRepositoryMock(): UserAnnualReimbursementLimitRepository {
  return {
    getByUserIdAndYear: vi.fn(),
    create: vi.fn(),
  };
}

describe("GetOrCreateUserAnnualReimbursementLimitUseCase", () => {
  it("returns existing annual limit without creating new record", async () => {
    const repository = createRepositoryMock();

    vi.mocked(repository.getByUserIdAndYear).mockResolvedValue({
      id: "limit-1",
      userId: "user-1",
      year: 2026,
      annualLimitAmount: 1500,
      reimbursedAccumulated: 120,
      currency: "EUR",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    const result = await getOrCreateUserAnnualReimbursementLimitUseCase("user-1", 2026, { repository });

    expect(result.id).toBe("limit-1");
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("creates annual limit with defaults when record does not exist", async () => {
    const repository = createRepositoryMock();

    vi.mocked(repository.getByUserIdAndYear).mockResolvedValue(null);
    vi.mocked(repository.create).mockResolvedValue({
      id: "limit-2",
      userId: "user-2",
      year: 2026,
      annualLimitAmount: 1500,
      reimbursedAccumulated: 0,
      currency: "EUR",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const result = await getOrCreateUserAnnualReimbursementLimitUseCase("user-2", 2026, { repository });

    expect(repository.create).toHaveBeenCalledWith({
      userId: "user-2",
      year: 2026,
      annualLimitAmount: 1500,
      reimbursedAccumulated: 0,
      currency: "EUR",
    });
    expect(result.id).toBe("limit-2");
  });

  it("rejects invalid year", async () => {
    const repository = createRepositoryMock();

    await expect(getOrCreateUserAnnualReimbursementLimitUseCase("user-1", 1900, { repository })).rejects.toMatchObject({
      name: "GetOrCreateUserAnnualReimbursementLimitUseCaseError",
    } satisfies Partial<GetOrCreateUserAnnualReimbursementLimitUseCaseError>);
  });
});
