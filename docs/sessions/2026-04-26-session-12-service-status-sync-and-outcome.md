# Session 2026-04-26 Service Status Sync and Reimbursement Outcome

## Objetivo

- persistir el estado operativo del servicio derivado del ciclo de facturas
- mostrar resultado economico derivado sin mezclarlo con el workflow

## Cambios implementados

- se crea `SyncServiceStatusFromInvoicesUseCase` para recalcular `Service.status` usando solo estados de factura
- se define regla operativa encapsulada:
  - `REGISTERED`: existe alguna factura en `CREATED` o `INFORMATION_COMPLETED`
  - `SUBMITTED`: no hay facturas en etapas iniciales y el caso no esta totalmente cerrado
  - `REIMBURSED`: todas las facturas estan en `PAID` o `REJECTED`
- se extiende `ServiceRepository` con `updateStatus`
- `PrismaServiceRepository` implementa la persistencia de estado del servicio
- cada accion de factura en `src/app/(private)/services/[id]/actions.ts` sincroniza estado de servicio tras exito

## Resultado economico derivado

- `GetServiceInvoiceSummaryUseCase` ahora devuelve `reimbursementOutcome`
- reglas derivadas:
  - `FULL`: `totalPaidAmount >= totalExpectedAmount`
  - `PARTIAL`: `totalPaidAmount > 0` y `totalPaidAmount < totalExpectedAmount`
  - `NONE`: `totalPaidAmount === 0` y todas las facturas resueltas
- en UI se muestra en detalle como metrica separada de `Service.status`

## Encapsulacion de reglas

- workflow operativo y resultado economico quedan separados
- no se introducen nuevos estados persistidos en Prisma para esta iteracion

## Archivos clave

- `src/modules/reimbursement/application/SyncServiceStatusFromInvoicesUseCase.ts`
- `src/modules/reimbursement/domain/ServiceRepository.ts`
- `src/modules/reimbursement/infrastructure/PrismaServiceRepository.ts`
- `src/app/(private)/services/[id]/actions.ts`
- `src/modules/reimbursement/application/GetServiceInvoiceSummaryUseCase.ts`
- `src/modules/reimbursement/ui/ServiceDetailView.tsx`
- `test/reimbursement/application/SyncServiceStatusFromInvoicesUseCase.test.ts`
- `test/reimbursement/application/GetServiceInvoiceSummaryUseCase.test.ts`
- `test/reimbursement/support/RepositoryMocks.ts`

## Verificacion

- `npm run test` OK
- `npm run lint` OK
- `npm run typecheck` OK
- `npm run build` OK
