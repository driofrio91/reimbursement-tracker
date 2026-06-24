import type { Invoice } from "@/modules/reimbursement/domain/Invoice";
import { evaluateServiceDeleteEligibility } from "@/modules/reimbursement/domain/ServiceDeletePolicy";

// Public type alias kept for backward compatibility with existing callers.
export type ServiceDeleteState = import("@/modules/reimbursement/domain/ServiceDeletePolicy").ServiceDeleteDecision;

export function getServiceDeleteState(invoices: Pick<Invoice, "status">[]): ServiceDeleteState {
  return evaluateServiceDeleteEligibility(invoices);
}
