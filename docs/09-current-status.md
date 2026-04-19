# Current Status

## Objetivo

Este documento resume el estado tecnico real del repositorio para poder continuar el trabajo en otra sesion sin releer toda la documentacion historica.

## Estado actual implementado

- proyecto inicializado con `Next.js`, `TypeScript`, `App Router` y `Tailwind CSS`
- codigo fuente organizado en `src/app`, `src/modules` y `src/lib`
- `Prisma` configurado y conectado a `PostgreSQL` en `Neon`
- migracion inicial aplicada contra la base de datos remota
- seed de desarrollo disponible con usuarios, aseguradoras y personas
- `Auth.js` montado con `Credentials` (`email + password`)
- ruta publica `/login`
- ruta protegida `/` mediante `src/app/(private)/layout.tsx`

## Stack real del repositorio

- `Next.js`
- `TypeScript`
- `Auth.js` v5 beta
- `Prisma` v6
- `PostgreSQL` en `Neon`
- `Tailwind CSS`

## Comandos verificados

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run prisma:migrate
npm run db:seed
```

## Credenciales de desarrollo

- `admin@local.test` / `admin123`
- `operator@local.test` / `operator123`

## Rutas actuales

- `/login`: pantalla publica de acceso
- `/`: pantalla privada inicial tras autenticacion
- `/api/auth/[...nextauth]`: handlers de autenticacion

## Estructura relevante actual

```text
prisma/
  schema.prisma
  seed.ts

src/
  app/
    (private)/
    api/auth/[...nextauth]/
    login/
  lib/
    auth/
    db/
  modules/
    reimbursement/
```

## Que esta ya validado

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- login manual verificado con usuario seed
- `/login` carga correctamente
- la ruta `/` exige sesion

## Decisiones tecnicas cerradas durante la implementacion

- se usa `Neon` ya desde desarrollo para evitar dependencia de `Docker` o `PostgreSQL` local
- se mantienen credenciales simples solo para desarrollo, pero las contrasenas siguen guardadas con hash
- `Prisma` se fija en v6 para evitar la complejidad adicional de configuracion introducida en `Prisma` v7 en este arranque
- se mantiene `src/app` en lugar de `app` en raiz para agrupar todo el codigo fuente bajo `src/`

## Riesgos o notas operativas

- `.env` es local y esta ignorado por git
- la cadena de conexion de `Neon` no debe copiarse a markdown del repositorio
- como la credencial de base de datos fue compartida durante una sesion interactiva, conviene rotarla cuando esta fase inicial termine

## Siguiente paso recomendado

Implementar la primera funcionalidad de negocio real de la V1:

1. crear servicio reembolsable
2. listar servicios
3. ver detalle de servicio

## Lectura minima para retomar el proyecto

1. `docs/START-HERE.md`
2. `docs/09-current-status.md`
3. ultimo archivo de `docs/sessions/`
4. `AGENTS.md`
