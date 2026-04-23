# Session 2026-04-23 List Invoices And Service Coverage Visibility

## Objetivo

- cerrar el siguiente paso del roadmap de facturas: listar facturas por servicio y mostrar lectura operativa de cobertura

## Cambios realizados

- anadido `listByServiceId` al contrato `InvoiceRepository`
- implementado `listByServiceId` en `PrismaInvoiceRepository`
- implementado `ListInvoicesByServiceUseCase`
- implementado `GetServiceInvoiceSummaryUseCase` para calcular total facturado, pendiente y sobrefacturacion
- actualizado `src/app/(private)/services/[id]/page.tsx` para cargar resumen operativo + facturas
- actualizado `ServiceDetailView` para mostrar:
  - metricas de total facturado, pendiente y numero de facturas
  - aviso no bloqueante de sobrefacturacion
  - aviso de servicio parcialmente facturado
  - listado de facturas del servicio con estado, fecha, emisor e importe
- anadidos tests de `ListInvoicesByServiceUseCase` y `GetServiceInvoiceSummaryUseCase`

## Decisiones tomadas

- la sobrefacturacion sigue permitida; solo se muestra aviso operativo en UI
- el calculo de lectura operativa vive en `application`, no en componentes React
- el detalle de servicio mantiene el alta de factura en la misma ruta `/services/[id]`

## Validaciones ejecutadas

- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Estado resultante

- `ListInvoicesByServiceUseCase` queda cerrado y expuesto en UI privada
- el detalle de servicio ya cubre lectura operativa basica de facturacion
- el roadmap queda listo para iniciar `CreateReimbursementRequestUseCase`

## Siguiente paso

- implementar `CreateReimbursementRequestUseCase`
- definir y validar elegibilidad de facturas para solicitud (`received`, sin solicitud previa)
