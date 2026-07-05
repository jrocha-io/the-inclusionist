# SRS — Software Requirements Specification (curriculum layer)

The **structured requirements** of the engine — the *curriculum layer* of our two-layer model (the engine/game
feature layer lives in `User-Stories.md`; the rationale for the split is in `../../CONTRIBUTING.md`).

Because the requirements are a **national curriculum** (BNCC: 3 early-childhood years + 9 fundamental + 3 secondary,
many disciplines), they are specified in the **domain-native form** of a learning SRS — structured, traceable, and
auditable for public-education procurement:

1. **Curriculum Map (Scope & Sequence)** — which skills/objectives at which **grade × discipline × axis**, mapped to
   **BNCC** codes. The macro structure.
2. **Learning Objectives** — one measurable objective per target: **BNCC code + observable criterion**
   (e.g. `EF01LP…` → "given a phoneme, selects the correct grapheme in ≥ 80% of attempts"). Each objective is the
   verifiable spec a minigame must satisfy (aaa-threshold).

> **Structure:** this grows into a folder as content is authored — `SRS/curriculum-map.md` +
> `SRS/learning-objectives/<discipline>-<grade>.md` (pt-BR domain content). Start with **1º ano — Português**
> (the current MVP surface) and expand grade by grade.

## Status

- [ ] Curriculum Map — 1º ano, Português (alfabetização) — *to author*
- [ ] Learning Objectives — alfabetização (grapheme/phoneme, syllables, Braille, word-building) mapped to BNCC — *to author*
- Existing pedagogical grounding to fold in: `../plano-alfabetizacao.md` (Ferreiro & Teberosky), `2-Architecture` pedagogical model.
