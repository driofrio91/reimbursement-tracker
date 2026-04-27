# Use Cases Roadmap

## Objetivo

Priorizar implementacion sobre el modelo vigente centrado en facturas.

## Estado de fases

- autenticacion: completada
- servicios base: completada
- autogeneracion de facturas en alta de servicio: completada
- ciclo de vida de factura por etapas: en curso
- buscador global de facturas y detalle dedicado por factura: pendiente prioritario
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

- implementar buscador global de facturas
  - filtros iniciales: `invoiceNumber`, `claimReference`, `status`
  - listado con acceso directo al detalle por factura
  - filtros con AND
  - `invoiceNumber` y `claimReference` por busqueda parcial case-insensitive
  - `status` opcional de seleccion unica
  - orden por defecto por `updatedAt` descendente
  - sin paginacion en la primera iteracion
- implementar detalle dedicado de factura
  - alcance inicial de lectura
  - incluir enlace directo a `/services/[id]` para ejecutar acciones del ciclo
  - mantener UX movil ligera

## Casos de uso propuestos para la siguiente US

- `SearchInvoicesUseCase` (lectura con filtros operativos)
- `GetInvoiceDetailUseCase` (lectura por id)

## Backlog V2 orientativo

- cerrar trazabilidad historica de correcciones de estado final (mas de una correccion por factura)
  - objetivo: pasar de "ultima correccion" a historial completo de cambios
  - incluir tabla de eventos de correccion con auditoria completa
  - mantener UX movil ligera para consulta de historial

## Orden recomendado para las siguientes sesiones

1. implementar buscador global de facturas con filtros iniciales
2. implementar detalle dedicado por factura y navegacion desde resultados
3. reforzar validaciones de transicion de estado y mensajes de error
4. ajustar estado global de servicio derivado de facturas
5. ampliar trazabilidad historica de correcciones de estado final (V2)

## Checklist por cada US con ruta privada

1. ruta integrada en sidebar
2. estado visual de pagina y seccion activa
3. navegacion movil operativa
4. acciones principales visibles en movil antes de desktop polish
