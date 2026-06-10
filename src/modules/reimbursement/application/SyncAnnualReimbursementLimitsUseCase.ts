import { InvoiceRepository } from "@/modules/reimbursement/domain/InvoiceRepository";
import { PersonAnnualReimbursementLimitRepository } from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimitRepository";

export interface SyncAnnualReimbursementLimitsResult {
  year: number;
  combinationsProcessed: number;
  adjusted: number;
  unchanged: number;
  errors: number;
}

interface SyncAnnualReimbursementLimitsUseCaseDependencies {
  invoiceRepository: Pick<InvoiceRepository, "getPaidAmountByPersonInsurerForYear">;
  annualLimitRepository: Pick<
    PersonAnnualReimbursementLimitRepository,
    "upsertForPersonInsurerYear" | "setAccumulated"
  >;
}

export async function syncAnnualReimbursementLimitsUseCase(
  year: number,
  dependencies: SyncAnnualReimbursementLimitsUseCaseDependencies,
): Promise<SyncAnnualReimbursementLimitsResult> {
  const paidAmountByCombination = await dependencies.invoiceRepository.getPaidAmountByPersonInsurerForYear(year);

  let adjusted = 0;
  let unchanged = 0;
  let errors = 0;

  for (const row of paidAmountByCombination) {
    try {
      const existing = await dependencies.annualLimitRepository.upsertForPersonInsurerYear(
        row.insuranceHolderPersonId,
        row.insurerId,
        year,
      );
      const target = row.amount;

      if (existing.reimbursedAccumulated === target) {
        unchanged += 1;
        continue;
      }

      await dependencies.annualLimitRepository.setAccumulated(row.insuranceHolderPersonId, row.insurerId, year, target);
      adjusted += 1;
    } catch {
      errors += 1;
    }
  }

  return {
    year,
    combinationsProcessed: paidAmountByCombination.length,
    adjusted,
    unchanged,
    errors,
  };
}
