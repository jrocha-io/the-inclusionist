# QA in CI/CD (SDD phase f)

The automated quality gates that run in the pipeline (`.github/workflows/ci.yml`). Split by "now" vs "with backend".

## a11y — axe-core  ✅ adopt now

Runs in the Vitest **browser** project (Playwright) against the DOM layer (in-game a11y shell now; the DOM
activities later). **Purpose: verify the WCAG requirements *declared* in [`../1-Discovery/NFR.md`](../1-Discovery/NFR.md)** —
without this, NFR states the WCAG target but nothing enforces it. This closes that loop.

- Scope: DOM (menus, `aria-live`, roles, contrast on DOM UI). The **canvas** render is not axe-testable — its a11y is
  the DOM shell + captions, which axe *does* cover.
- Owner: the a11y gate fails CI on a new WCAG-A/AA violation in declared scope.
- Setup tracked as a GitHub issue (Dev runs CI).

## Load / performance — k6  ⏸ defer to backend

**k6** (Grafana; preferred over Gatling for a JS/TS team — scripts in JS). **Purpose: verify the targets defined by the
SLIs/SLOs** in [`SLO.md`](SLO.md) (e.g. p99 < 200 ms under load). Deferred because there is no server to load today
(static PWA on Cloudflare). Owner when active: the perf gate fails if a run misses an SLO target.

> Client-side performance targets (boot time, FPS on target hardware, offline) are **not** load tests — they live as
> NFR thresholds and hardware batteries (`../3-Sprint-Design/Test-Plan.md`).
