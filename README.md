# reimbursement-tracker

Aplicacion interna para sustituir el Excel operativo de seguimiento de servicios, facturas y solicitudes de reembolso.

## Estado actual

- Proyecto inicializado con `Next.js`, `TypeScript`, `App Router` y `Tailwind CSS`.
- `Prisma` configurado y conectado a `PostgreSQL` en `Neon`.
- `Auth.js` configurado con `Credentials` y login funcional.
- Flujo inicial de facturas implementado: crear factura desde `/services/[id]`.
- Feedback operativo con toast en el area privada usando `sonner`.
- La documentacion funcional y tecnica vive en `docs/`.
- La primera iteracion de servicios ya esta cerrada y el roadmap de V1 avanza por facturas.

## Comandos

```bash
npm run dev
npm run lint
npm run test
npm run typecheck
npm run build
npm run prisma:migrate
npm run db:seed
```

## Documentacion clave

- `docs/START-HERE.md`
- `docs/09-current-status.md`
- `docs/10-use-cases-roadmap.md`
- `docs/sessions/README.md`
- `docs/07-mvp-scope.md`
- `docs/06-technical-decisions.md`
- `docs/05-system-architecture.md`
- `docs/08-engineering-guidelines.md`

## Estructura prevista

```text
src/
  app/
  modules/
    reimbursement/
      domain/
      application/
      infrastructure/
      ui/
  lib/
    auth/
    config/
    db/
```
