# AGENTS.md

## Current repo state
- This repository now has a single `Next.js` app at the repo root plus project docs in `docs/`.
- Use `npm` for repo commands. Verified scripts currently are `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run prisma:migrate`, and `npm run db:seed`.

## Source of truth
- Start with `docs/START-HERE.md`. It is the explicit handoff document for new sessions.
- Read `docs/09-current-status.md` for the current executable state before assuming what is already implemented.
- Read `docs/10-use-cases-roadmap.md` before choosing the next feature to implement.
- Read the latest file in `docs/sessions/` for the most recent verified work log.
- Treat `docs/07-mvp-scope.md` as the authoritative scope cut for V1.
- Use `docs/06-technical-decisions.md` for approved stack decisions.
- Use `docs/05-system-architecture.md` for the intended module/layer boundaries.

## Verified product constraints
- V1 is intentionally narrow: `login`, `create reimbursable service`, `list services`, `service detail`.
- Approved stack: `Next.js`, `TypeScript`, `Auth.js`, `Prisma`, `PostgreSQL` on `Neon`, `shadcn/ui`, `Vercel`.
- Approved architecture: one `reimbursement` module with `domain`, `application`, `infrastructure`, and `ui` layers.
- Keep business rules out of React components, Next.js pages, server actions, route handlers, and raw Prisma queries.

## Conflict handling
- There is a docs conflict: `docs/00-overview.md` mentions broader MVP items like dashboard/import, but `docs/START-HERE.md` and `docs/07-mvp-scope.md` explicitly cut those from the first iteration.
- When scope documents disagree, follow `START-HERE.md` + `07-mvp-scope.md` + the current executable repo state.

## Implementation guidance for future sessions
- Keep implementation inside the root app; this is not a monorepo.
- Preserve the approved structure under `src/`: `app/`, `modules/reimbursement/`, and `lib/`.
- Prefer defining the V1 data model in Prisma once, but only implement the first-iteration flows at the UI/use-case level.
- Keep the initial UI in Spanish, as approved in `docs/START-HERE.md`.

## Verified setup details
- Auth uses `Auth.js` credentials with seeded development users.
- Prisma connects directly to `Neon`; local `.env` is required and remains gitignored.
- `/login` is public and `/` is protected through `src/app/(private)/layout.tsx`.
- Prisma is intentionally pinned to v6 during this phase to avoid the extra datasource config required by Prisma v7.
- Keep session continuity notes in `docs/sessions/` when substantial work is completed.
