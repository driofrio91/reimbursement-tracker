import { describe, expect, it } from "vitest";

import { syncAnnualReimbursementLimitsUseCase } from "@/modules/reimbursement/application/SyncAnnualReimbursementLimitsUseCase";

import {
  createInvoiceRepositoryMock,
  createPersonAnnualReimbursementLimitRepositoryMock,
} from "../support/RepositoryMocks";

describe("SyncAnnualReimbursementLimitsUseCase", () => {
  it("reconciles paid invoice totals and zeroes stale rows only for the requested year", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getPaidAmountByPersonInsurerForYear.mockResolvedValue([
      { insuranceHolderPersonId: "person-1", insurerId: "insurer-1", amount: 125 },
      { insuranceHolderPersonId: "person-2", insurerId: "insurer-2", amount: 300 },
    ]);
    annualLimitRepository.upsertForPersonInsurerYear
      .mockResolvedValueOnce({ reimbursedAccumulated: 100 })
      .mockResolvedValueOnce({ reimbursedAccumulated: 300 });
    annualLimitRepository.setAccumulated.mockResolvedValue({ reimbursedAccumulated: 125 });
    annualLimitRepository.zeroAccumulatedNotInYearSnapshot.mockResolvedValue(1);

    const result = await syncAnnualReimbursementLimitsUseCase(2025, {
      invoiceRepository,
      annualLimitRepository,
    });

    expect(invoiceRepository.getPaidAmountByPersonInsurerForYear).toHaveBeenCalledWith(2025);
    expect(annualLimitRepository.setAccumulated).toHaveBeenCalledWith("person-1", "insurer-1", 2025, 125);
    expect(annualLimitRepository.zeroAccumulatedNotInYearSnapshot).toHaveBeenCalledWith(2025, [
      { insuranceHolderPersonId: "person-1", insurerId: "insurer-1" },
      { insuranceHolderPersonId: "person-2", insurerId: "insurer-2" },
    ]);
    expect(result).toEqual({
      year: 2025,
      combinationsProcessed: 2,
      adjusted: 1,
      unchanged: 1,
      zeroed: 1,
      errors: 0,
    });
  });

  it("zeroes all existing rows for the year when the paid invoice snapshot is empty", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getPaidAmountByPersonInsurerForYear.mockResolvedValue([]);
    annualLimitRepository.zeroAccumulatedNotInYearSnapshot.mockResolvedValue(3);

    const result = await syncAnnualReimbursementLimitsUseCase(2024, {
      invoiceRepository,
      annualLimitRepository,
    });

    expect(annualLimitRepository.upsertForPersonInsurerYear).not.toHaveBeenCalled();
    expect(annualLimitRepository.setAccumulated).not.toHaveBeenCalled();
    expect(annualLimitRepository.zeroAccumulatedNotInYearSnapshot).toHaveBeenCalledWith(2024, []);
    expect(result).toMatchObject({
      year: 2024,
      combinationsProcessed: 0,
      adjusted: 0,
      unchanged: 0,
      zeroed: 3,
      errors: 0,
    });
  });

  it("preserves existing row error accounting and records zeroing failures", async () => {
    const invoiceRepository = createInvoiceRepositoryMock();
    const annualLimitRepository = createPersonAnnualReimbursementLimitRepositoryMock();

    invoiceRepository.getPaidAmountByPersonInsurerForYear.mockResolvedValue([
      { insuranceHolderPersonId: "person-1", insurerId: "insurer-1", amount: 125 },
    ]);
    annualLimitRepository.upsertForPersonInsurerYear.mockRejectedValue(new Error("upsert failed"));
    annualLimitRepository.zeroAccumulatedNotInYearSnapshot.mockRejectedValue(new Error("zero failed"));

    const result = await syncAnnualReimbursementLimitsUseCase(2025, {
      invoiceRepository,
      annualLimitRepository,
    });

    expect(annualLimitRepository.zeroAccumulatedNotInYearSnapshot).toHaveBeenCalledWith(2025, [
      { insuranceHolderPersonId: "person-1", insurerId: "insurer-1" },
    ]);
    expect(result).toMatchObject({
      adjusted: 0,
      unchanged: 0,
      zeroed: 0,
      errors: 2,
    });
  });
});
