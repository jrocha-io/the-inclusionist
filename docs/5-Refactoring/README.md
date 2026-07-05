# 5 — Refactoring & finalization

Deliberate architectural change is captured as a **new YADR ADR** that **supersedes** the one it replaces
(`metadata.status: "superseded by ADR-NNNN"`), never as an edit to an accepted record and never as a pile of additive
ADRs. See `../2-Architecture/adr/`.

## The principle (author's note, kept as a rule)

> "An LLM 'likes' to solve a problem by writing more, not by revising." The antidote is **not** cutting artifacts — it
> is **tiering** (only the artifacts a Tier-2 project needs) plus **supersede-don't-append**: a refactor must retire
> the decision it replaces, so the record shrinks as it corrects, instead of growing.

Applied concretely: the modularization of `game.js` (`../plano-modularizacao.md`, on arXiv:2409.15152) is this phase in
action — cohesion up, coupling down, each extraction superseding the monolith a piece at a time.

## Status

- Rule active. New refactors → a superseding ADR + updated status on the old one.
