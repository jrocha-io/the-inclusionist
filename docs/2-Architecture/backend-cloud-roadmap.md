# Backend & Cloud — adoption roadmap (prospective study)

> **Status: DRAFT skeleton — research-first pending.** The stage table below is the shape; the full study (concrete
> services, cost, the exact trigger for each step, and sources) is a task to do before we commit. This doc exists so
> the artifacts we *deferred* (Terraform, Platform Playbook, OpenTelemetry, Canary/Argo) are **parked with a home and
> a trigger**, not abandoned — each activates at a stage below, not before.

## Why staged (not "K8s now")

We have no backend today and won't for a while. Standing up Kubernetes/observability/IaC now is cost with no asset to
run on it. The rule: **adopt the next infra step only when a concrete need crosses its threshold** — and record the
step as an **ADR** when we take it.

## The two-track constraint (LGPD first)

Child/personal data is the hard constraint, and it splits the picture in two:

- **Sensitive track (child PII, Student Manager, telemetry):** stays **self-hosted / on-prem / LAN** (Nakama), or at
  most a **Brazilian region** (`sa-east-1`, São Paulo) for data residency. Never third-party SaaS analytics.
- **Scale track (game delivery, public/aggregate, anonymised):** can live on managed cloud freely — this is what the
  AWS progression below is mostly about.

These may diverge: the game front-end can scale on AWS while the child-data backend stays self-hosted. The DFD
(`DFD.md`) draws the boundary; STRIDE (`STRIDE.md`) guards each crossing.

## Stages

| # | Trigger (when) | Infra | AWS services (candidate) | SDD docs that activate |
|---|---|---|---|---|
| **0** | now | static PWA on Cloudflare Pages | — (CF) | — |
| **1** | first logged-in users make sense | single self-hosted backend | **Nakama** on one VM (EC2/Lightsail) or on-prem/LAN | ADR (Nakama choice) · `docs/1-Discovery/Event-Storming.md` · `DFD.md` (first PII flow) · `STRIDE.md` (real pass) |
| **2** | data must survive / be backed up / shared across a school | managed data + storage | RDS (Postgres) · S3 · CloudFront · `sa-east-1` | **Terraform** (IaC + secrets) · C4 **Level 2** (containers) |
| **3** | one VM can't hold the load; multiple services | containers, no orchestration yet | ECS / Fargate | OpenTelemetry (app traces) · basic runbook |
| **4** | fleet + zero-downtime + multi-service ops | Kubernetes | **EKS** | **Platform Playbook** · **Canary/Argo Rollouts** · full OTel + dashboards · SRE runbooks (`6-DevOps-SRE/`) |

> Most projects never reach stage 3–4. We write the stage-4 docs **only if** we get there. Listing them here is the
> point: it tells a reviewer *where those artifacts went* and *what would bring them back*.

## To research (before committing to stage ≥1)

- [ ] Nakama self-host footprint (RAM/CPU) and whether one VM covers the first N schools.
- [ ] `sa-east-1` vs on-prem for LGPD — residency + guardian-consent implications (→ a compliance ADR).
- [ ] Cost curve per stage (rough monthly at each threshold).
- [ ] Which telemetry standard drives the schema (xAPI vs Caliper vs LTI 1.3) — this shapes stage-1 data model.
