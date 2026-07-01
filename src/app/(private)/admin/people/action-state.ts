export interface AdminMutationState {
  status: "idle" | "success" | "error";
  message: string;
  token: number;
}

export const initialAdminMutationState: AdminMutationState = {
  status: "idle",
  message: "",
  token: 0,
};
