# 4 — Sprints (execution)

The **doing** phase. Most of it is **process**, so the rules live in `../../CONTRIBUTING.md`, not as documents here.
This folder holds only execution artifacts that are worth keeping (e.g. a notable sprint retro or decision that isn't
an ADR).

## The process (see CONTRIBUTING for the detail)

- **TDD** with **Vitest** (node + browser) — each module born with a test; ZOMBIES + Right-BICEP.
- **Conventional Commits** + **`Closes #N`** (issue link) — the light commit<->requirement trace (the heavy FEAT-###
  ID ceremony is deferred).
- **Frontend of the DOM activities** (Duolingo-style / Playground, ex-Quizizz — out-of-engine): a **real component
  set**, so it earns real component tooling:
  - **Web Components (Custom Elements)** — yes, but **light DOM, no Shadow DOM**. The footgun is Shadow DOM
    specifically (it breaks `aria-labelledby`/`aria-activedescendant`/`aria-controls` across the shadow boundary),
    **not** custom elements. Light-DOM custom elements keep ARIA intact.
  - **Atomic Design** (Brad Frost: atoms → molecules → organisms → templates → pages) — yes, as the organizing
    method for this component set (it's genuinely component-rich, unlike the thin in-game menus).
  - **Storybook (CSF)** + **Chromatic** — yes, for isolated development + visual-regression of these DOM components.
  - Activates when the DOM-activities app is built (Fase 6-ish).
- **The canvas game + thin in-game menus** are **not** targets for any of the above — no Storybook, no component
  framework; visual regression there is our **preview screenshot harness**.
- **Backlog & board:** GitHub Projects + Issues (`jrocha-io/the-inclusionist`).

## Status

- Process documented in CONTRIBUTING; this folder stays thin on purpose.
