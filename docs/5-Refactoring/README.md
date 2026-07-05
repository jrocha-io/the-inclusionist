# 5 — Refactoring & finalization

Rules for refactoring under good engineering/architecture practice (**DRY, SOLID**, high cohesion / low coupling, DI,
adapters/DAO).

## Governing source (for now, this is enough)

These principles are **already operationalized** by the modularization plan — `../plano-modularizacao.md`, grounded in
**arXiv:2409.15152** — which is the ADR for how we break `game.js` apart: cohesion up, coupling down, DI over globals,
adapters at the edges, each extraction superseding the monolith a piece at a time. Until a case isn't covered by it,
we don't add a separate "refactoring rules" doc — that plan carries them.

## How decisions are recorded

A deliberate architectural change is a **new YADR ADR** that **supersedes** the one it replaces
(`metadata.status: "superseded by ADR-NNNN"`) — never an edit to an accepted record, never a pile of additive ADRs.
ADRs are **modified during a sprint** and live in `../2-Architecture/adr/` (not in the sprints folder). See that
folder's README.

> Author's note, kept as a guardrail: *"an LLM 'likes' to solve a problem by writing more, not by revising."* The
> antidote is **tiering** (only the artifacts a Tier-2 project needs) + **supersede-don't-append**, so the record
> shrinks as it corrects instead of growing.

## Status

- Rule active. New refactors → a superseding ADR + updated status on the old one.
