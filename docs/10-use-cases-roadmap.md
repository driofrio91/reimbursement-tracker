# Use Cases Roadmap

## Objetivo

Priorizar implementacion sobre el modelo vigente centrado en facturas.

## Estado de fases

- autenticacion: completada
- servicios base: completada
- autogeneracion de facturas en alta de servicio: completada
- ciclo de vida de factura por etapas: en curso
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

- cerrar trazabilidad historica de correcciones de estado final (mas de una correccion por factura)
  - objetivo: pasar de "ultima correccion" a historial completo de cambios
  - incluir tabla de eventos de correccion con auditoria completa
  - mantener UX movil ligera para consulta de historial

## Orden recomendado para las siguientes sesiones

1. cerrar UX completa de edicion por etapas en detalle de servicio
2. reforzar validaciones de transicion de estado y mensajes de error
3. ajustar estado global de servicio derivado de facturas
4. cerrar ciclo de vida de factura por etapas con polish UX movil
5. ampliar trazabilidad historica de correcciones de estado final

## Checklist por cada US con ruta privada

1. ruta integrada en sidebar
2. estado visual de pagina y seccion activa
3. navegacion movil operativa
4. acciones principales visibles en movil antes de desktop polish
