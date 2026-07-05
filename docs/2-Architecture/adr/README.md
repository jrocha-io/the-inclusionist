# Architecture Decision Records (ADR)

One file per deliberate architectural decision — **Nygard format**. An ADR is immutable once accepted: to change a
decision, write a **new** ADR that **supersedes** the old one (`Superseded by ADR-NNN` / `Supersedes ADR-MMM`), never
edit the original. This keeps refactors as an audit trail instead of a pile of new records.

- **Naming:** `ADR-NNN-short-slug.md`, NNN zero-padded, monotonic.
- **Index / log:** `../../REGISTRO-DE-DECISOES.md` is the running decision log (to migrate here as the index).
- **Big design docs that *are* a decision** (e.g. the modularization plan `../../plano-modularizacao.md`, built on
  arXiv:2409.15152) act as ADRs too — link them from the index rather than duplicating.

## Records

| ADR | Decision | Status |
|---|---|---|
| [ADR-001](ADR-001-escala-canvas-inteira.md) | Integer canvas scaling | Accepted |
