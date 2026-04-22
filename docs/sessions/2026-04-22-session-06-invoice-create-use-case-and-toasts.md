# Session 2026-04-22 Invoice Create Use Case And Toasts

## Objetivo

- cerrar el primer caso de uso de facturas con implementacion end-to-end y feedback no bloqueante en UI

## Cambios realizados

- implementado `CreateInvoiceForServiceUseCase` con validaciones de negocio (`amount > 0`, servicio existente)
- anadidos `Invoice` e `InvoiceRepository` en capa `domain`
- anadido `PrismaInvoiceRepository` en capa `infrastructure`
- anadido schema de entrada `CreateInvoiceFormSchema` en `entrypoints`
- anadida server action para alta de factura en `src/app/(private)/services/[id]/actions.ts`
- anadido formulario `CreateInvoiceForm` dentro de `ServiceDetailView`
- anadido `PrivateToaster` con `sonner` en layout privado para mantener mensajes durante navegacion
- anadidos tests de `CreateInvoiceForServiceUseCase` y `CreateInvoiceFormSchema`

## Decisiones tomadas

- se permite sobrefacturacion en esta fase, sin bloqueo por suma de facturas
- el aviso de sobrefacturacion queda para la siguiente iteracion de visibilidad operativa
- el flujo de alta de factura se mantiene en `/services/[id]` sin crear ruta nueva de facturas
- los mensajes de exito/error se dan por toast para no interrumpir navegacion

## Validaciones ejecutadas

- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Estado resultante

- `CreateInvoiceForServiceUseCase` queda cerrado y usable desde UI
- roadmap de facturas pasa de pendiente total a en curso
- el siguiente paso del roadmap queda centrado en `ListInvoicesByServiceUseCase`

## Siguiente paso

- implementar `ListInvoicesByServiceUseCase`
- mostrar listado de facturas por servicio en `/services/[id]`
- anadir lectura de importe pendiente y aviso de sobrefacturacion
