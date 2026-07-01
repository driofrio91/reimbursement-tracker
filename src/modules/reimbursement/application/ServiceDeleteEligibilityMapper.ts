import type { ServiceDeleteDecision } from "@/modules/reimbursement/domain/ServiceDeletePolicy";

export interface ServiceDeleteEligibilityView {
  canDelete: boolean;
  blockedReason: string;
}

const SERVICE_DELETE_BLOCKED_REASON_MESSAGES: Record<NonNullable<ServiceDeleteDecision["blockedReasonCode"]>, string> = {
  HAS_ADVANCED_INVOICES: "Este servicio ya tiene facturas tramitadas o resueltas y no se puede eliminar.",
  HAS_INFORMATION_COMPLETED_INVOICES:
    "Para eliminar este servicio, primero revisa y borra una a una las facturas en estado Informacion completada.",
};

export function mapServiceDeleteDecisionToEligibility(
  decision: ServiceDeleteDecision,
): ServiceDeleteEligibilityView {
  return {
    canDelete: decision.canDelete,
    blockedReason: decision.blockedReasonCode ? SERVICE_DELETE_BLOCKED_REASON_MESSAGES[decision.blockedReasonCode] : "",
  };
}
