# Estado actual

## Estado implementado

- proyecto `Next.js` con `TypeScript` y App Router
- autenticacion con `Auth.js` credentials
- roles `ADMIN` y `USER` propagados a `JWT` y `session.user`
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
- autorizacion backend centralizada con `requireAuth` y `requireRole` aplicada en server actions privadas vigentes
- flujo obligatorio de cambio de contrasena en primer inicio implementado:
  - bloqueo de area privada mientras `mustChangePasswordOnFirstLogin=true`
  - ruta dedicada `/change-password` para actualizar credenciales
  - al completar el cambio se limpia el flag y se fuerza nuevo login con la contrasena actualizada
- modelo anual de topes por persona+aseguradora implementado en persistencia:
  - nueva tabla `PersonAnnualReimbursementLimit`
  - campos `annualLimitAmount`, `reimbursedAccumulated`, `currency`
  - unicidad por (`personId`, `insurerId`, `year`)

## Siguiente foco propuesto

- `P0` y `P1` de V2 completados
- siguiente bloque: ejecutar `P2`:
  - home del ano actual con visibilidad global y jerarquia visual mobile-first
  - barras con semaforo de consumo por usuario

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
- cada factura tiene `personId` imputado para consumo anual de topes
- el consumo anual se calcula por combinacion `personId + insurerId + year(invoiceDate)`
- `paidAmount` se autocompleta con esperado y es editable
- en correccion de estado final se guarda solo la ultima correccion (sin historial completo)

## Estado P1 implementado (topes anuales)

- consumo anual por ano natural segun `invoiceDate`
- solo facturas `PAID` computan y lo hacen con `paidAmount`
- agrupacion anual por `persona + aseguradora`
- ajustes incrementales por delta activos en transiciones finales:
  - `PAID -> REJECTED`: resta aporte previo
  - `REJECTED -> PAID`: suma aporte
  - `PAID(old) -> PAID(new)`: ajusta por diferencia
  - cambio de persona imputada entre estados no `PAID` respetado antes del cierre final
- validacion de negocio activa: no se permite marcar `PAID` sin `invoice.personId`
- `invoice.personId` bloqueado cuando la factura ya esta en `PAID`
- reconciliacion `Sync` del ano actual disponible solo para `ADMIN` desde home privada con resumen visible

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
