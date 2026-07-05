# Security in the pipeline (SDD phase f)

## SAST — static analysis  ✅ adopt now (light)

For a client-only TS app the classic SAST payoff is small (no server, no secret handling yet), but the **supply
chain** is real (we pull npm deps). So adopt the light, high-value pieces now:

- **Dependabot** — `.github/dependabot.yml` ✅ (npm weekly + github-actions weekly; dev-tooling grouped). **Dev must
  enable** Dependabot alerts/security-updates in the repo *Settings → Security*.
- **CodeQL** — `.github/workflows/codeql.yml` ✅ (javascript-typescript, security-and-quality, push/PR + weekly).
  **Dev must enable** Code scanning in *Settings → Security* (or it just runs as an Action and uploads SARIF).
- **`npm audit`** — ✅ in `ci.yml` as a fast gate (`--omit=dev --audit-level=high`: fails on high+ in the deps that
  actually ship to the browser).

Full application SAST scales up **with the backend** (server code, auth, data handling).

## DAST — dynamic analysis  ⏸ defer

Scans a **running** app for vulnerabilities — needs server endpoints. The static site has almost no attack surface
(see [`../2-Architecture/STRIDE.md`](../2-Architecture/STRIDE.md)). Runs in CI/CD or pre-prod **once the backend
exists**.

## Pentest  ⏸ scheduled activity (not a pipeline stage)

A point-in-time / scheduled engagement, **not** a CI stage. Trigger: the backend + **child personal data** surface
exists (LGPD/COPPA — a T3-leaning concern). Scope it against the DFD/STRIDE trust boundaries at that point.
