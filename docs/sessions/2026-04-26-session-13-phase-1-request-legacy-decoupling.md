# Session 2026-04-26 Phase 1 Request Legacy Decoupling

## Objetivo

- completar la fase 1 del retiro de legado `ReimbursementRequest`
- desacoplar el codigo operativo V1 sin tocar la persistencia legacy

## Cambios implementados

- se elimina `requestId` del contrato de dominio `Invoice` y `NewInvoice`
- `CreateServiceUseCase` deja de inicializar `requestId` al autogenerar facturas
- `PrismaInvoiceRepository` deja de leer, mapear y escribir `requestId` en operaciones de factura
- builders de pruebas se alinean al nuevo contrato sin `requestId`

## Ajustes de lenguaje operativo

- UI y mensajes de acciones/casos de uso pasan a hablar de `referencia` o `referencia de reembolso`
- se evita reforzar el modelo mental de solicitud como entidad operativa principal

## Estado tras fase 1

- `src/` y `test/` quedan desacoplados de `ReimbursementRequest`
- `ReimbursementRequest` permanece solo en persistencia Prisma para compatibilidad temporal
- la retirada definitiva de esquema queda para una fase posterior

## Archivos clave

- `src/modules/reimbursement/domain/Invoice.ts`
- `src/modules/reimbursement/application/CreateServiceUseCase.ts`
- `src/modules/reimbursement/infrastructure/PrismaInvoiceRepository.ts`
- `src/modules/reimbursement/application/RegisterInvoiceClaimReferenceUseCase.ts`
- `src/modules/reimbursement/application/MarkInvoiceAsPaidUseCase.ts`
- `src/modules/reimbursement/application/MarkInvoiceAsRejectedUseCase.ts`
- `src/app/(private)/services/[id]/actions.ts`
- `src/modules/reimbursement/ui/ServiceDetailView.tsx`
- `test/reimbursement/support/InvoiceTestBuilders.ts`
- `docs/START-HERE.md`
- `docs/09-current-status.md`
- `docs/10-use-cases-roadmap.md`

## Verificacion

- `npm run lint` OK
- `npm run typecheck` OK
- `npm run test` OK
- `npm run build` OK
