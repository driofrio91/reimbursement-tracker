# Session 2026-05-07 Release Prod Workflow

## Objetivo

- configurar despliegue de produccion solo desde release final en GitHub
- bloquear despliegue en releases `draft` y `prerelease`

## Cambios realizados

- creado workflow `.github/workflows/release-prod.yml`
- trigger configurado en `release.published`
- guardas activas para prod:
  - tag empieza por `v`
  - release no `draft`
  - release no `prerelease`
- pipeline de release configurado en este orden:
  - `npm ci`
  - `npm run lint`
  - `npm run test`
  - `npm run typecheck`
  - `npm run build`
  - `npx prisma migrate deploy`
  - `vercel pull`, `vercel build --prod`, `vercel deploy --prebuilt --prod`
- actualizados docs:
  - `docs/START-HERE.md`
  - `docs/09-current-status.md`
  - `docs/10-use-cases-roadmap.md`

## Decisiones tomadas

- produccion solo desde release final con version semantica tipo `vX.Y.Z`
- reservar `prerelease` para flujo futuro de staging/preview

## Validaciones ejecutadas

- validacion estatica de YAML del workflow

## Estado resultante

- el despliegue de produccion deja de depender de pushes directos
- se fuerza gate tecnico completo y migracion antes de desplegar

## Siguiente paso

- publicar una release de prueba controlada (`vX.Y.Z`) y verificar ejecucion completa
