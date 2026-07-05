# Data model — Migrations

**Not needed now** (no DB yet). This records **where, how, and when** we will manage schema change, so the decision
exists before the first table does.

## When

Trigger: the corpus DB (`DBML.md`) goes live — from that first table on, **every** schema change is a migration
(never a hand-edited DB).

## How

- **Tool:** **Prisma Migrate** — fits the TypeScript stack (typed client, migration history in git). If the backend
  ends up on **Nakama**, prefer Nakama's own migration mechanism for its managed tables and keep Prisma for
  app-owned tables; record the split as a YADR ADR.
- **Location:** migrations live with the backend service (a `prisma/migrations/` dir once the backend repo/module
  exists), **not** in `docs/`. This doc points there.
- **Rollback:** every migration must be reversible (a `down` / a compensating migration). Destructive changes
  (drop/rename touching child data) require a backup step first — LGPD makes data loss a compliance issue, not just a
  bug.

## Status

- [ ] Deferred until the DB exists. Decision recorded so it is not improvised later.
