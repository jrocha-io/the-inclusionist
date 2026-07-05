# API contract — OpenAPI

**Not needed now** (client-only, no API). This records where the contract will live and what it is for.

## What it's for

When the games/activities stop bundling their content and start **fetching it from the backend**, the boundary needs
a typed contract. First real consumer: an activity asking the backend for **corpus content** — e.g. the word bank with
syllabic division, IPA transcription, description, and example sentences, filtered by discipline + education stage
(see `../data-model/DBML.md`). Later: student sessions, saves, professional notes (Student Manager).

## How

- **Spec:** **OpenAPI 3.1** in YAML, one `openapi.yaml` per service, versioned with the backend (not in `docs/` —
  this doc points there). Generate the TS client from it so games and backend share types.
- **Contract testing:** consumer-driven contracts via **Pact** — see `Pact.md` (justified because many game-clients
  consume the same API).

## Status

- [ ] Deferred until the backend serves content. Activates at stage >= 1 of `../../2-Architecture/backend-cloud-roadmap.md`.
