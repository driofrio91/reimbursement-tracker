# reimbursement-tracker

Aplicacion interna para sustituir el Excel operativo de seguimiento de servicios y facturas de reembolso.

## Requisitos

- `Node.js` 20+
- `npm`
- base de datos PostgreSQL accesible (Neon recomendado para desarrollo)

## Instalacion

```bash
npm install
```

## Configuracion local

1. Copia `.env.example` a `.env`.
2. Completa como minimo:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `ALLOW_LOCAL_SEED=true`
   - `LOCAL_ADMIN_PASSWORD`
   - `LOCAL_OPERATOR_PASSWORD`

## Preparar base de datos local

```bash
npm run prisma:migrate
npm run db:seed:local
```

Usuarios creados por seed:

- `admin@local.test`
- `operator@local.test`

Las contrasenas son las definidas en:

- `LOCAL_ADMIN_PASSWORD`
- `LOCAL_OPERATOR_PASSWORD`

## Comandos principales

```bash
npm run dev
npm run lint
npm run test
npm run typecheck
npm run build
```

## Troubleshooting

Si `npm run prisma:migrate` solicita reset por historial de migraciones, estas reutilizando una base con estado previo.

Opciones:

1. recomendado: usar una base nueva para desarrollo
2. si puedes perder datos locales: `npx prisma migrate reset` y despues `npm run db:seed:local`

## Documentacion

Para contexto funcional, decisiones y roadmap por version, consulta `docs/PROJECT-HUB.md`.
