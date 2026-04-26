# Session 2026-04-26 Invoice Stage UX and Feedback

## Objetivo

- cerrar la UX del detalle de servicio por etapas de factura
- evitar acciones fuera de secuencia
- mostrar feedback visible de errores y exitos en acciones

## Cambios implementados

- `ServiceDetailView` ahora muestra una sola accion principal por estado de factura:
  - `CREATED`: completar informacion
  - `INFORMATION_COMPLETED`: registrar referencia
  - `CLAIM_REFERENCE_COMPLETED`: resolver pagada o rechazada
  - `PAID` y `REJECTED`: solo lectura sin acciones pendientes
- se agrego indicador visual de "siguiente accion" por factura
- se agrego banner de feedback en detalle de servicio para mensajes de error/exito

## Acciones servidor

- `actions.ts` ahora traduce validaciones y errores de use case a feedback en URL
- se eliminan fallos silenciosos por `safeParse` fallido
- en exito se revalida ruta y se redirige con mensaje de confirmacion

## Archivos clave

- `src/modules/reimbursement/ui/ServiceDetailView.tsx`
- `src/app/(private)/services/[id]/actions.ts`
- `src/app/(private)/services/[id]/page.tsx`

## Verificacion

- `npm run test` OK
- `npm run lint` OK
- `npm run typecheck` OK
