# Estado actual

## Estado implementado

- la version documental activa `v2` se publica como release semantica `v0.3.0` desde `develop` hacia `main`; incluye el tren V2 completo mas mejoras compatibles de feedback de release

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
  - paginacion por query params `page` y `pageSize` con defaults seguros y tope maximo
  - la exportacion CSV filtrada conserva filtros activos y exporta el resultado completo, sin paginar
- paginacion operativa tambien disponible en `/services`:
  - controles `Anterior`/`Siguiente`
  - selector compartido de tamanos de pagina `10`, `25`, `50`
  - clamping de paginas fuera de rango hacia la ultima pagina disponible
- mejoras de UX de feedback de release `v0.3.0`:
  - loading UI acotado para rutas privadas principales
  - cards de servicios clicables hacia detalle sin bloquear acciones internas como eliminar
- detalle de servicio estabilizado para facturas:
  - posicion fija en listado por orden de creacion (sin movimiento por cambio de estado)
  - etiquetas de pago ajustadas: facturas `REJECTED` muestran `Pagado: Rechazada`
- autorizacion backend centralizada con `requireAuth` y `requireRole` aplicada en server actions privadas vigentes
- flujo obligatorio de cambio de contrasena en primer inicio implementado:
  - bloqueo de area privada mientras `mustChangePasswordOnFirstLogin=true`
  - ruta dedicada `/change-password` para actualizar credenciales
  - al completar el cambio se limpia el flag y se fuerza nuevo login con la contrasena actualizada
- modelo anual de topes por titular del seguro+aseguradora implementado en persistencia:
- nueva tabla `InsuranceHolderAnnualReimbursementLimit`
  - campos `annualLimitAmount`, `reimbursedAccumulated`, `currency`
  - unicidad por (`insuranceHolderPersonId`, `insurerId`, `year`)
- home privada evolucionada a dashboard operativo del ano actual:
  - bloque principal con visibilidad global por `titular del seguro + aseguradora`
  - barras con semaforo de consumo (`<75%` verde, `75-100%` ambar, `>100%` rojo)
  - accion `Sync` dentro del contenedor principal en esquina superior derecha con icono
  - `Sync` visible para todos: habilitado en `ADMIN`, bloqueado en `USER` con tooltip desktop y bottom sheet mobile
  - loading del bloque principal con `Suspense` y skeleton local (sin bloqueo global de pantalla)
  - bloques existentes de home conservados como secciones secundarias (`Accesos rapidos` antes de `Ya disponible`)

## Siguiente foco propuesto

- V2 cerrada funcionalmente con alcance `P0-P5`.
- iniciativas fuera de alcance movidas a `docs/backlog.md` para V3 o posterior.

- `P0` y `P1` de V2 completados
- `P2` completado
- `P3` completado
- home privada ampliada con bloque historico anual:
  - bloque secundario compacto para anos pasados con navegacion por `historyYear`
  - no se permite seleccionar anos futuros y el maximo del historico es `ano actual - 1`
  - `Sync` historico con icono en esquina superior derecha del bloque
  - `Sync` historico visible para todos: habilitado en `ADMIN`, bloqueado en `USER` con tooltip desktop y bottom sheet mobile
  - `Suspense` independiente para bloque historico y estado vacio `Sin datos para {ano}`
- `P4` completado
- panel privado de cuenta operativo en `/account` (con layout privado) y `/change-password` reservado para flujo obligatorio de primer inicio
- gestion admin implementada en rutas privadas:
  - `/admin/users`: alta, edicion, rol (`ADMIN`/`USER`), activacion/desactivacion y reseteo de contrasena temporal
  - `/admin/people`: alta, edicion y activacion/desactivacion
  - `/admin/insurers`: alta, edicion y activacion/desactivacion con bloqueo si esta en uso
- UX de administracion refinada en `users`/`people`/`insurers`:
  - listados compactos con acciones por fila (`Editar`, `Activar/Desactivar`)
  - edicion en modal con error inline (no cierra si hay error)
  - confirmacion en modal para activar/desactivar con cierre solo en exito
  - feedback de exito con notificacion global
- navegacion privada actualizada por rol:
  - `Mi cuenta` apunta a `/account`
  - seccion `Administracion` visible solo para `ADMIN`
- borrado logico de `Person` implementado con `isActive` en esquema:
  - personas inactivas quedan fuera de referencias operativas nuevas
  - historico existente permanece visible
