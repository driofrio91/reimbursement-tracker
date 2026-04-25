# Session 2026-04-25 Invoice Centric Model Refactor

## Objetivo

- cambiar el flujo principal desde `ReimbursementRequest` hacia `Invoice`
- autogenerar facturas al crear servicio
- ordenar documentacion y reducir fuentes de verdad

## Cambios implementados

- nuevo ciclo de estados de factura:
  - `CREATED`
  - `INFORMATION_COMPLETED`
  - `CLAIM_REFERENCE_COMPLETED`
  - `PAID`
  - `REJECTED`
- `ReimbursableService` incorpora:
  - `invoiceBilledAmount`
  - `invoiceExpectedAmount`
- `Invoice` incorpora:
  - `invoiceBilledAmount`
  - `invoiceExpectedAmount`
  - `claimReference`
  - `paidAmount`
- `CreateServiceUseCase` ahora autogenera `N` facturas con:
  - `N = ceil(actualAmount / invoiceExpectedAmount)`
- reemplazado flujo de alta manual de factura por flujo por etapas en detalle de servicio

## Decisiones cerradas

- `paidAmount` se autocompleta con el esperado y sigue editable
- varias facturas pueden compartir la misma `claimReference`
- si el calculo supera importe real, se mantiene aviso sin bloqueo
- `ReimbursementRequest` se mantiene temporalmente en persistencia para transicion

## Limpieza documental

- fuentes de verdad minimas:
  - `START-HERE.md`
  - `07-mvp-scope.md`
  - `09-current-status.md`
  - `10-use-cases-roadmap.md`
  - `AGENTS.md`
- resto de docs rebajados a auxiliares y alineados con el modelo nuevo
