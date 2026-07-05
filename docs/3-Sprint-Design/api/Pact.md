# API contract testing — Pact

**Deferred, then YES.** Consumer-driven contract testing with **Pact** is the right tool here — not because of the
user roles, but because of the **fan-out of consumers** onto a shared backend.

## Why it fits us (the fan-out)

- **Roles** (student, parent, professional — psychologist/physio/etc.) are **permissions** on the backend, not
  services. They do **not** justify Pact by themselves.
- **Consumers** do: **30+ games** + the **out-of-engine activities** (Duolingo-style / playground, ex-Quizizz style)
  + the **Student Manager** UI all consume the same backend API, each depending on a **different subset**. That is
  exactly what consumer-driven contracts are for: each consumer declares the slice it needs, and the provider's CI
  **fails** if a change would break any consumer — so one game can't be silently broken by a backend edit.

## How

- Each consumer (game/activity) publishes a **pact** (the requests+responses it relies on) to a broker.
- The backend verifies **all** pacts in CI before deploy.
- Start when there are **>= 2 consumers** of a real API — before that, a single integration test against `OpenAPI.md`
  is enough (don't pay for Pact with one consumer).

## Status

- [ ] Deferred until the backend API exists and a second consumer appears. Activates alongside `OpenAPI.md`.
