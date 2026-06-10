import { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { PersonAnnualReimbursementLimitRepository } from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimitRepository";

interface ApplyInvoiceAnnualLimitDeltaUseCaseDependencies {
  annualLimitRepository: Pick<PersonAnnualReimbursementLimitRepository, "applyDelta">;
}

interface AnnualContribution {
  insuranceHolderPersonId: string;
  insurerId: string;
  year: number;
  amount: number;
}

export async function applyInvoiceAnnualLimitDeltaUseCase(
  previousInvoice: Invoice,
  nextInvoice: Invoice,
  dependencies: ApplyInvoiceAnnualLimitDeltaUseCaseDependencies,
): Promise<void> {
  const previousContribution = getContribution(previousInvoice);
  const nextContribution = getContribution(nextInvoice);

  if (previousContribution && nextContribution) {
    if (
      previousContribution.insuranceHolderPersonId === nextContribution.insuranceHolderPersonId &&
      previousContribution.insurerId === nextContribution.insurerId &&
      previousContribution.year === nextContribution.year
    ) {
      const delta = roundToTwoDecimals(nextContribution.amount - previousContribution.amount);

      if (delta !== 0) {
        await dependencies.annualLimitRepository.applyDelta(
          nextContribution.insuranceHolderPersonId,
          nextContribution.insurerId,
          nextContribution.year,
          delta,
        );
      }

      return;
    }

    await dependencies.annualLimitRepository.applyDelta(
      previousContribution.insuranceHolderPersonId,
      previousContribution.insurerId,
      previousContribution.year,
      roundToTwoDecimals(-previousContribution.amount),
    );
    await dependencies.annualLimitRepository.applyDelta(
      nextContribution.insuranceHolderPersonId,
      nextContribution.insurerId,
      nextContribution.year,
      nextContribution.amount,
    );
    return;
  }

  if (previousContribution) {
    await dependencies.annualLimitRepository.applyDelta(
      previousContribution.insuranceHolderPersonId,
      previousContribution.insurerId,
      previousContribution.year,
      roundToTwoDecimals(-previousContribution.amount),
    );
  }

  if (nextContribution) {
    await dependencies.annualLimitRepository.applyDelta(
      nextContribution.insuranceHolderPersonId,
      nextContribution.insurerId,
      nextContribution.year,
      nextContribution.amount,
    );
  }
}

function getContribution(invoice: Invoice): AnnualContribution | null {
  if (
    invoice.status !== "PAID" ||
    !invoice.insuranceHolderPersonId ||
    !invoice.insurerId ||
    !invoice.invoiceDate ||
    typeof invoice.paidAmount !== "number"
  ) {
    return null;
  }

  return {
    insuranceHolderPersonId: invoice.insuranceHolderPersonId,
    insurerId: invoice.insurerId,
    year: invoice.invoiceDate.getUTCFullYear(),
    amount: roundToTwoDecimals(invoice.paidAmount),
  };
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
