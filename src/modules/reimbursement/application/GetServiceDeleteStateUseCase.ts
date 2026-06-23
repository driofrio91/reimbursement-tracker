import type { Invoice } from "@/modules/reimbursement/domain/Invoice";

export interface ServiceDeleteState {
  canDelete: boolean;
  blockedReason: string;
}

export function getServiceDeleteState(invoices: Pick<Invoice, "status">[]): ServiceDeleteState {
  const hasInformationCompleted = invoices.some((invoice) => invoice.status === "INFORMATION_COMPLETED");
  const hasAdvancedStatus = invoices.some(
    (invoice) =>
      invoice.status === "CLAIM_REFERENCE_COMPLETED" || invoice.status === "PAID" || invoice.status === "REJECTED",
  );

  if (hasAdvancedStatus) {
    return {
      canDelete: false,
      blockedReason: "Este servicio ya tiene facturas tramitadas o resueltas y no se puede eliminar.",
    };
  }

  if (hasInformationCompleted) {
    return {
      canDelete: false,
      blockedReason: "Para eliminar este servicio, primero revisa y borra una a una las facturas en estado Informacion completada.",
    };
  }

  return {
    canDelete: true,
    blockedReason: "",
  };
}
