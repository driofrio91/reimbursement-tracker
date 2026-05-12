# Hoja de ruta V2

## Objetivo

Evolucionar la operativa de facturas desde correccion final unica hacia trazabilidad historica completa de correcciones.

## Estado

- version activa: `v2`
- baseline funcional previa: `docs/versions/v1/`

## Documentos de refinamiento V2

- refinamiento funcional consolidado: `docs/versions/v2/refinement-notes.md`
- plan de roles y permisos: `docs/versions/v2/roles-plan.md`

## Backlog prioritario

1. `P0` fundacion tecnica y seguridad (roles, primer inicio obligatorio, modelo anual de topes)
2. `P1` regla de negocio principal de topes + reconciliacion `Sync`
3. `P2` home del ano actual con visibilidad global mobile-first
4. `P3` historico anual de topes (anos pasados) + `Sync` admin
5. `P4` gestion operativa (usuarios y aseguradoras)
6. `P5` anadir/eliminar facturas + exportacion CSV

## Primer bloque en ejecucion

- activar `P0` como primer bloque operativo
- ejecutar `P1` a continuacion como bloque dependiente
- mantener la trazabilidad historica avanzada de correcciones como linea evolutiva posterior, sin bloquear `P0` y `P1`

## Nota de escalabilidad (seguridad y routing)

- evaluar adopcion de `middleware` cuando crezcan rutas privadas y restricciones por rol
- objetivo: centralizar auth base, bloqueo de primer login obligatorio y segmentacion por prefijos (ej. `/admin`)
- criterio de activacion: mas de 2 areas con reglas de acceso distintas o duplicacion de guards en `layout`/`actions`
- alcance: mejora tecnica transversal, sin bloquear la entrega funcional de `P0-P5`

## Criterio de cierre por US

- caso de uso implementado en capa `application`
- reglas de negocio en `domain` o `application`, no en UI
- actualizacion de estado en `docs/09-current-status.md`
- actualizacion de roadmap V2 si cambia prioridad o alcance

## Prioridad de ejecucion (con dependencias)

### P0 - Fundacion tecnica y seguridad (bloqueante)
- [x] roles MVP (`ADMIN`, `USER`) + autorizacion backend (`requireAuth`, `requireRole`)
- [x] flujo obligatorio de cambio de contrasena en primer inicio (`mustChangePasswordOnFirstLogin`)
- [x] modelo anual de topes por usuario (`UserAnnualReimbursementLimit`) con:
  - `annualLimitAmount`
  - `reimbursedAccumulated`
  - unique (`userId`, `year`)

**Dependencias:** ninguna (base de todo V2).
**Desbloquea:** P1, P2, P3, P4.

### P1 - Regla de negocio principal de V2 (alto impacto)
- [ ] consumo anual por ano natural basado en `invoiceDate`
- [ ] solo `PAID` computa con `paidAmount`
- [ ] transiciones que ajustan cache (`PAID -> REJECTED`, `REJECTED -> PAID`, delta en `PAID`, cambio de `invoiceDate`)
- [ ] reconciliacion `Sync` (solo `ADMIN`) para ano actual con resultados visibles

**Depende de:** P0.
**Desbloquea:** visualizacion global fiable y historico.

### P2 - Home y visibilidad operativa
- [ ] bloque principal del ano actual (todos los usuarios visibles)
- [ ] barras con semaforo (`<75%` verde, `75-100%` ambar, `>100%` rojo)
- [ ] UX mobile-first
- [ ] accion bloqueada: tooltip desktop + bottom sheet mobile
- [ ] `Suspense` acotado al contenedor del bloque principal (sin loading global de pantalla)

**Depende de:** P1 (datos correctos), P0 (roles para `Sync`).

### P3 - Historico anual
- [ ] bloque secundario para anos anteriores (sin anos futuros)
- [ ] navegacion de anos pasados
- [ ] `Sync` historico solo `ADMIN` (esquina superior derecha)
- [ ] estado vacio `Sin datos`
- [ ] `Suspense` acotado al contenedor del bloque historico y separado del bloque principal

**Depende de:** P1, P2, P0.

## Criterios tecnicos para loading y jerarquia visual (P2/P3)

- No se permite un unico `Suspense` envolviendo toda la home de limites anuales.
- Se requieren dos boundaries independientes:
  - bloque principal del ano actual
  - bloque secundario de anos anteriores
- La grafica del ano actual debe ser el bloque prioritario y de mayor peso visual/tamano frente al historico.
- Durante loading, los skeletons deben mantener esa misma jerarquia (principal mayor, secundario compacto).
- La accion `Sync` usa estado propio de accion y no bloquea la pantalla completa.

### P4 - Gestion operativa (usuarios y catalogos)
- [ ] gestion de usuarios (admin crea usuarios, activacion/desactivacion)
- [ ] gestion de aseguradoras (alta/baja con bloqueo si esta en uso)
- [ ] mensajes de permiso especificos por accion

**Depende de:** P0.
**Puede ir en paralelo con:** P2/P3.

### P5 - Flujo de facturas y exportacion
- [ ] anadir/eliminar facturas segun reglas de estado cerradas
- [ ] exportacion CSV solo `CREATED`:
  - `;`
  - decimal con coma
  - BOM UTF-8
  - nombre `facturas-{nombre-servicio}-{yyyyMMdd-HHmm}.csv`
  - columnas pactadas

**Depende de:** reglas de estado existentes; recomendado despues de P1 para consistencia con topes.

## Orden recomendado por sprints

- Sprint 1: P0
- Sprint 2: P1
- Sprint 3: P2 + P3
- Sprint 4: P4 + P5

## Protocolo de ejecucion por tarea (obligatorio)

### Al iniciar una tarea
1. Revisar dependencias y prioridad en este roadmap.
2. Cambiar estado de la tarea de `[ ]` a `[~]` (en curso).

### Al finalizar una tarea
1. Validar que la tarea cumple el alcance acordado.
2. Cambiar estado de la tarea de `[~]` a `[x]` (completada) en este roadmap.
3. Actualizar `docs/09-current-status.md` con el estado real implementado.

### Regla de cierre
- Una tarea no se considera cerrada si no se actualizan ambos:
  - `docs/versions/v2/roadmap.md` (check de estado)
  - `docs/09-current-status.md` (estado real)
