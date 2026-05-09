# QA Local Evidence (2026-05-09)

> Evidencia historica de cierre V1.

## Scope

- Local technical QA run for V1 closure support.
- Environment: local app + Neon database.
- Accounts validated: `sandy@local.test` and `danny@local.test`.

## Executed Commands and Results

1. `npm run lint`
   - Result: pass.

2. `npm run test`
   - Result: pass.
   - Output summary: `10` test files passed, `77` tests passed.

3. `npm run typecheck`
   - Result: pass.

4. `npm run build`
   - Result: pass.
   - Routes generated include: `/login`, `/`, `/services`, `/services/new`, `/services/[id]`, `/invoices`, `/invoices/[id]`.

5. `npm run db:seed:local`
   - Result: pass.
   - Seed script executed with `NODE_ENV=development` and `ALLOW_LOCAL_SEED=true`.

## User Evidence

- Existing local seeded users confirmed active:
  - `admin@local.test`
  - `operator@local.test`

- Local users upserted and validated:
  - `sandy@local.test` (`name: Sandy`, `isActive: true`)
  - `danny@local.test` (`name: Danny`, `isActive: true`)

- Password hash verification with bcrypt compare:
  - `sandy@local.test` with `Sandy123!` -> `OK`
  - `danny@local.test` with `Danny123!` -> `OK`

## Route Protection Smoke (HTTP)

- App started locally with `next start` on port `4010`.
- HTTP status checks:
  - `GET /login` -> `200`
  - `GET /` -> `307`
  - `GET /services` -> `307`
  - `GET /invoices` -> `307`

Interpretation:

- Public login route is accessible.
- Private routes redirect without session as expected.

## Authenticated Access Smoke (HTTP)

- Local auth flow executed against `Auth.js` credentials endpoints:
  - `GET /api/auth/csrf`
  - `POST /api/auth/callback/credentials`
  - `GET /api/auth/session`

- Anonymous check:
  - `GET /services` -> `307` (redirect as expected)

- User `sandy@local.test`:
  - login callback response -> `200`
  - session endpoint returns `user.email = sandy@local.test`
  - authenticated route access:
    - `GET /` -> `200`
    - `GET /services` -> `200`
    - `GET /invoices` -> `200`
    - `GET /services/new` -> `200`

- User `danny@local.test`:
  - login callback response -> `200`
  - session endpoint returns `user.email = danny@local.test`
  - authenticated route access:
    - `GET /` -> `200`
    - `GET /services` -> `200`
    - `GET /invoices` -> `200`
    - `GET /services/new` -> `200`

Interpretation:

- Credential login is operational for both local users.
- Session creation and protected-route access are operational after login.

## Mobile Browser QA Automation (Playwright)

- Tooling executed:
  - `npm install -D playwright`
  - `npx playwright install chromium`
  - `node scripts/run-mobile-qa.mjs` (with local server on port `4010`)

- Automated mobile checks performed (device emulation: `iPhone 12`):
  - login flow in `/login` with `sandy@local.test`
  - private route navigation: `/`, `/services`, `/services/new`, `/invoices`
  - primary actions visibility:
    - link to `/services/new`
    - `Buscar` action in `/invoices`
    - service link visible from invoice detail
  - horizontal overflow detection via DOM metrics (`scrollWidth` vs `clientWidth`)

- Result artifacts saved:
  - `artifacts/qa-mobile/results.json`
  - `artifacts/qa-mobile/01-login.png`
  - `artifacts/qa-mobile/route-_root.png`
  - `artifacts/qa-mobile/route-_services.png`
  - `artifacts/qa-mobile/route-_services_new.png`
  - `artifacts/qa-mobile/route-_invoices.png`
  - `artifacts/qa-mobile/invoice-detail-mobile.png`

- Outcome summary:
  - QA-22 (navegacion movil): pass
  - QA-23 (acciones visibles en movil): pass
  - QA-24 (sin scroll horizontal): pass

This document captures evidence of what was actually executed in CLI during this session.
