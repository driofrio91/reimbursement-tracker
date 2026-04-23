import { describe, expect, it } from "vitest";

import { createServiceUseCase } from "@/modules/reimbursement/application/CreateServiceUseCase";

import { createServiceRepositoryMock } from "../support/RepositoryMocks";
import { buildCreateServiceInput, buildService } from "../support/ServiceTestBuilders";

describe("CreateServiceUseCase", () => {
  it("creates a service with the expected defaults", async () => {
    const repository = createServiceRepositoryMock();
    const input = buildCreateServiceInput({ attended: undefined });

    repository.personExists.mockResolvedValue(true);
    repository.insurerIsActive.mockResolvedValue(true);
    repository.create.mockResolvedValue(buildService());

    const result = await createServiceUseCase(input, {
      serviceRepository: repository,
    });

    expect(result).toEqual({ id: "service-1" });
    expect(repository.create).toHaveBeenCalledWith({
      serviceDate: input.serviceDate,
      description: "Consulta de fisioterapia",
      actualAmount: 200,
      currency: "EUR",
      personId: "person-1",
      insurerId: "insurer-1",
      policyHolderName: "Ana Perez",
      attended: true,
      status: "REGISTERED",
      notes: "Sin incidencias",
    });
  });

  it("trims description, policy holder and notes before creating", async () => {
    const repository = createServiceRepositoryMock();
    const input = buildCreateServiceInput({
      description: "  Consulta de rehabilitacion  ",
      policyHolderName: "  Luis Garcia  ",
      notes: "  Nota interna  ",
    });

    repository.personExists.mockResolvedValue(true);
    repository.insurerIsActive.mockResolvedValue(true);
    repository.create.mockResolvedValue(buildService());

    await createServiceUseCase(input, {
      serviceRepository: repository,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Consulta de rehabilitacion",
        policyHolderName: "Luis Garcia",
        notes: "Nota interna",
      }),
    );
  });

  it("converts blank notes to undefined", async () => {
    const repository = createServiceRepositoryMock();
    const input = buildCreateServiceInput({ notes: "   " });

    repository.personExists.mockResolvedValue(true);
    repository.insurerIsActive.mockResolvedValue(true);
    repository.create.mockResolvedValue(buildService({ notes: null }));

    await createServiceUseCase(input, {
      serviceRepository: repository,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: undefined,
      }),
    );
  });

  it("fails when the amount is not greater than zero", async () => {
    const repository = createServiceRepositoryMock();
    const input = buildCreateServiceInput({ actualAmount: 0 });

    await expect(
      createServiceUseCase(input, {
        serviceRepository: repository,
      }),
    ).rejects.toMatchObject({
      code: "INVALID_AMOUNT",
    });

    expect(repository.personExists).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("fails when the person does not exist", async () => {
    const repository = createServiceRepositoryMock();

    repository.personExists.mockResolvedValue(false);
    repository.insurerIsActive.mockResolvedValue(true);

    await expect(
      createServiceUseCase(buildCreateServiceInput(), {
        serviceRepository: repository,
      }),
    ).rejects.toMatchObject({
      code: "PERSON_NOT_FOUND",
    });

    expect(repository.create).not.toHaveBeenCalled();
  });

  it("fails when the insurer does not exist or is inactive", async () => {
    const repository = createServiceRepositoryMock();

    repository.personExists.mockResolvedValue(true);
    repository.insurerIsActive.mockResolvedValue(false);

    await expect(
      createServiceUseCase(buildCreateServiceInput(), {
        serviceRepository: repository,
      }),
    ).rejects.toMatchObject({
      code: "INSURER_NOT_FOUND_OR_INACTIVE",
    });

    expect(repository.create).not.toHaveBeenCalled();
  });
});
