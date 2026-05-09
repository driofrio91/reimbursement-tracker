# QA Funcional V1 Checklist (Local)

> Evidencia historica de cierre V1.

## Objetivo

- Cerrar QA funcional de V1 en entorno local con evidencia trazable.
- Complementa evidencia tecnica ya registrada en `docs/versions/v1/qa-local-evidence.md`.

## Datos de prueba

- Usuario 1: `sandy@local.test` / `Sandy123!`
- Usuario 2: `danny@local.test` / `Danny123!`

## Entorno

- App local en ejecucion (`npm run dev` o `next start`).
- Base de datos Neon accesible.
- Seed local ejecutado (`npm run db:seed:local`).

## Criterio de cierre

- Sin defectos bloqueantes en flujo principal de V1.
- Todas las rutas privadas con acceso correcto tras login.
- Ciclo de factura por etapas cumple reglas de transicion.
- Navegacion movil operativa y acciones principales visibles.

## Matriz de casos

Usar columnas: `Resultado` (`PASS`/`FAIL`), `Evidencia` (captura o nota), `Observaciones`.

| ID | Caso | Pasos | Esperado | Resultado | Evidencia | Observaciones |
|---|---|---|---|---|---|---|
| QA-01 | Login Sandy | Ir a `/login`, autenticar con Sandy | Login correcto, redireccion a ruta privada | PASS | `docs/versions/v1/qa-local-evidence.md` (Authenticated Access Smoke) | Ejecutado por HTTP (`/api/auth/callback/credentials` + session). |
| QA-02 | Login Danny | Cerrar sesion, autenticar con Danny | Login correcto, redireccion a ruta privada | PASS | `docs/versions/v1/qa-local-evidence.md` (Authenticated Access Smoke) | Ejecutado por HTTP (`/api/auth/callback/credentials` + session). |
| QA-03 | Ruta privada sin sesion | Sin sesion abrir `/services` | Redireccion a `/login` | PASS | `docs/versions/v1/qa-local-evidence.md` | `GET /services -> 307` sin sesion. |
| QA-04 | Home privada | Con sesion abrir `/` | Render correcto sin error | PASS | `docs/versions/v1/qa-local-evidence.md` | `GET / -> 200` con sesion para ambos usuarios. |
| QA-05 | Listado servicios | Abrir `/services` | Listado visible y navegable | PASS | `docs/versions/v1/qa-local-evidence.md` | `GET /services -> 200` autenticado. |
| QA-06 | Alta servicio | Abrir `/services/new`, crear servicio valido | Servicio creado correctamente | PASS | `test/reimbursement/application/CreateServiceUseCase.test.ts` | Cubierto por test de aplicacion (automated). |
| QA-07 | Autogeneracion facturas | Tras alta, revisar detalle servicio | Facturas generadas con regla `ceil(actual/expected)` | PASS | `test/reimbursement/application/CreateServiceUseCase.test.ts` | Regla de autogeneracion validada en tests. |
| QA-08 | Completar info factura | En factura `CREATED`, completar datos obligatorios | Pasa a `INFORMATION_COMPLETED` | PASS | `test/reimbursement/application/InvoiceLifecycleUseCases.test.ts` | Cubierto por pruebas de ciclo de vida. |
| QA-09 | Registrar claimReference | En `INFORMATION_COMPLETED`, registrar referencia | Pasa a `CLAIM_REFERENCE_COMPLETED` | PASS | `test/reimbursement/application/InvoiceLifecycleUseCases.test.ts` | Cubierto por pruebas de ciclo de vida. |
| QA-10 | Marcar pagada | En `CLAIM_REFERENCE_COMPLETED`, marcar `PAID` | Estado final `PAID` persistido | PASS | `test/reimbursement/application/InvoiceLifecycleUseCases.test.ts` | Cubierto por pruebas de ciclo de vida. |
| QA-11 | Marcar rechazada | En `CLAIM_REFERENCE_COMPLETED`, marcar `REJECTED` | Estado final `REJECTED` persistido | PASS | `test/reimbursement/application/InvoiceLifecycleUseCases.test.ts` | Cubierto por pruebas de ciclo de vida. |
| QA-12 | Correccion final | Corregir `PAID <-> REJECTED` con motivo | Cambio permitido solo con motivo obligatorio | PASS | `test/reimbursement/application/InvoiceLifecycleUseCases.test.ts` | Correccion final validada por pruebas. |
| QA-13 | Salto no permitido | Intentar `CREATED -> CLAIM_REFERENCE_COMPLETED` | Bloqueado por validacion | PASS | `test/reimbursement/application/InvoiceLifecycleUseCases.test.ts` | Reglas de transicion estrictas validadas. |
| QA-14 | Retroceso no permitido | Intentar retroceso de etapa normal | Bloqueado por validacion | PASS | `test/reimbursement/application/InvoiceLifecycleUseCases.test.ts` | Reglas de transicion estrictas validadas. |
| QA-15 | Reconfirmacion no permitida | Repetir accion de estado ya confirmado | Bloqueado por validacion | PASS | `test/reimbursement/application/InvoiceLifecycleUseCases.test.ts` | Reglas de transicion estrictas validadas. |
| QA-16 | Busqueda por invoiceNumber | En `/invoices`, filtrar parcial | Coincidencias case-insensitive correctas | PASS | `test/reimbursement/application/SearchInvoicesUseCase.test.ts` | Cobertura automatizada de busqueda parcial. |
| QA-17 | Busqueda por claimReference | En `/invoices`, filtrar parcial | Coincidencias case-insensitive correctas | PASS | `test/reimbursement/application/SearchInvoicesUseCase.test.ts` | Cobertura automatizada de busqueda parcial. |
| QA-18 | Filtro por status | Aplicar status unico | Lista filtrada por estado exacto | PASS | `test/reimbursement/application/SearchInvoicesUseCase.test.ts` | Cobertura automatizada de filtro por estado. |
| QA-19 | Filtros combinados | Aplicar invoiceNumber + claimReference + status | Combinacion AND correcta | PASS | `test/reimbursement/application/SearchInvoicesUseCase.test.ts` | Cobertura automatizada de filtros AND. |
| QA-20 | Orden listado facturas | Sin filtros o con filtros | Orden por `updatedAt` descendente | PASS | `test/reimbursement/application/SearchInvoicesUseCase.test.ts` | Orden esperado validado en test de busqueda. |
| QA-21 | Detalle factura lectura | Abrir `/invoices/[id]` | Vista lectura operativa con enlace a servicio | PASS | `docs/versions/v1/qa-local-evidence.md` + `test/reimbursement/application/GetInvoiceDetailUseCase.test.ts` | Ruta autenticada `/invoices` valida; detalle cubierto a nivel use case. |
| QA-22 | Navegacion movil | Viewport movil, navegar rutas privadas | Navegacion usable y estable | PASS | `artifacts/qa-mobile/results.json` + capturas en `artifacts/qa-mobile/` | Ejecutado con Playwright (`iPhone 12`) en rutas privadas principales. |
| QA-23 | Acciones visibles movil | En movil revisar acciones primarias | Acciones principales visibles sin desktop-dependencia | PASS | `artifacts/qa-mobile/results.json` + `artifacts/qa-mobile/route-_services.png` + `artifacts/qa-mobile/route-_invoices.png` | Accion `/services/new` visible y boton `Buscar` visible en facturas. |
| QA-24 | Scroll horizontal movil | Recorrer pantallas clave en movil | Sin scroll horizontal accidental | PASS | `artifacts/qa-mobile/results.json` | `hasHorizontalOverflow=false` en `/`, `/services`, `/services/new`, `/invoices`. |

## Resumen final QA

- Fecha de ejecucion: `2026-05-09`
- Ejecutado por: OpenCode (CLI + pruebas automatizadas del repo)
- Total casos: `24`
- PASS: `24`
- FAIL: `0`
- PENDIENTE: `0`
- Bloqueantes: `0` detectados en ejecucion CLI/automated
- No bloqueantes: `0` detectados en ejecucion CLI/automated
- Veredicto: `V1 LISTA`

## Defectos encontrados

| ID Defecto | Severidad | Caso QA | Descripcion | Reproducibilidad | Estado |
|---|---|---|---|---|---|
|  |  |  |  |  |  |
