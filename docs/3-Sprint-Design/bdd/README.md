# BDD — acceptance for educational activities (Gherkin)

Every educational activity we turn into a minigame gets a **Gherkin `.feature`** describing its **expected
pedagogical behavior** — the acceptance layer of the *curriculum* side of our two-layer model (the *engine* side uses
user stories + Vitest; rationale in `../../../CONTRIBUTING.md`).

This is the artifact we should already have had: it is what lets a **pedagogue / BNCC reviewer / auditor** — not just a
programmer — read and validate what an activity is supposed to do.

## Conventions

- **One `.feature` per activity**, named after it; lives here (or beside the activity module once activities are
  modularized).
- **Authored in pt-BR** (`# language: pt` — `Funcionalidade / Cenário / Dado / Quando / Então`), because the audience
  is Brazilian educators. This is domain content, so it stays Portuguese even though the rest of the docs are English.
- **Tie each feature to its learning objective** in `../../1-Discovery/SRS.md` (the natural id is the **BNCC code**,
  not the deferred FEAT-### ceremony).
- Scope Gherkin to **pedagogical acceptance** (what the learner does and what counts as success), **not** engine
  internals (physics, rendering — those are Vitest).
- **Executable later:** wire to **Cucumber.js** / **playwright-bdd** when it pays; until then the `.feature` is a
  readable, reviewable spec.

## Example

```gherkin
# language: pt
Funcionalidade: Ditado de palavra por sílabas
  Objetivo de aprendizagem: EF01LP02 (relacionar fonema-grafema) — ver SRS.md

  Cenário: A criança escreve a palavra ouvida separando as sílabas
    Dado que a atividade dita a palavra "casa" (sílabas "ca-sa")
    Quando a criança seleciona "ca" e depois "sa"
    Então a palavra é aceita
    E o leitor de tela anuncia "correto: casa"
```

## Status

- [ ] Backfill features for the activities already in the game; author a feature with every new activity from now on.
