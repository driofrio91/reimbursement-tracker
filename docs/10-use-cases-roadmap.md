# Use Cases Roadmap

## Objetivo

Priorizar implementacion sobre el modelo vigente centrado en facturas.

## Estado de fases

- autenticacion: completada
- servicios base: completada
- autogeneracion de facturas en alta de servicio: completada
- ciclo de vida de factura por etapas: completada y validada en QA local (desktop + movil)
- estado global de servicio y resultado economico: completada con matriz de regresion documentada (`A1-A14`, `B1-B10`)
- buscador global de facturas y detalle dedicado por factura: completada
- limpieza operativa de legado de `ReimbursementRequest` (codigo y docs): completada
- retirada definitiva de `ReimbursementRequest` en persistencia: completada

## Casos de uso activos

### Servicios

- `CreateReimbursableServiceUseCase` (con autogeneracion de facturas)
- `ListReimbursableServicesUseCase`
- `GetReimbursableServiceDetailUseCase`

### Facturas

- `ListInvoicesByServiceUseCase`
- `GetServiceInvoiceSummaryUseCase`
- `CompleteInvoiceInformationUseCase`
- `RegisterInvoiceClaimReferenceUseCase`
- `MarkInvoiceAsPaidUseCase`
- `MarkInvoiceAsRejectedUseCase`
- `CorrectInvoiceResolutionUseCase`

## Backlog funcional prioritario (siguiente US)

- documentar cierre operativo de V1
- preparar primer bloque de V2: trazabilidad historica avanzada de correcciones

## Backlog operativo de despliegue

- release a produccion automatizada por tag final `v*` (sin deploy en draft/prerelease)
- preparar flujo futuro de prerelease a staging/preview sin afectar produccion
- estado actual: despliegue por release final validado y QA funcional local V1 cerrada

## Backlog V2 orientativo

- cerrar trazabilidad historica de correcciones de estado final (mas de una correccion por factura)
  - objetivo: pasar de "ultima correccion" a historial completo de cambios
  - incluir tabla de eventos de correccion con auditoria completa
  - mantener UX movil ligera para consulta de historial

## Orden recomendado para las siguientes sesiones

1. documentar cierre operativo de V1
2. ampliar trazabilidad historica de correcciones de estado final (V2)
3. preparar flujo de prerelease a staging/preview sin afectar produccion

## Checklist por cada US con ruta privada

1. ruta integrada en sidebar
2. estado visual de pagina y seccion activa
3. navegacion movil operativa
4. acciones principales visibles en movil antes de desktop polish
