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

## Siguiente US prioritaria

Se aplaza a V2 la trazabilidad historica avanzada de correcciones.

Bloque completado en esta fase de V1:

1. buscador global de facturas
2. abrir detalle dedicado por factura

Filtros iniciales acordados para el buscador:

- `invoiceNumber`
- `claimReference`
- `status`

Definicion funcional cerrada para esta US:

- ruta de listado: `/invoices`
- ruta de detalle: `/invoices/[id]`
- `invoiceNumber` y `claimReference`: busqueda parcial, case-insensitive
- `status`: filtro opcional de seleccion unica
- combinacion de filtros con operador AND
- orden por defecto: mas recientes primero (`updatedAt` descendente)
- sin paginacion en esta primera iteracion
- el detalle de factura en V1 es de lectura y enlaza al detalle del servicio para ejecutar acciones del ciclo

Siguiente bloque priorizado para cerrar V1:

1. preparar entorno desplegado para QA funcional final en movil y desktop

Cobertura de escenarios limite cerrada para estado global y resultado economico:

- estado global de servicio sincronizado por reglas operativas ya validadas con tests
- resultado economico (`FULL`, `PARTIAL`, `NONE`) cubierto con casos de borde en regresion
- matrices cerradas y documentadas en `docs/07-mvp-scope.md` (casos `A1-A14` y `B1-B10`)

Validacion de transiciones de factura cerrada en V1:

- flujo estricto: `CREATED` -> `INFORMATION_COMPLETED` -> `CLAIM_REFERENCE_COMPLETED` -> `PAID`/`REJECTED`
- sin saltos, sin retrocesos y sin re-confirmacion de estado final por acciones normales
- `PAID` <-> `REJECTED` solo via correccion final con motivo obligatorio

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

## Regla de seed local

- `prisma/seed.ts` queda reservado para datos de entorno local
- el seed solo se permite cuando `NODE_ENV` no es `production` y `ALLOW_LOCAL_SEED=true`
- en produccion se aplica solo esquema incremental con `npx prisma migrate deploy`

## Arquitectura aprobada

Arquitectura limpia ligera por modulos.

- `ui` depende de `application`
- `application` depende de `domain`
- `infrastructure` depende de `application` y `domain`
- `domain` no depende de otras capas

No meter logica de negocio en componentes, paginas, server actions, route handlers ni consultas Prisma en bruto.
