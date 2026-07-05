# Data Flow Diagram — PII / privacy

**Deferred** until any personal data exists. Today the game stores **nothing about a child on a server** — settings and
progress are `localStorage` on the device, and no identifier leaves the browser. There is no PII flow to diagram yet.

This doc exists so the boundary is explicit and gets drawn **before** the first byte of child data moves:

## When to fill this in

Trigger: the **local Student Manager** or **learning telemetry** (xAPI/Caliper/LTI) work starts (see
`../1-Discovery/Event-Storming.md`). At that point, diagram every flow that touches personal data:

- **Data at rest:** what is stored (student profile, accommodations, assessments, professional notes, consent), where
  (local self-hosted / Nakama — **not** third-party SaaS), and its retention.
- **Data in motion:** device → local backend; any export a professional triggers; any anonymised aggregate.
- **Trust boundaries:** the device, the LAN, the self-hosted backend — mark each crossing (that is where STRIDE
  applies — see `STRIDE.md`).
- **Consent gate:** guardian consent must gate every PII flow (LGPD/COPPA).

## Status

- [ ] Not started — no PII yet. Draw before the Student Manager / telemetry lands.
