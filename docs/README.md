# Documentation Index

## Objetivo

Esta carpeta contiene la documentacion funcional y tecnica del proyecto.

La documentacion refleja dos niveles distintos:

- la vision completa del producto
- el alcance recortado de la V1 que se implementara primero

## Lectura recomendada

1. `START-HERE.md`
2. `09-current-status.md`
3. `sessions/README.md`
4. `00-overview.md`
5. `01-product-vision.md`
6. `07-mvp-scope.md`
7. `02-business-rules.md`
8. `04-data-model.md`
9. `05-system-architecture.md`
10. `06-technical-decisions.md`
11. `08-engineering-guidelines.md`
12. `03-user-flows.md`

## Estado actual del proyecto

La direccion del proyecto ya esta cerrada:

- arquitectura limpia ligera por modulos
- `Next.js` + `Auth.js` + `Prisma`
- `PostgreSQL` en `Neon`
- despliegue previsto en `Vercel`
- objetivo de coste cero inicial usando free tiers

Ademas, a dia de hoy ya existe una base tecnica implementada. La referencia rapida del estado real esta en:

- `09-current-status.md`

## Continuidad entre sesiones

La carpeta `sessions/` se usa para dejar una bitacora corta de cada sesion relevante.

- `sessions/README.md` explica como mantenerla
- `sessions/TEMPLATE.md` sirve como plantilla base

## Decision importante de alcance

La documentacion funcional contempla un producto que puede crecer mas adelante, pero la implementacion inicial queda recortada deliberadamente.

La referencia oficial para ese recorte es:

- `07-mvp-scope.md`

Ese documento define:

- que entra en V1
- que pasa a V2
- que se elimina del primer build

## Regla de trabajo para la implementacion

Si una pieza no ayuda de forma directa a sustituir el Excel en la operativa diaria, no entra en V1.
