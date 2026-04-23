import { describe, expect, it } from "vitest";

import { listServicesUseCase } from "@/modules/reimbursement/application/ListServicesUseCase";

import { createServiceRepositoryMock } from "../support/RepositoryMocks";
import { buildService } from "../support/ServiceTestBuilders";

describe("ListServicesUseCase", () => {
  it("returns services from repository", async () => {
    const repository = createServiceRepositoryMock();
    const services = [buildService({ id: "service-1" }), buildService({ id: "service-2" })];

    repository.list.mockResolvedValue(services);

    const result = await listServicesUseCase({
      serviceRepository: repository,
    });

    expect(result).toEqual(services);
  });

  it("returns an empty array when repository has no services", async () => {
    const repository = createServiceRepositoryMock();

    repository.list.mockResolvedValue([]);

    const result = await listServicesUseCase({
      serviceRepository: repository,
    });

    expect(result).toEqual([]);
  });

  it("calls repository list once", async () => {
    const repository = createServiceRepositoryMock();

    repository.list.mockResolvedValue([]);

    await listServicesUseCase({
      serviceRepository: repository,
    });

    expect(repository.list).toHaveBeenCalledTimes(1);
  });

  it("propagates repository errors", async () => {
    const repository = createServiceRepositoryMock();

    repository.list.mockRejectedValue(new Error("db failure"));

    await expect(
      listServicesUseCase({
        serviceRepository: repository,
      }),
    ).rejects.toThrow("db failure");
  });
});
