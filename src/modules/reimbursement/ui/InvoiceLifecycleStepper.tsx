"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Invoice } from "@/modules/reimbursement/domain/Invoice";

const STAGE_STEPS = ["Creada", "Info", "Ref", "Resuelta"] as const;

/**
 * Stepper del ciclo de vida de factura renderizado con SVG.
 *
 * Se mantiene en SVG para asegurar alineacion exacta entre:
 * - puntos de estado
 * - lineas de conexion
 * - literales de cada etapa
 *
 * El ancho del SVG se adapta al contenedor con ResizeObserver.
 * Con eso evitamos deformaciones y mantenemos posiciones precisas
 * en mobile y desktop sin depender de offsets manuales por breakpoint.
 */
export function InvoiceLifecycleStepper({ status }: { status: Invoice["status"] }) {
  const currentStep = toStageStep(status);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(320);
  const svgHeight = 38;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const node = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (!width) {
        return;
      }

      setSvgWidth(Math.max(Math.floor(width), 120));
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const stepPositions = useMemo(() => {
    // Margen lateral para evitar recorte de labels extremos.
    const edgePadding = 22;
    const usableWidth = Math.max(svgWidth - edgePadding * 2, 24);
    return [
      edgePadding,
      edgePadding + usableWidth / 3,
      edgePadding + (usableWidth * 2) / 3,
      edgePadding + usableWidth,
    ];
  }, [svgWidth]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-3 text-sm text-slate-700 sm:px-3">
      <div ref={containerRef}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block h-10 w-full overflow-visible"
          role="presentation"
          aria-hidden="true"
        >
          <line x1={stepPositions[0]} y1="9" x2={stepPositions[3]} y2="9" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round" />
          {stepPositions.slice(1).map((position, index) => {
            const prevPosition = stepPositions[index];
            const isActiveSegment = index < currentStep - 1;
            return (
              <line
                key={`segment-${position}`}
                x1={prevPosition}
                y1="9"
                x2={position}
                y2="9"
                stroke={isActiveSegment ? "#94a3b8" : "#e2e8f0"}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            );
          })}

          {stepPositions.map((position, index) => {
            const style = toStepperCircleStyle(index + 1, currentStep, status);
            return (
              <g key={`point-${position}`}>
                {style.hasRing ? <circle cx={position} cy="9" r="4.2" fill={style.ringColor} /> : null}
                <circle cx={position} cy="9" r="2.6" fill={style.fillColor} stroke={style.strokeColor} strokeWidth="1.2" />
              </g>
            );
          })}
          {STAGE_STEPS.map((step, index) => (
            <text
              key={`label-${step}`}
              x={stepPositions[index]}
              y="30"
              textAnchor="middle"
              fill="#64748b"
              fontSize="12"
              fontWeight="500"
            >
              {step}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function toStageStep(status: Invoice["status"]): number {
  switch (status) {
    case "CREATED":
      return 1;
    case "INFORMATION_COMPLETED":
      return 2;
    case "CLAIM_REFERENCE_COMPLETED":
      return 3;
    case "PAID":
    case "REJECTED":
      return 4;
  }
}

function toStepperCircleStyle(step: number, currentStep: number, status: Invoice["status"]) {
  if (step < currentStep) {
    return {
      fillColor: "#94a3b8",
      strokeColor: "#94a3b8",
      hasRing: false,
      ringColor: "transparent",
    };
  }

  if (step === currentStep) {
    if (status === "PAID") {
      return {
        fillColor: "#059669",
        strokeColor: "#059669",
        hasRing: true,
        ringColor: "rgba(16, 185, 129, 0.2)",
      };
    }

    if (status === "REJECTED") {
      return {
        fillColor: "#e11d48",
        strokeColor: "#e11d48",
        hasRing: true,
        ringColor: "rgba(244, 63, 94, 0.2)",
      };
    }

    return {
      fillColor: "#0f172a",
      strokeColor: "#0f172a",
      hasRing: true,
      ringColor: "rgba(51, 65, 85, 0.16)",
    };
  }

  return {
    fillColor: "#ffffff",
    strokeColor: "#cbd5e1",
    hasRing: false,
    ringColor: "transparent",
  };
}
