# Release v0.3.0 operational notes

This release is a backwards-compatible minor release for the `develop` branch. It improves perceived navigation speed, makes service cards easier to use, and paginates the operational service and invoice lists.

## Manual verification checklist

- Open `/services` and verify service cards navigate to detail when the card body is selected.
- Verify service delete controls remain clickable and do not trigger card navigation.
- Open `/services?page=999&pageSize=500` and verify the page recovers to the last available page with the capped page size.
- Open `/invoices` with `invoiceNumber`, `claimReference`, and `status` filters; verify pagination links preserve those filters and the selected page size.
- Use `Extraer facturas` from `/invoices`; verify the export keeps the active filters but is not limited by the visible page.

## Pagination/count query latency expectation

The app does not currently have a monitoring stack. For this release, operational confidence comes from manual checks plus the standard CI verification commands.

Expected behavior:

- `/services` and `/invoices` perform count queries to build pagination metadata.
- Current data volume is small, so these queries should remain interactive on the existing Neon/Vercel setup.
- If a page feels slow, first verify whether the latency is isolated to count/list queries before adding caching. Operational list caching remains intentionally deferred because fresh service and invoice state is more important than stale fast reads.

## Rollback and fix-forward

- Preferred recovery is fix-forward from `develop` if pagination links, filter preservation, or export behavior regresses.
- Roll back the release only if users cannot access the core service/invoice flows or the exported invoice data is materially wrong.
- A safe rollback boundary is the v0.3.0 release branch because the changes are limited to list pagination, navigation/loading UX, tests, and release documentation.
