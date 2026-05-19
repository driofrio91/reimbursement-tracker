"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetPortal = Dialog.Portal;

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(function SheetOverlay({ className, ...props }, ref) {
  return (
    <Dialog.Overlay
      ref={ref}
      className={
        "fixed inset-0 z-40 bg-slate-900/35 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " +
        (className ?? "")
      }
      {...props}
    />
  );
});

type SheetContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
  side?: "left" | "right";
};

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  SheetContentProps
>(function SheetContent({ className, children, side = "left", ...props }, ref) {
  const sideClassName =
    side === "left"
      ? "left-0 top-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
      : "right-0 top-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right";

  return (
    <SheetPortal>
      <SheetOverlay />
      <Dialog.Content
        ref={ref}
        className={
          "fixed z-50 flex w-[85vw] max-w-[320px] flex-col gap-6 border-slate-200 bg-white p-5 shadow-xl outline-none transition ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-300 data-[state=closed]:duration-200 " +
          sideClassName +
          " " +
          (className ?? "")
        }
        {...props}
      >
        {children}
      </Dialog.Content>
    </SheetPortal>
  );
});

export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;
