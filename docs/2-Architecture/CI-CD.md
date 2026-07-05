# CI / CD

The pipeline in one page. The **source of truth is the workflow file** — `.github/workflows/ci.yml`; this doc
explains *intent* and points there, it does not restate the YAML.

## CI (on every push / PR)

Runs on GitHub Actions (Node 24, from `.node-version`):

1. **Typecheck** — `tsc --noEmit` (the code is TypeScript; types are a gate, not decoration).
2. **Tests** — `vitest run` (both projects: **node** logic + **browser**/Playwright render/DOM).
3. **Build** — `vite build` (must produce `dist/` cleanly).

A red pipeline blocks merge. Keep it fast; heavier suites (e.g. future hardware-battery runs) are separate, opt-in.

## CD (deploy)

**Cloudflare Pages**, git-connected: a push to `main` triggers CF to build and publish `dist/`. There is **no** deploy
step in `ci.yml` — CF owns delivery. The PWA service worker (vite-plugin-pwa, content-hash) handles cache-busting, so
no manual version bump is needed for clients to update.

## Release (versioning)

Not part of CI. Cutting a version is a **local, human-run** step: `release-it` (Conventional-Commits changelog +
tag). The build stamps `__BUILD__` from `git describe`. See `plano-versionamento.md`.

## Notes / TODO

- [ ] Add Node env for Avast/TLS if CI ever runs behind an intercepting proxy (see `../../CLAUDE.md` §6). GitHub-hosted
  runners are clean, so not needed today.
