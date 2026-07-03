import { describe, expect, it } from "vitest";

import { listPaginatedServicesUseCase, listServicesUseCase } from "@/modules/reimbursement/application/ListServicesUseCase";

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

  it("returns paginated services from repository", async () => {
    const repository = createServiceRepositoryMock();
    const service = buildService({ id: "service-1" });
    const paginatedResult = {
      items: [service],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };

    repository.listPaginated.mockResolvedValue(paginatedResult);

    const result = await listPaginatedServicesUseCase(
      { page: 1, pageSize: 10 },
      {
        serviceRepository: repository,
      },
    );

    expect(result).toEqual(paginatedResult);
    expect(repository.listPaginated).toHaveBeenCalledWith({ page: 1, pageSize: 10, skip: 0, take: 10 });
  });
});
