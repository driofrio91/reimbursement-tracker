# Start Here

## Objetivo

Este archivo es el punto unico de entrada para retomar el proyecto.

## Proyecto

- nombre: `reimbursement-tracker`
- tipo: aplicacion interna de backoffice
- objetivo: sustituir el Excel operativo de reembolsos

## Regla principal

Si una pieza no ayuda directamente a sustituir el Excel diario, no entra en V1.

## Fuentes de verdad

1. `docs/START-HERE.md`
2. `docs/07-mvp-scope.md`
3. `docs/09-current-status.md`
4. `docs/10-use-cases-roadmap.md`
5. `AGENTS.md`

## Cambio de modelo vigente

El flujo operativo se centra en `Invoice`.

- antes: la entidad operativa principal era `ReimbursementRequest`
- ahora: la referencia de solicitud se guarda en la factura con `claimReference`
- varias facturas pueden compartir la misma `claimReference`

`ReimbursementRequest` ya fue retirado de persistencia en la fase 2.
El flujo V1 no depende de legado de solicitud.

## Flujo V1 vigente

1. crear servicio
2. autogenerar facturas del servicio
3. completar informacion de factura
4. completar `claimReference`
5. resolver factura como `PAID` o `REJECTED`
6. corregir estado final (`PAID` <-> `REJECTED`) con motivo obligatorio cuando haya error operativo

## Regla de autogeneracion de facturas

En el alta de servicio se configuran:

- `invoiceBilledAmount` (default `55`)
- `invoiceExpectedAmount` (default `49.5`)

Numero de facturas autogeneradas:

- `invoiceCount = ceil(actualAmount / invoiceExpectedAmount)`

Siempre se debe igualar o superar el importe real del servicio.
Si se supera, se mantiene aviso de sobrefacturacion o sobrecobertura esperada sin bloqueo.

## Estados de factura vigentes

- `CREATED`
- `INFORMATION_COMPLETED`
- `CLAIM_REFERENCE_COMPLETED`
- `PAID`
- `REJECTED`

## Regla de pago

Al marcar factura pagada:

- `paidAmount` se autocompleta con el esperado por defecto
- `paidAmount` sigue siendo editable manualmente

## Stack aprobado

- `Next.js`
- `TypeScript`
- `Auth.js`
- `Prisma`
- `PostgreSQL` en `Neon`
- `Vercel`
- `shadcn/ui`

## Arquitectura aprobada

Arquitectura limpia ligera por modulos.

- `ui` depende de `application`
- `application` depende de `domain`
- `infrastructure` depende de `application` y `domain`
- `domain` no depende de otras capas

No meter logica de negocio en componentes, paginas, server actions, route handlers ni consultas Prisma en bruto.
