# 4 — Sprints (execution)

The **doing** phase. Most of it is **process**, so the rules live in `../../CONTRIBUTING.md`, not as documents here.
This folder holds only execution artifacts that are worth keeping (e.g. a notable sprint retro or decision that isn't
an ADR).

## The process (see CONTRIBUTING for the detail)

- **TDD** with **Vitest** (node + browser) — each module born with a test; ZOMBIES + Right-BICEP.
- **Conventional Commits** + **`Closes #N`** (issue link) — the light commit<->requirement trace (the heavy FEAT-###
  ID ceremony is deferred).
- **Frontend of the DOM activities** (Duolingo-style / Playground, ex-Quizizz — out-of-engine): architecture decided
  in **[ADR-0002](../2-Architecture/adr/ADR-0002-dom-activities-ui-light-dom-web-components.yaml)** — **light-DOM Web
  Components + Atomic Design + Storybook/CSF/Chromatic; Shadow DOM banned** (breaks ARIA). Activates when the
  DOM-activities app is built (Fase 6-ish). The **canvas game + thin in-game menus** are out of scope (no Storybook,
  no component framework; visual regression there is the preview screenshot harness).
- **Backlog & board:** GitHub Projects + Issues (`jrocha-io/the-inclusionist`).

## Status

- Process documented in CONTRIBUTING; this folder stays thin on purpose.
