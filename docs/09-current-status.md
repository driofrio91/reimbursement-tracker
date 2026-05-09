# Estado actual

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
  - validaciones estrictas de transicion activas en backend (sin saltos, sin retrocesos y sin re-confirmacion de estado final fuera de correccion)
- resumen operativo por servicio con total facturado, esperado, pagado y pendientes
- buscador global de facturas en `/invoices`
- detalle dedicado de factura en `/invoices/[id]` en modo lectura con enlace a `/services/[id]`
- filtros operativos de facturas implementados:
  - `invoiceNumber` y `claimReference` con busqueda parcial case-insensitive
  - `status` opcional de seleccion unica
  - filtros combinados con AND
  - orden por `updatedAt` descendente
  - sin paginacion en esta iteracion

## Siguiente foco propuesto

- documentar cierre operativo de V1 y preparar arranque de backlog V2
- evidencia de QA local consolidada en `docs/versions/v1/qa-local-evidence.md`
- checklist funcional V1 cerrada en `docs/versions/v1/qa-functional-checklist-v1.md` (`24 PASS`, `V1 LISTA`)
- evidencias moviles automatizadas en `artifacts/qa-mobile/results.json` y `artifacts/qa-mobile/*.png`

## Pipeline de release a produccion

- workflow creado: `.github/workflows/release-prod.yml`
- trigger: `release.published`
- guardas de seguridad para despliegue prod:
  - no `draft`
  - no `prerelease`
  - tag que empiece por `v`
- orden de ejecucion:
  - `npm ci`
  - `npm run lint`
  - `npm run test`
  - `npm run typecheck`
  - `npm run build`
  - `npx prisma migrate deploy`
  - `vercel deploy --prebuilt --prod`
- estado actual: release final desplegada correctamente desde GitHub Release
- nota operativa: en Vercel se desactivo build automatico por commit para evitar deploys fuera de release

## Cobertura de escenarios limite

- sincronizacion de `Service.status` validada con tests de regresion para:
  - combinaciones mixtas con etapas iniciales (`REGISTERED`)
  - casos abiertos sin etapas iniciales (`SUBMITTED`)
  - cierre total con resoluciones finales (`REIMBURSED`)
- resultado economico (`FULL`, `PARTIAL`, `NONE`) validado con casos de borde:
  - pago exacto o superior al esperado (`FULL`)
  - pago parcial en caso resuelto o en seguimiento (`PARTIAL`)
  - cero pagado con todas las facturas resueltas (`NONE`)
- matriz completa de escenarios documentada en `docs/versions/v1/mvp-scope.md` (casos `A1-A14` y `B1-B10`)

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
npm run db:seed:local
```

## Politica de seed y migraciones

- `prisma/seed.ts` se usa solo para datos locales de desarrollo
- el seed exige `ALLOW_LOCAL_SEED=true` y bloquea ejecucion en `NODE_ENV=production`
- en produccion se aplican migraciones incrementales con `npx prisma migrate deploy`

## Rutas actuales

- `/login`
- `/`
- `/services`
- `/services/new`
- `/services/[id]`
- `/invoices`
- `/invoices/[id]`

## Notas de transicion

- fase 1 completada: el codigo operativo (`src/` y `test/`) quedo desacoplado de `ReimbursementRequest`
- fase 2 completada: se retira `ReimbursementRequest` de `prisma/schema.prisma` y de la base de datos
- `Invoice` mantiene `claimReference` como referencia operativa unica del flujo
- migracion aplicada: `20260427113000_add_invoice_resolution_correction_fields` con `npx prisma migrate deploy`

## Lectura minima para retomar

1. `docs/PROJECT-HUB.md`
2. `docs/09-current-status.md`
3. `docs/versions/v2/roadmap.md`
4. `docs/shared/data-model.md`
5. `AGENTS.md`
