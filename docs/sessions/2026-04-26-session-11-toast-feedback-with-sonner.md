# Session 2026-04-26 Toast Feedback with Sonner

## Objetivo

- reemplazar feedback por query params en detalle de servicio
- usar toasts con `sonner` sin ensuciar URL

## Cambios implementados

- `ServiceDetailView` pasa a cliente para gestionar estado de acciones de formulario
- se introduce estado de accion por formulario con `useActionState`
- cada resultado de accion muestra `toast.success` o `toast.error`
- al completar accion con exito se ejecuta `router.refresh()` para refrescar datos

## Acciones servidor

- `actions.ts` ahora devuelve `InvoiceActionResult` en lugar de redirigir
- se mantiene `revalidatePath` en rutas exitosas
- validaciones y errores de caso de uso se devuelven como resultado estructurado

## Limpieza

- se elimina lectura de `searchParams` de feedback en `page.tsx`
- se elimina el banner de feedback basado en URL

## Archivos clave

- `src/app/(private)/services/[id]/actions.ts`
- `src/app/(private)/services/[id]/page.tsx`
- `src/modules/reimbursement/ui/ServiceDetailView.tsx`

## Verificacion

- `npm run typecheck` OK
- `npm run lint` OK
- `npm run test` OK
