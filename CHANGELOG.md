# Changelog

This project follows SemVer for release numbering.

## Version policy

| Change type | Version bump | Use when |
| --- | --- | --- |
| Bug fix only | Patch | The release contains only backwards-compatible fixes. |
| New behavior or UX capability | Minor | The release adds backwards-compatible product behavior, workflow capability, or UX improvements. |
| Breaking change | Major | The release removes or changes existing behavior incompatibly. |

## Upcoming: v0.3.0

- Publishes the completed V2 train to `main`.
- Adds Prisma schema/migration updates for roles, users, people, insurers, annual limits, service/invoice ownership, and lifecycle fields.
- Adds Auth.js credentials authorization with `ADMIN`/`USER` roles, first-login password change, account panel, and admin management routes.
- Adds annual reimbursement limit reconciliation and dashboard visibility.
- Adds invoice/service operation improvements, including add/delete rules and CSV exports.
- Adds pagination to service and invoice operational lists.
- Adds route loading skeletons for the main private routes.
- Improves service card UX so the card navigates to detail while internal actions remain clickable.
- Adds release visibility through documented Vercel log observation and slow paginated-query warnings.

## v0.2.0

- Publishes the completed V2 functional baseline documented under `docs/versions/v2/`.
- Includes roles, first-login password change, annual reimbursement limits, admin management, invoice/service operations, and CSV export capabilities.
