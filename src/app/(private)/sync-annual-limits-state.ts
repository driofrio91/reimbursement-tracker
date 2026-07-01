export interface SyncAnnualLimitsActionResult {
  status: "idle" | "success" | "error";
  message: string;
  token: number;
}

export interface SyncAnnualLimitsSummary {
  year: number;
  combinationsProcessed: number;
  adjusted: number;
  unchanged: number;
  zeroed: number;
  errors: number;
}

export const initialSyncAnnualLimitsActionResult: SyncAnnualLimitsActionResult = {
  status: "idle",
  message: "",
  token: 0,
};

export function createSyncAnnualLimitsActionResult(
  result: SyncAnnualLimitsSummary,
  token: number,
): SyncAnnualLimitsActionResult {
  const countsMessage = `${result.adjusted} ajustados, ${result.unchanged} sin cambios, ${result.zeroed} obsoletos a cero, ${result.errors} errores`;

  if (result.errors > 0) {
    return {
      status: "error",
      message: `Sync ${result.year} parcial: ${result.combinationsProcessed} combinaciones titular+aseguradora, ${countsMessage}.`,
      token,
    };
  }

  return {
    status: "success",
    message: `Sync ${result.year}: ${result.combinationsProcessed} combinaciones titular+aseguradora, ${countsMessage}.`,
    token,
  };
}
