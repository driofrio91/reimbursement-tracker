import type { Invoice } from "@/modules/reimbursement/domain/Invoice";

export interface ServiceDeleteDecision {
  canDelete: boolean;
  blockedReasonCode: ServiceDeleteBlockedReasonCode | null;
}

export type ServiceDeleteBlockedReasonCode = "HAS_ADVANCED_INVOICES" | "HAS_INFORMATION_COMPLETED_INVOICES";

/**
 * Evaluates whether a service can be deleted based on its invoices' statuses.
 *
 * Rules (ordered by priority):
 * 1. If any invoice has an advanced status (CLAIM_REFERENCE_COMPLETED, PAID, REJECTED),
 *    the service cannot be deleted — it has already been processed or resolved.
 * 2. If any invoice is in INFORMATION_COMPLETED status, the service cannot be deleted
 *    directly — each of those invoices must be individually deleted first.
 * 3. Otherwise, all invoices are in CREATED status and the service is deletable.
 */
export function evaluateServiceDeleteEligibility(
  invoices: Pick<Invoice, "status">[],
): ServiceDeleteDecision {
  const hasAdvancedStatus = invoices.some(
    (invoice) =>
      invoice.status === "CLAIM_REFERENCE_COMPLETED" ||
      invoice.status === "PAID" ||
      invoice.status === "REJECTED",
  );

  if (hasAdvancedStatus) {
    return {
      canDelete: false,
      blockedReasonCode: "HAS_ADVANCED_INVOICES",
    };
  }

  const hasInformationCompleted = invoices.some(
    (invoice) => invoice.status === "INFORMATION_COMPLETED",
  );

  if (hasInformationCompleted) {
    return {
      canDelete: false,
      blockedReasonCode: "HAS_INFORMATION_COMPLETED_INVOICES",
    };
  }

  return {
    canDelete: true,
    blockedReasonCode: null,
  };
}
