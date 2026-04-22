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
- primer flujo de negocio de servicios implementado: crear, listar y ver detalle
- base de testing inicial montada con `vitest` y primeros tests unitarios del modulo `reimbursement`

## Stack real del repositorio

- `Next.js`
- `TypeScript`
- `Auth.js` v5 beta
- `Prisma` v6
- `PostgreSQL` en `Neon`
- `Tailwind CSS`
- `Vitest`

## Comandos verificados

```bash
npm run dev
npm run lint
npm run test
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
- `/services`: listado inicial de servicios
- `/services/new`: alta de servicio reembolsable
- `/services/[id]`: detalle de servicio
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
- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm run dev`
- login manual verificado con usuario seed
- `/login` carga correctamente
- la ruta `/` exige sesion
- la ruta `/` carga correctamente tras autenticacion

## Decisiones tecnicas cerradas durante la implementacion

- se usa `Neon` ya desde desarrollo para evitar dependencia de `Docker` o `PostgreSQL` local
- se mantienen credenciales simples solo para desarrollo, pero las contrasenas siguen guardadas con hash
- `Prisma` se fija en v6 para evitar la complejidad adicional de configuracion introducida en `Prisma` v7 en este arranque
- se mantiene `src/app` en lugar de `app` en raiz para agrupar todo el codigo fuente bajo `src/`
- el primer bloque de tests vive en `test/` y usa `vitest` con `vi` para mockear contratos en `application`
- los tests de esta fase cubren `CreateServiceUseCase` y `CreateServiceFormSchema`; no cubren todavia `ui`, `app`, `actions` ni Prisma real

## Riesgos o notas operativas

- `.env` es local y esta ignorado por git
- la cadena de conexion de `Neon` no debe copiarse a markdown del repositorio
- como la credencial de base de datos fue compartida durante una sesion interactiva, conviene rotarla cuando esta fase inicial termine
- el aviso de hidratacion visto en desarrollo no se reprodujo como error real de la app; la causa mas probable es una extension del navegador sobre el formulario de login

## Siguiente paso recomendado

Expandir la base de testing y seguir con el roadmap de negocio:

1. anadir tests para `GetServiceDetailUseCase` y `ListServicesUseCase`
2. seguir con facturas, solicitudes y resolucion

## Propuesta concreta para la siguiente sesion

1. anadir tests para `GetServiceDetailUseCase` y `ListServicesUseCase`
2. decidir si se documenta una convencion de tests para futuros repositorios de `Invoice` y `Request`
3. continuar con el siguiente bloque funcional del roadmap: facturas

La hoja de ruta completa de casos de uso y su orden recomendado vive en `docs/10-use-cases-roadmap.md`.

## Lectura minima para retomar el proyecto

1. `docs/START-HERE.md`
2. `docs/09-current-status.md`
3. `docs/10-use-cases-roadmap.md`
4. `docs/sessions/2026-04-22-session-01-services-and-testing.md`
5. `AGENTS.md`
