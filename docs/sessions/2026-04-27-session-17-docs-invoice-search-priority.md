# Session 2026-04-27 Docs Invoice Search Priority

## Objetivo

- alinear documentacion para priorizar buscador de facturas y detalle por factura
- mover trazabilidad historica avanzada de correcciones a V2

## Cambios realizados

- actualizado `docs/START-HERE.md` con siguiente US prioritaria
- actualizado `docs/07-mvp-scope.md` para incluir buscar/listar facturas y ver detalle de factura en V1
- actualizado `docs/09-current-status.md` con foco aprobado y rutas previstas (`/invoices`, `/invoices/[id]`)
- actualizado `docs/10-use-cases-roadmap.md` para poner buscador + detalle como siguiente US
- definido filtro inicial del buscador: `invoiceNumber`, `claimReference`, `status`

## Decisiones tomadas

- se deja para V2 la trazabilidad historica completa de correcciones por factura
- en la siguiente implementacion solo se documenta y prepara buscador con filtros basicos acordados

## Validaciones ejecutadas

- verificacion manual de consistencia entre `START-HERE`, `07-mvp-scope`, `09-current-status` y `10-use-cases-roadmap`

## Estado resultante

- documentacion alineada con nuevo foco funcional
- backlog prioritario listo para implementar ruta de facturas y detalle dedicado

## Siguiente paso

- implementar `/invoices` con filtros `invoiceNumber`, `claimReference`, `status` y navegacion a `/invoices/[id]`
