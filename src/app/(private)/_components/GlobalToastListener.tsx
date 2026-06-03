"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { subscribeToNotifications, type UiNotification } from "@/lib/ui/notification-bus";

export function GlobalToastListener() {
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification: UiNotification) => {
      if (notification.type === "success") {
        toast.success(notification.message, { duration: 5000 });
        return;
      }

      toast.error(notification.message, { duration: 9000 });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function consumeRedirectNotification() {
      const response = await fetch("/api/flash-toast/consume", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok || isCancelled) {
        return;
      }

      const payload = (await response.json()) as { flashToast?: UiNotification | null };

      if (!payload.flashToast) {
        return;
      }

      if (payload.flashToast.type === "success") {
        toast.success(payload.flashToast.message, { duration: 5000 });
        return;
      }

      toast.error(payload.flashToast.message, { duration: 9000 });
    }

    void consumeRedirectNotification();

    return () => {
      isCancelled = true;
    };
  }, [pathname]);

  return null;
}
