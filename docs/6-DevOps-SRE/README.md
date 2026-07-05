# 6 — DevOps / SRE

**CI/CD that exists today** is in `../2-Architecture/CI-CD.md` (GitHub Actions: typecheck + Vitest + build; Cloudflare
Pages deploys `dist/`). Nothing else here is active yet.

The **operational** artifacts (observability, runbooks, platform playbook, progressive delivery) are **deferred** to
the backend stages — they have nothing to operate while we ship a static PWA. Each activates at a stage in
`../2-Architecture/backend-cloud-roadmap.md`:

- **OpenTelemetry** (app traces/metrics) — stage 3 (containers).
- **Platform Playbook · Canary/Argo Rollouts · SRE runbooks · dashboards** — stage 4 (EKS).

> Learning **telemetry** (xAPI/Caliper/LTI) is a **separate, educational** concern (store-and-forward, privacy-first),
> not infra observability — it is scoped in `../1-Discovery/Event-Storming.md`, not here.

## Status

- Only CI/CD is live. The rest is deferred with an explicit trigger.
