# Release v0.3.0 operational notes

This release is a backwards-compatible minor release from `develop` to `main`. It publishes the completed V2 train plus the latest release-feedback fixes: schema and migration updates, Auth.js role/session authorization, admin management flows, annual reimbursement limits, invoice/service operations, CSV exports, mobile navigation improvements, and paginated operational lists.

## Release scope

| Area | Included in v0.3.0 |
| --- | --- |
| Data and migrations | Prisma schema/migrations for users, people, insurers, annual limits, service/invoice ownership, soft activation, and invoice/service lifecycle fields. |
| Authentication and authorization | Credentials auth, `ADMIN`/`USER` roles, private route protection, centralized backend guards, first-login password change, account panel, and admin-only management routes. |
| Reimbursement operations | Service creation/detail/listing, invoice lifecycle actions, annual limit reconciliation, add/delete invoice rules, service deletion rules, and service/invoice summaries. |
| Exports and pagination | Filtered invoice CSV export, service invoice CSV export, paginated `/services` and `/invoices` lists, page-size clamping, and filter-preserving pagination/export links. |
| UX and mobile | Mobile-first private navigation, route loading states, clickable service cards that preserve internal actions, global toast feedback, and private dashboard annual-limit visibility. |
| Release feedback fixes | Pagination defaults, regression tests, documentation alignment, package metadata set to `0.3.0`, and lightweight slow-query warnings for paginated DB reads. |

## Manual verification checklist

- Log in as a seeded local `ADMIN` and verify `/`, `/account`, `/services`, `/invoices`, and `/admin/users` load through the private layout.
- Verify a non-admin user cannot access admin-only routes or actions.
- Complete the first-login password-change flow through `/change-password` with a local seed user that has `mustChangePasswordOnFirstLogin=true`.
- Create a service, open its detail page, add/delete eligible invoices, and verify blocked actions show the expected reason.
- Run annual-limit `Sync` as `ADMIN` for current and historical years and verify dashboard totals remain coherent.
- Open `/services` and verify service cards navigate to detail when the card body is selected.
- Verify service delete controls remain clickable and do not trigger card navigation.
- Open `/services?page=999&pageSize=500` and verify the page recovers to the last available page with the capped page size.
- Open `/invoices` with `invoiceNumber`, `claimReference`, and `status` filters; verify pagination links preserve those filters and the selected page size.
- Use `Extraer facturas` from `/invoices`; verify the export keeps the active filters but is not limited by the visible page.
- Use `Extraer facturas` from `/services/[id]`; verify only `CREATED` invoices are exported with UTF-8 BOM, `;` separator, comma decimals, and the agreed columns.

## Automated verification before release

Run the release branch checks from a clean working tree:

```bash
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

Production deployment continues to rely on the release workflow checks plus `npx prisma migrate deploy` before the Vercel production deploy.

## Pagination/count query latency expectation

The app does not currently have an external monitoring stack. For this release, operational confidence comes from automated checks, manual smoke testing, Vercel runtime logs, and lightweight server-side warnings for slow paginated reads.

Expected behavior:

- `/services` and `/invoices` perform count queries to build pagination metadata.
- Current data volume is small, so these queries should remain interactive on the existing Neon/Vercel setup.
- `services.listPaginated` and `invoices.searchPaginated` emit `console.warn("[db-query] Slow paginated query", ...)` only when the count + list query path exceeds the in-app threshold.
- The warning metadata intentionally avoids free-text search values; it records operation name, duration, threshold, page/pageSize, result count, filter presence flags, and invoice status when applicable.
- If a page feels slow, first verify whether the latency is isolated to count/list queries before adding caching. Operational list caching remains intentionally deferred because fresh service and invoice state is more important than stale fast reads.

## Post-deploy observation steps

1. Open Vercel production logs immediately after deploy and filter for `[db-query] Slow paginated query`.
2. Smoke `/services`, `/invoices`, `/services/[id]`, `/account`, and one admin route with production-like data.
3. Exercise `/services?page=999&pageSize=500` and a filtered `/invoices` search to force the paginated count/list paths.
4. Watch for repeated slow-query warnings, auth/authorization errors, failed CSV responses, and Prisma migration/runtime errors during the first production usage window.

## Rollback and fix-forward

- Preferred recovery is fix-forward from `develop` for isolated UI regressions, pagination link bugs, slow-query warnings without user impact, or documentation mistakes.
- Fix forward immediately if Vercel logs show repeated `[db-query] Slow paginated query` warnings on normal list usage; first reduce query cost or page size behavior before adding caching.
- Roll back only if users cannot log in, private/admin authorization is broken, Prisma migrations fail, core service/invoice workflows are unavailable, annual-limit totals are materially wrong, or CSV exports produce materially wrong data.
- The rollback boundary is the prior production release/tag before v0.3.0 because v0.3.0 contains the broader V2 train, not only the latest feedback slice.
- If rollback is required after migrations have run, verify database compatibility first. Prefer a forward hotfix when the deployed schema contains data that earlier code does not understand.

## QA artifact notes

- QA scripts use synthetic local seed credentials only (`*@local.test` users) and are not production secrets.
- QA screenshots and JSON artifacts under `artifacts/qa-mobile/` are local synthetic QA evidence; they must not contain production data.
