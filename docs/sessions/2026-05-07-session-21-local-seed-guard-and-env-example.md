# Session 2026-05-07 Local Seed Guard and Env Example

## Objetivo

- separar de forma explicita datos locales de desarrollo frente a despliegue productivo
- blindar `prisma/seed.ts` para evitar ejecucion accidental en produccion

## Cambios realizados

- actualizado `.gitignore` para permitir versionar `.env.example`
- creado `.env.example` con claves base:
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `ALLOW_LOCAL_SEED=false`
- anadido guard en `prisma/seed.ts`:
  - bloquea seed cuando `NODE_ENV=production`
  - bloquea seed cuando `ALLOW_LOCAL_SEED` no es `true`
  - muestra valores detectados para facilitar diagnostico
- anadido script `db:seed:local` en `package.json`
- actualizada documentacion operativa en:
  - `docs/START-HERE.md`
  - `docs/09-current-status.md`

## Decisiones tomadas

- mantener migraciones incrementales con Prisma como fuente de verdad para schema
- reservar seed de datos para desarrollo local exclusivamente

## Validaciones ejecutadas

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Estado resultante

- datos de demo no pueden cargarse en produccion por error operativo
- el flujo de entorno queda separado:
  - local: `ALLOW_LOCAL_SEED=true npm run db:seed:local`
  - produccion: `npx prisma migrate deploy`

## Siguiente paso

- definir workflow de release a produccion con gate de CI + migracion + deploy
