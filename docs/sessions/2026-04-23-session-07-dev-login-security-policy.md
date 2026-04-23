# Session 2026-04-23 Dev Login Security Policy

## Objetivo

- blindar el uso de credenciales de desarrollo para que nunca funcionen fuera de local

## Cambios realizados

- anadida politica de control en backend para cuentas `@local.test`
- anadida regla dura: en `production`, `@local.test` siempre bloqueado
- ajustada pantalla de login para mostrar prefill y bloque de credenciales solo en `development`
- ajustado `prisma/seed.ts` para crear usuarios dev solo cuando aplica politica local
- anadido `.env.example` con `AUTH_ALLOW_DEV_LOGIN` y notas de uso
- anadidos tests en `test/auth/DevLoginPolicy.test.ts`
- actualizados `docs/08-engineering-guidelines.md` y `docs/10-use-cases-roadmap.md` con checklist de seguridad

## Decisiones tomadas

- las credenciales dummy pueden vivir en repo para desarrollo, pero no deben habilitar acceso fuera de local
- el control de seguridad principal se aplica en backend, no en frontend
- el checklist de seguridad de credenciales dev pasa a ser parte obligatoria del cierre de US que toquen auth/login/seed/env

## Validaciones ejecutadas

- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Estado resultante

- login de cuentas `@local.test` bloqueado fuera de local y siempre bloqueado en `production`
- UI sin exposicion de credenciales dev fuera de entorno local
- politica documentada y checklist activa para sesiones futuras

## Siguiente paso

- continuar con `ListInvoicesByServiceUseCase`
- mantener actualizacion de roadmap y handoff al cerrar cada US
