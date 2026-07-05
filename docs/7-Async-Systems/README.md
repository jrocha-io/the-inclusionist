# 7 — Async systems (queues, events, messaging) (SDD phase g)

Testing the **asynchronous domain**. **All deferred** — there is no broker, queue, or event stream today (client-only
PWA). This doc homes each artifact with its activation trigger so the choice isn't improvised when async work lands.

Two things will bring async in: **learning telemetry** (xAPI/Caliper as event streams — see
`../1-Discovery/Event-Storming.md`) and the **store-and-forward** LAN/offline delivery pillar.

## Artifacts & triggers

- **Message Contract Testing (Pact *message pact*)** — ⏸ when there's a broker/event stream between producer and
  consumer. Extends the request/response Pact (`../3-Sprint-Design/api/Pact.md`) to messages.
- **Idempotency (safe reprocessing)** — ⏸ **but flagged early**: the **store-and-forward telemetry** is exactly this
  problem — an offline device resends buffered events; the backend must not double-count. Design idempotency keys with
  the telemetry schema.
- **Ordering (order guarantees / violations)** — ⏸ for event streams where sequence matters (e.g. session events).
- **DLQ (dead-letter queue)** — ⏸ the failure path: where undeliverable messages go and how they're reprocessed.
- **Chaos / resilience (fault injection, e.g. Toxiproxy)** — ⏸ **mandatory at T3**; we are T2 (T3-leaning). Activates
  when a distributed backend exists to break.

## Status

- [ ] Entirely deferred to the backend + messaging/telemetry era. Homed here with triggers, not built.
