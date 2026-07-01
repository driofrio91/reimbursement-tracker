import { describe, expect, it } from "vitest";

import { getAnnualLimitsDashboardUseCase } from "@/modules/reimbursement/application/GetAnnualLimitsDashboardUseCase";

import { createPersonAnnualReimbursementLimitRepositoryMock } from "../support/RepositoryMocks";

describe("GetAnnualLimitsDashboardUseCase", () => {
  it("maps values and sorts by higher consumption", async () => {
    const repository = createPersonAnnualReimbursementLimitRepositoryMock();

    repository.listByYear.mockResolvedValue([
      {
        insuranceHolderPersonId: "p-1",
        insuranceHolderPersonName: "Ana",
        insurerId: "i-1",
        insurerName: "Aseguradora Uno",
        annualLimitAmount: 1500,
        reimbursedAccumulated: 600,
        currency: "EUR",
      },
      {
        insuranceHolderPersonId: "p-2",
        insuranceHolderPersonName: "Bruno",
        insurerId: "i-2",
        insurerName: "Aseguradora Dos",
        annualLimitAmount: 1500,
        reimbursedAccumulated: 1200,
        currency: "EUR",
      },
    ]);

    const result = await getAnnualLimitsDashboardUseCase(2026, {
      annualLimitRepository: repository,
    });

    expect(result[0]).toMatchObject({
      insuranceHolderPersonId: "p-2",
      percentageUsed: 80,
      trafficLight: "amber",
      remainingAmount: 300,
      excessAmount: 0,
      progressPercentage: 80,
    });

    expect(result[1]).toMatchObject({
      insuranceHolderPersonId: "p-1",
      percentageUsed: 40,
      trafficLight: "green",
      remainingAmount: 900,
      excessAmount: 0,
      progressPercentage: 40,
    });
  });

  it("marks over-limit rows as red and clamps progress bar", async () => {
    const repository = createPersonAnnualReimbursementLimitRepositoryMock();

    repository.listByYear.mockResolvedValue([
      {
        insuranceHolderPersonId: "p-9",
        insuranceHolderPersonName: "Carla",
        insurerId: "i-9",
        insurerName: "Aseguradora Tres",
        annualLimitAmount: 1500,
        reimbursedAccumulated: 1800,
        currency: "EUR",
      },
    ]);

    const [row] = await getAnnualLimitsDashboardUseCase(2026, {
      annualLimitRepository: repository,
    });

    expect(row).toMatchObject({
      trafficLight: "red",
      percentageUsed: 120,
      progressPercentage: 100,
      remainingAmount: 0,
      excessAmount: 300,
    });
  });

  it("returns empty list when there is no data", async () => {
    const repository = createPersonAnnualReimbursementLimitRepositoryMock();

    repository.listByYear.mockResolvedValue([]);

    const result = await getAnnualLimitsDashboardUseCase(2026, {
      annualLimitRepository: repository,
    });

    expect(result).toEqual([]);
  });
});
