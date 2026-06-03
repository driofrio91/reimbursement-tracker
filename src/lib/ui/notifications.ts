import { pushNotification } from "@/lib/ui/notification-bus";

export function notifySuccess(message: string) {
  pushNotification({ type: "success", message });
}

export function notifyError(message: string) {
  pushNotification({ type: "error", message });
}
