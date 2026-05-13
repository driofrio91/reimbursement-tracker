export interface SyncAnnualLimitsActionResult {
  status: "idle" | "success" | "error";
  message: string;
  token: number;
}

export const initialSyncAnnualLimitsActionResult: SyncAnnualLimitsActionResult = {
  status: "idle",
  message: "",
  token: 0,
};
