# Reimbursement Tracker

Aplicación interna para gestionar servicios médicos y facturas de reembolso. Sustituye el Excel operativo con una solución web moderna.

## Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions, Prisma ORM
- **Base de datos:** PostgreSQL (Neon)
- **Autenticación:** Auth.js con credenciales
- **Arquitectura:** Clean Architecture (dominio, aplicación, infraestructura, UI)

## Funcionalidades

- Autenticación con roles (admin, operador)
- Gestión de servicios médicos y facturas
- Seguimiento del ciclo de vida de facturas
- Límites anuales de reembolso por persona
- Rate limiting y bloqueo progresivo por intentos fallidos
- Exportación a CSV
- Interfaz mobile-first

## Seguridad

- Rate limiting en endpoints de autenticación (Upstash Redis)
- Bloqueo progresivo: 3 intentos fallidos → 1min → 5min → 10min → 20min → 60min
- Headers de seguridad (HSTS, X-Frame-Options, CSP)

## Requisitos

- Node.js 20+
- npm
- PostgreSQL (Neon recomendado)

## Instalación

```bash
npm install
```

## Configuración local

1. Copia `.env.example` a `.env`
2. Completa las variables:
   - `DATABASE_URL` — conexión a PostgreSQL
   - `AUTH_SECRET` — clave para sesiones
   - `UPSTASH_REDIS_REST_URL` — URL de Upstash Redis
   - `UPSTASH_REDIS_REST_TOKEN` — token de Upstash Redis
   - `ALLOW_LOCAL_SEED=true` — habilita seed local
   - `LOCAL_ADMIN_PASSWORD` — contraseña del admin de prueba
   - `LOCAL_OPERATOR_PASSWORD` — contraseña del operador de prueba

## Preparar base de datos

```bash
npm run prisma:migrate
npm run db:seed
```

Usuarios de desarrollo:
- `admin@local.test`
- `operator@local.test`

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Linter |
| `npm run typecheck` | Verificación de tipos |
| `npm run test` | Tests |

## Documentación

Ver `docs/PROJECT-HUB.md` para contexto funcional, decisiones técnicas y roadmap.
