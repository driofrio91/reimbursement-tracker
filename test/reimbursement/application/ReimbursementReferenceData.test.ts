import { describe, expect, it, vi } from "vitest";

import { getReimbursementReferenceDataUseCase } from "@/modules/reimbursement/application/ReimbursementReferenceData";
import type { ReferenceDataRepository } from "@/modules/reimbursement/application/ReimbursementReferenceData";

describe("getReimbursementReferenceDataUseCase", () => {
  it("returns reference data from the repository", async () => {
    const referenceData = {
      people: [{ id: "person-1", displayName: "Ada Lovelace" }],
      insurers: [{ id: "insurer-1", name: "Acme Insurance" }],
    };
    const repository: ReferenceDataRepository = {
      getReferenceData: vi.fn().mockResolvedValue(referenceData),
    };

    const result = await getReimbursementReferenceDataUseCase({
      referenceDataRepository: repository,
    });

    expect(result).toEqual(referenceData);
    expect(repository.getReferenceData).toHaveBeenCalledTimes(1);
  });

  it("propagates repository errors", async () => {
    const repository: ReferenceDataRepository = {
      getReferenceData: vi.fn().mockRejectedValue(new Error("db failure")),
    };

    await expect(
      getReimbursementReferenceDataUseCase({
        referenceDataRepository: repository,
      }),
    ).rejects.toThrow("db failure");
  });
});
