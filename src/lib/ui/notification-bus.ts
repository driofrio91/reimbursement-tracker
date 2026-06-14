export type UiNotification = {
  type: "success" | "error";
  message: string;
};

type NotificationListener = (notification: UiNotification) => void;

const listeners = new Set<NotificationListener>();

export function pushNotification(notification: UiNotification) {
  for (const listener of listeners) {
    listener(notification);
  }
}

export function subscribeToNotifications(listener: NotificationListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
