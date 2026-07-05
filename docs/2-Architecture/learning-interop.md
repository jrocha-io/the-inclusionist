# E-learning interoperability standards

The learning-domain data/API contracts (analogous to OpenAPI, but for learning). **All deferred** — they move learning
content/data between authoring tools, an LMS, and analytics stores, none of which exist yet. Homed here with a trigger
each; decision recorded in [`adr/ADR-0004-educational-documentation-subset.yaml`](adr/ADR-0004-educational-documentation-subset.yaml).

| Standard | Body | Verdict | Trigger / note |
|---|---|---|---|
| **xAPI** (Experience API + LRS) | ADL | **committed**, deferred | The telemetry format — **pillar 6** (1EdTech+xAPI) and **offline-capable** (fits store-and-forward, pillar 9). Statements = Actor–Verb–Object. Build at the telemetry milestone (`../1-Discovery/Event-Storming.md`); offline resend needs idempotency (`../7-Async-Systems/`). |
| **Caliper** | 1EdTech | deferred | Profile-constrained analytics; **xAPI preferred for offline**. Adopt only if tight LMS analytics interop is needed. The xAPI-vs-Caliper choice becomes an ADR at the telemetry milestone. |
| **LTI 1.3 / Advantage** | 1EdTech | deferred | LMS SSO launch + roster (NRPS) + grade return (AGS). At school/LMS integration. |
| **cmi5** | ADL | deferred | xAPI profile for LMS-launched content; preferred over SCORM if LMS distribution happens. |
| **SCORM** | ADL | **rejected** | Legacy LMS-playback packaging; wrong fit for a standalone accessible PWA. |
| **QTI** | 1EdTech | deferred | Assessment-item interchange; likely never (assessment is in-game). |
| **Common Cartridge** | 1EdTech | deferred | Vendor-neutral course-package export/import for LMSs. |
| **OneRoster / CASE / CLR** | 1EdTech | deferred | Rostering / standards / learner records. **CASE** could represent **BNCC** machine-readably to power the Curriculum-Map coverage — flag for later. |
| **AfA / ISO 24751** (PNP/DRD) | 1EdTech/ISO | **concept now**, schema deferred | Machine-readable match of a learner's access needs (PNP) to a resource's adaptable traits (DRD). Our accessibility settings are already a **de-facto PNP**; formalize when the Student Manager stores learner profiles. Strong fit with **pillar 1** (a11y). |

## Status

- All deferred/rejected as above. xAPI + AfA are the two committed directions; the rest activate only with an
  LMS/backend that may never come.
