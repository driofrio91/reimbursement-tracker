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
- resumen operativo por servicio con total facturado, esperado, pagado y pendientes

## Modelo funcional vigente

- operativa centrada en `Invoice`
- `claimReference` vive en factura
- varias facturas pueden compartir `claimReference`
- `paidAmount` se autocompleta con esperado y es editable

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

## Notas de transicion

- `ReimbursementRequest` permanece en persistencia temporalmente para desacople gradual
- la fuente de verdad operativa del flujo ya no depende de crear solicitudes como entidad principal

## Lectura minima para retomar

1. `docs/START-HERE.md`
2. `docs/07-mvp-scope.md`
3. `docs/09-current-status.md`
4. `docs/10-use-cases-roadmap.md`
5. `AGENTS.md`