- convencion tecnica aplicada en server actions:
  - archivos con `"use server"` exportan solo funciones `async`
  - tipos/estado auxiliares movidos a archivos dedicados de estado
- migraciones Prisma estabilizadas para entorno local:
  - restaurado `migration.sql` faltante en `20260513120000_add_service_and_invoice_user_relation`
  - aplicada migracion `20260513173000_add_person_is_active`
- `P5` completado
- gestion de facturas ampliada en `/services/[id]`:
  - accion `Anadir factura` habilitada en `REGISTERED` y `SUBMITTED`, bloqueada en `REIMBURSED`
  - eliminacion por factura con icono de papelera visible siempre
  - eliminacion permitida para facturas `CREATED` y `INFORMATION_COMPLETED` (confirmacion adicional en `INFORMATION_COMPLETED`)
  - acciones bloqueadas con motivo obligatorio: tooltip desktop y bottom sheet mobile
- eliminacion de servicio habilitada en `/services` y `/services/[id]`:
  - permitida solo si todas las facturas del servicio estan en `CREATED`
  - al eliminar servicio se eliminan sus facturas asociadas
  - bloqueada con motivo si existe alguna factura en `INFORMATION_COMPLETED` o estados posteriores
  - feedback unificado en area privada:
    - acciones locales usan notificacion inmediata a traves del listener global
    - `/services/[id]` (detalle) usa `redirect` server-side a `/services` + flash toast global en destino
- creacion de servicio en `/services/new`:
  - `redirect` al detalle del servicio creado
  - feedback de exito post-redirect a traves del listener global
- infraestructura privada de notificaciones unificada:
  - `PrivateToaster` global en layout privado
  - `GlobalToastListener` como punto unico de render
  - transporte interno `immediate` en memoria para acciones locales
  - transporte interno `after-redirect` mediante flash temporal para redirects privados
- exportacion CSV por servicio disponible en `/services/[id]`:
  - accion `Extraer facturas`
  - exporta unicamente facturas `CREATED`
  - boton deshabilitado cuando no hay facturas `CREATED` con motivo visible
  - formato cerrado: BOM UTF-8, separador `;`, decimal con coma
  - nombre de archivo: `facturas-{nombre-servicio}-{yyyyMMdd-HHmm}.csv`
- columnas pactadas: `TRATAMIENTO`, `IMPORTE DE LA FACTURA`, `TITULAR`, `FECHA FACTURA`, `SOLICITADA`

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
- `Person` representa al titular del seguro para consumo anual de topes
- el nombre libre del servicio identifica a la persona que recibe el servicio y puede ser distinta del titular
- cada factura tiene `insuranceHolderPersonId` imputado al titular del seguro para consumo anual de topes
- el consumo anual se calcula por combinacion `insuranceHolderPersonId + insurerId + year(invoiceDate)`
- app, dominio y schema fisico ya estan alineados a semantica de titular del seguro y receptor del servicio
- `paidAmount` se autocompleta con esperado y es editable
- en correccion de estado final se guarda solo la ultima correccion (sin historial completo)

## Estado P1 implementado (topes anuales)

- consumo anual por ano natural segun `invoiceDate`
- solo facturas `PAID` computan y lo hacen con `paidAmount`
- agrupacion anual por `titular del seguro + aseguradora`
- ajustes incrementales por delta activos en transiciones finales:
  - `PAID -> REJECTED`: resta aporte previo
  - `REJECTED -> PAID`: suma aporte
  - `PAID(old) -> PAID(new)`: ajusta por diferencia
  - cambio de persona imputada entre estados no `PAID` respetado antes del cierre final
- validacion de negocio activa: no se permite marcar `PAID` sin `invoice.insuranceHolderPersonId`
- `invoice.insuranceHolderPersonId` bloqueado cuando la factura ya esta en `PAID`
- reconciliacion `Sync` del ano actual disponible solo para `ADMIN` desde home privada con resumen visible
- reconciliacion `Sync` anual no destructiva:
  - recalcula acumulados desde facturas `PAID` del ano solicitado
  - actualiza/crea combinaciones activas `titular del seguro + aseguradora`
  - conserva filas historicas del mismo ano que ya no estan en el snapshot y pone `reimbursedAccumulated = 0`
  - no elimina filas ni modifica otros anos

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
- `/account`
- `/change-password`
- `/services`
- `/services/new`
- `/services/[id]`
- `/invoices`
- `/invoices/[id]`
- `/admin/users`
- `/admin/people`
- `/admin/insurers`

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
