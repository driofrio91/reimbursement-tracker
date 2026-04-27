# Current Status

## Estado implementado

- proyecto `Next.js` con `TypeScript` y App Router
- autenticacion con `Auth.js` credentials
- rutas privadas protegidas
- flujo de servicios activo (`crear`, `listar`, `detalle`)
- al crear servicio se autogeneran facturas
- detalle de servicio con ciclo de factura por etapas:
  - completar informacion
  - registrar `claimReference`
  - marcar `PAID` o `REJECTED`
  - corregir estado final (`PAID` <-> `REJECTED`) con motivo obligatorio en modal in-app
- resumen operativo por servicio con total facturado, esperado, pagado y pendientes

## Siguiente foco aprobado

- implementar buscador global de facturas
- implementar vista de detalle dedicada por factura
- filtros iniciales del buscador: `invoiceNumber`, `claimReference`, `status`

Definicion operativa cerrada del siguiente foco:

- rutas objetivo: `/invoices` y `/invoices/[id]`
- `invoiceNumber` y `claimReference`: busqueda parcial case-insensitive
- `status`: filtro opcional de seleccion unica
- filtros combinados con AND
- orden por defecto por `updatedAt` descendente
- sin paginacion en la primera iteracion
- detalle de factura en modo lectura con enlace a `/services/[id]` para acciones del ciclo

## Modelo funcional vigente

- operativa centrada en `Invoice`
- `claimReference` vive en factura
- varias facturas pueden compartir `claimReference`
- `paidAmount` se autocompleta con esperado y es editable
- en correccion de estado final se guarda solo la ultima correccion (sin historial completo)

## Stack real

- `Next.js`
- `TypeScript`
- `Auth.js` v5 beta
- `Prisma` v6
- `PostgreSQL` en `Neon`
- `Tailwind CSS`
- `Vitest`

## Comandos verificados historicamente

```bash
npm run dev
npm run lint
npm run test
npm run typecheck
npm run build
npm run prisma:migrate
npm run db:seed
```

## Rutas actuales

- `/login`
- `/`
- `/services`
- `/services/new`
- `/services/[id]`

## Rutas previstas (siguiente US)

- `/invoices`
- `/invoices/[id]`

## Notas de transicion

- fase 1 completada: el codigo operativo (`src/` y `test/`) quedo desacoplado de `ReimbursementRequest`
- fase 2 completada: se retira `ReimbursementRequest` de `prisma/schema.prisma` y de la base de datos
- `Invoice` mantiene `claimReference` como referencia operativa unica del flujo
- migracion aplicada: `20260427113000_add_invoice_resolution_correction_fields` con `npx prisma migrate deploy`

## Lectura minima para retomar

1. `docs/START-HERE.md`
2. `docs/07-mvp-scope.md`
3. `docs/09-current-status.md`
4. `docs/10-use-cases-roadmap.md`
5. `AGENTS.md`
