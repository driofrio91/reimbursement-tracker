import { describe, expect, it } from "vitest";

import { getServiceDetailUseCase } from "@/modules/reimbursement/application/GetServiceDetailUseCase";

import { createServiceRepositoryMock } from "../support/RepositoryMocks";
import { buildService } from "../support/ServiceTestBuilders";

describe("GetServiceDetailUseCase", () => {
  it("returns the service when repository finds it", async () => {
    const repository = createServiceRepositoryMock();
    const service = buildService();

    repository.getById.mockResolvedValue(service);

    const result = await getServiceDetailUseCase("service-1", {
      serviceRepository: repository,
    });

    expect(result).toEqual(service);
  });

  it("returns null when repository does not find the service", async () => {
    const repository = createServiceRepositoryMock();

    repository.getById.mockResolvedValue(null);

    const result = await getServiceDetailUseCase("service-missing", {
      serviceRepository: repository,
    });

    expect(result).toBeNull();
  });

  it("calls repository with the same service id", async () => {
    const repository = createServiceRepositoryMock();

    repository.getById.mockResolvedValue(null);

    await getServiceDetailUseCase("service-42", {
      serviceRepository: repository,
    });

    expect(repository.getById).toHaveBeenCalledWith("service-42");
    expect(repository.getById).toHaveBeenCalledTimes(1);
  });

  it("propagates repository errors", async () => {
    const repository = createServiceRepositoryMock();

    repository.getById.mockRejectedValue(new Error("db failure"));

    await expect(
      getServiceDetailUseCase("service-1", {
        serviceRepository: repository,
      }),
    ).rejects.toThrow("db failure");
  });
});
