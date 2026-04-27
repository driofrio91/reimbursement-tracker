# Session 2026-04-27 Correct Final Invoice Resolution

## Objetivo

- permitir correccion operativa del estado final de reembolso en facturas ya resueltas
- evitar el modelo de "reapertura" y mantener foco en trazabilidad de reembolso

## Cambios implementados

- se crea `CorrectInvoiceResolutionUseCase` para corregir `PAID` <-> `REJECTED`
- se exige `correctionReason` obligatorio en todas las correcciones
- se persiste trazabilidad de ultima correccion en `Invoice`:
  - `correctedAt`
  - `correctionReason`
  - `correctedFromStatus`
  - `correctedByUserId`
  - `correctedByUserName`
- se implementa `correctResolution` en `InvoiceRepository` y `PrismaInvoiceRepository`
- se agrega migracion SQL: `20260427113000_add_invoice_resolution_correction_fields`
- en UI de `/services/[id]`:
  - facturas finales muestran accion `Corregir estado final`
  - toda la correccion ocurre en modal in-app (sin dialogo de navegador)
  - el motivo de correccion solo se captura en modal, no en pantalla principal
  - en tarjeta se muestra resumen minimo de ultima correccion (fecha y usuario)

## Reglas aplicadas

- solo se corrige desde estados finales (`PAID` o `REJECTED`)
- la correccion debe cambiar realmente el estado final
- al corregir a `PAID`: se requiere `paidAmount` y `paidAt`
- al corregir a `REJECTED`: se limpia `paidAmount` y `paidAt`

## Pruebas

- se amplian tests de ciclo de vida de factura para cubrir:
  - `PAID` -> `REJECTED`
  - `REJECTED` -> `PAID`
  - errores por estado invalido, motivo vacio y estado destino igual al origen

## Documentacion actualizada

- `docs/START-HERE.md`
- `docs/04-data-model.md`
- `docs/09-current-status.md`
- `docs/10-use-cases-roadmap.md`

## Verificacion

- `npx prisma migrate deploy` OK
- `npm run prisma:generate` OK
- `npm run lint` OK
- `npm run typecheck` OK
- `npm run test` OK
- `npm run build` OK

## Siguiente paso

- si negocio lo requiere, evolucionar de "ultima correccion" a historial completo de correcciones por factura
