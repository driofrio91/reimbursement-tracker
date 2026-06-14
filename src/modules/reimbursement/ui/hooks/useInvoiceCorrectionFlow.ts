"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { InvoiceActionResult } from "@/app/(private)/services/[id]/invoice-action-state";
import { notifyError, notifySuccess } from "@/lib/ui/notifications";

const initialState: InvoiceActionResult = {
  status: "idle",
  message: "",
  token: 0,
};

type CorrectionSourceStatus = "PAID" | "REJECTED";

interface UseInvoiceCorrectionFlowParams {
  invoiceId: string;
  currentInvoiceStatus: CorrectionSourceStatus;
  correctionAction: (
    previousState: InvoiceActionResult,
    formData: FormData,
  ) => Promise<InvoiceActionResult>;
}

interface UseInvoiceCorrectionFlowResult {
  isOpen: boolean;
  frozenSourceStatus: CorrectionSourceStatus;
  correctionState: InvoiceActionResult;
  isCorrectingResolution: boolean;
  openModal: () => void;
  closeModal: () => void;
  formAction: (formData: FormData) => void;
}

export function useInvoiceCorrectionFlow({
  currentInvoiceStatus,
  correctionAction,
}: UseInvoiceCorrectionFlowParams): UseInvoiceCorrectionFlowResult {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [frozenSourceStatus, setFrozenSourceStatus] = useState<CorrectionSourceStatus>(currentInvoiceStatus);

  const [correctionState, formAction, isCorrectingResolution] = useActionState(
    correctionAction,
    initialState,
  );

  const hasHandledSuccessRef = useRef(false);
  const lastSuccessTokenRef = useRef(0);

  const openModal = useCallback(() => {
    setFrozenSourceStatus(currentInvoiceStatus);
    hasHandledSuccessRef.current = false;
    setIsOpen(true);
  }, [currentInvoiceStatus]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (correctionState.status !== "success" || correctionState.token === 0) {
      return;
    }

    if (lastSuccessTokenRef.current === correctionState.token) {
      return;
    }

    lastSuccessTokenRef.current = correctionState.token;

    if (hasHandledSuccessRef.current) {
      return;
    }

    hasHandledSuccessRef.current = true;

    notifySuccess(correctionState.message);

    setIsOpen(false);

    const refreshTimer = window.setTimeout(() => {
      router.refresh();
    }, 120);

    return () => {
      window.clearTimeout(refreshTimer);
    };
  }, [correctionState, router]);

  useEffect(() => {
    if (correctionState.status !== "error" || correctionState.token === 0) {
      return;
    }

    notifyError(correctionState.message);
  }, [correctionState]);

  return {
    isOpen,
    frozenSourceStatus,
    correctionState,
    isCorrectingResolution,
    openModal,
    closeModal,
    formAction,
  };
}
