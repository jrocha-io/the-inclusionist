# Kubernetes manifests — when (not yet)

**Not now.** There is no service to orchestrate. This note (kept in Architecture, as requested) records **when** K8s
manifests become worth writing, so we don't reach for them early.

## When

Only at **stage 4** of `backend-cloud-roadmap.md` — a fleet of services needing zero-downtime rollout and horizontal
scale (EKS). Stages 1–3 (single self-host / Nakama → managed DB → ECS/Fargate containers) do **not** need K8s.

## How (when we get there)

- Per-service **Deployment / Service / HPA**, packaged as a **Helm chart** (or a **Kustomize** overlay per feature/env).
- Manifests live with the service, not in `docs/`. This note points there.
- Activates the rest of the stage-4 docs: Platform Playbook, Canary/Argo Rollouts, full OpenTelemetry, SRE runbooks
  (`../6-DevOps-SRE/`).

## Status

- [ ] Deferred to stage 4. Most projects never reach it — writing the manifests early would be pure ceremony.
