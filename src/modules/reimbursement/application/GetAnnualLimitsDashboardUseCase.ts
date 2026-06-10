import {
  PersonAnnualLimitYearRow,
  PersonAnnualReimbursementLimitRepository,
} from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimitRepository";

export type AnnualLimitTrafficLight = "green" | "amber" | "red";

export interface AnnualLimitDashboardRow {
  insuranceHolderPersonId: string;
  insuranceHolderPersonName: string;
  insurerId: string;
  insurerName: string;
  annualLimitAmount: number;
  reimbursedAccumulated: number;
  remainingAmount: number;
  excessAmount: number;
  percentageUsed: number;
  progressPercentage: number;
  trafficLight: AnnualLimitTrafficLight;
  currency: string;
}

interface GetAnnualLimitsDashboardUseCaseDependencies {
  annualLimitRepository: Pick<PersonAnnualReimbursementLimitRepository, "listByYear">;
}

export async function getAnnualLimitsDashboardUseCase(
  year: number,
  dependencies: GetAnnualLimitsDashboardUseCaseDependencies,
): Promise<AnnualLimitDashboardRow[]> {
  const rows = await dependencies.annualLimitRepository.listByYear(year);

  return rows
    .map(mapRow)
    .sort((a, b) => {
      if (b.percentageUsed !== a.percentageUsed) {
        return b.percentageUsed - a.percentageUsed;
      }

      if (a.insuranceHolderPersonName !== b.insuranceHolderPersonName) {
        return a.insuranceHolderPersonName.localeCompare(b.insuranceHolderPersonName, "es");
      }

      return a.insurerName.localeCompare(b.insurerName, "es");
    });
}

function mapRow(row: PersonAnnualLimitYearRow): AnnualLimitDashboardRow {
  const limit = row.annualLimitAmount;
  const consumed = row.reimbursedAccumulated;
  const percentageUsed = limit > 0 ? (consumed / limit) * 100 : 0;
  const progressPercentage = Math.max(0, Math.min(percentageUsed, 100));
  const remainingAmount = Math.max(limit - consumed, 0);
  const excessAmount = Math.max(consumed - limit, 0);

  return {
    insuranceHolderPersonId: row.insuranceHolderPersonId,
    insuranceHolderPersonName: row.insuranceHolderPersonName,
    insurerId: row.insurerId,
    insurerName: row.insurerName,
    annualLimitAmount: limit,
    reimbursedAccumulated: consumed,
    remainingAmount,
    excessAmount,
    percentageUsed,
    progressPercentage,
    trafficLight: toTrafficLight(percentageUsed),
    currency: row.currency,
  };
}

function toTrafficLight(percentageUsed: number): AnnualLimitTrafficLight {
  if (percentageUsed < 75) {
    return "green";
  }

  if (percentageUsed <= 100) {
    return "amber";
  }

  return "red";
}
