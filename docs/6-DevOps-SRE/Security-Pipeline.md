# Security in the pipeline (SDD phase f)

## SAST — static analysis  ✅ adopt now (light)

For a client-only TS app the classic SAST payoff is small (no server, no secret handling yet), but the **supply
chain** is real (we pull npm deps). So adopt the light, high-value pieces now:

- **Dependabot** — dependency + security update PRs.
- **CodeQL** — GitHub-native static analysis on push/PR.
- `npm audit` in CI as a fast gate.

Full application SAST scales up **with the backend** (server code, auth, data handling). Setup tracked as a GitHub issue.

## DAST — dynamic analysis  ⏸ defer

Scans a **running** app for vulnerabilities — needs server endpoints. The static site has almost no attack surface
(see [`../2-Architecture/STRIDE.md`](../2-Architecture/STRIDE.md)). Runs in CI/CD or pre-prod **once the backend
exists**.

## Pentest  ⏸ scheduled activity (not a pipeline stage)

A point-in-time / scheduled engagement, **not** a CI stage. Trigger: the backend + **child personal data** surface
exists (LGPD/COPPA — a T3-leaning concern). Scope it against the DFD/STRIDE trust boundaries at that point.
