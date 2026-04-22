"use client";

import { Toaster } from "sonner";

export function PrivateToaster() {
  return <Toaster position="top-right" closeButton richColors duration={5000} />;
}
