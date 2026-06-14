export interface ChangePasswordFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export const initialChangePasswordFormState: ChangePasswordFormState = {
  status: "idle",
};
