# Event Storming (DDD)

Domain event modelling — **deferred**, and scoped deliberately. It is **not** for the platformer (a shallow domain:
move, collect, quiz). It **is** for the two event-rich, multi-actor subsystems that will come:

1. **Learning telemetry** (P6) — xAPI / Caliper / LTI 1.3 are, by nature, **event streams** (Actor–Verb–Object).
   Event Storming maps *which* learning events to emit, their verbs, and when they fire, **before** we write the
   xAPI verb catalog and statement schema.
2. **Local Student Manager** — a LGPD-critical, multi-actor domain (parents, school, psychologists, physiotherapists,
   neuropsychologists) with real aggregates. Data stays **local** (self-hosted backend, likely **Nakama**).

Modelled in **Context Mapper (CML)** when P6/P9 arrive. Not started.

## Candidate aggregates / events (draft, to validate in a storming session)

- **Student** — created, profile updated, needs/accommodations set, consent granted/revoked.
- **Session** — started, activity played, paused, ended.
- **Assessment** — objective attempted, mastery reached, score recorded (→ xAPI statement).
- **ProfessionalNote** — annotation added by an authorized professional (access-controlled).
- **Consent** — guardian consent captured/updated (gates all of the above; LGPD/COPPA).

## Status

- [ ] Deferred until Phase 6/9. Kept here so the scope and the privacy-critical boundary are explicit.
