# Architecture Decision Records (YADR)

One file per deliberate architectural decision, in **YADR** format — the YAML sibling of MADR
([adr/yadr](https://github.com/adr/yadr)). Pure YAML so records are **machine-readable** (filter/index by
`metadata.status`, generate the table below, lint against a schema later).

- **Format:** `templates/yadr-template-full.yaml` from the upstream repo. Keys, in order: `metadata`
  (`status`, `date`, `decision-makers`, `consulted`, `informed`) → `title` → `context-and-problem-statement` →
  `decision-drivers` → `considered-options` → `pros-and-cons-of-the-options` → `decision-outcome`
  (`chosen-option{link,justification}`, `consequences{positive,neutral,negative}`, `confirmation`) → `more-information`.
- **Naming:** `ADR-NNNN-short-slug.yaml`, 4-digit zero-padded, monotonic.
- **Immutable:** to change a decision, write a **new** ADR and set the old one's `metadata.status` to
  `"superseded by ADR-NNNN"`. Never edit an accepted decision — refactors **supersede**, they don't pile up.
- **Big design docs that *are* a decision** (e.g. the modularization plan, `../../plano-modularizacao.md`, built on
  arXiv:2409.15152) act as ADRs too — link them from the table rather than duplicating.
- **Upgrade path:** if LGPD/compliance needs an audited, CI-validated decision log, adopt **Structured MADR**
  ([smadr.dev](https://smadr.dev/)) — our YAML frontmatter is already close.

## Records

| ADR | Decision | Status |
|---|---|---|
| [ADR-0001](ADR-0001-integer-real-pixel-canvas-scale.yaml) | Lock canvas scale to integer real pixels | accepted |
| [ADR-0002](ADR-0002-dom-activities-ui-light-dom-web-components.yaml) | DOM activities UI: light-DOM Web Components + Atomic Design; no Shadow DOM | accepted |
| [ADR-0003](ADR-0003-tiered-sdd-documentation-subset.yaml) | Tier-2 lean subset of the SDD doc schema (adopt/defer/reject matrix) | accepted |
| [ADR-0004](ADR-0004-educational-documentation-subset.yaml) | Educational-software doc subset (learning artifacts + e-learning interop) | accepted |
| [ADR-0005](ADR-0005-no-login-access-teacher-activity-code.yaml) | Access: no login, teacher activity-code, icon-based non-text nav | accepted |
| [ADR-0006](ADR-0006-ethical-engagement-wellbeing.yaml) | Ethical engagement: no dark patterns, cooperative, play-based, session limit | accepted |
| [ADR-0007](ADR-0007-ai-content-human-curation.yaml) | AI content gated by human curation (human accountable) | accepted |
