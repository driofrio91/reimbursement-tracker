"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetPortal = Dialog.Portal;

type SheetOverlayProps = React.ComponentPropsWithoutRef<typeof Dialog.Overlay> & {
  open?: boolean;
};

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  SheetOverlayProps
>(function SheetOverlay({ className, open, ...props }, ref) {
  void open;

  return (
    <Dialog.Overlay
      ref={ref}
      forceMount
      className={"sheet-overlay fixed inset-0 z-40 bg-slate-900/35 " + (className ?? "")}
      {...props}
    />
  );
});

type SheetContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
  side?: "left" | "right";
  open?: boolean;
};

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  SheetContentProps
>(function SheetContent({ className, children, side = "left", open, ...props }, ref) {
  void open;

  const sideClassName =
    side === "left"
      ? "left-0 top-0 h-full border-r"
      : "right-0 top-0 h-full border-l";

  return (
    <SheetPortal>
      <SheetOverlay open={open} />
      <Dialog.Content
        ref={ref}
        forceMount
        style={{
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
        className={
          "sheet-content fixed z-50 flex w-[85vw] max-w-[320px] flex-col gap-6 border-slate-200 bg-white p-5 shadow-xl outline-none " +
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
