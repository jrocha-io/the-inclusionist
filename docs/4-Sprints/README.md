# 4 — Sprints (execution)

The **doing** phase. Most of it is **process**, so the rules live in `../../CONTRIBUTING.md`, not as documents here.
This folder holds only execution artifacts that are worth keeping (e.g. a notable sprint retro or decision that isn't
an ADR).

## The process (see CONTRIBUTING for the detail)

- **TDD** with **Vitest** (node + browser) — each module born with a test; ZOMBIES + Right-BICEP.
- **Conventional Commits** + **`Closes #N`** (issue link) — the light commit<->requirement trace (the heavy FEAT-###
  ID ceremony is deferred).
- **Frontend of the DOM activities** (Duolingo-style, out-of-engine): a11y-safe **light-DOM** components (no Shadow
  DOM — it breaks ARIA references), developed in **Storybook** when that component set exists. The **canvas game** is
  not a Storybook target — its visual regression is our preview screenshot harness.
- **Backlog & board:** GitHub Projects + Issues (`jrocha-io/the-inclusionist`).

## Status

- Process documented in CONTRIBUTING; this folder stays thin on purpose.
