# game-design/ — game craft layer

The game-craft artifacts adopted in **[ADR-0009](../2-Architecture/adr/ADR-0009-game-documentation-subset.yaml)** — the
"how the game plays" side, parallel to `../educational/` (the "what is learned" side). Kept **light**: 200+ minigames
means per-game docs are one-sheets, not full GDDs.

## The approach (Dev's goal)

Build the minigames as **lúdicos** (genuinely playful) first, then insert **classroom activities at strategic
points**, rewarding the child *gently* after they win the activity — the same path taken with the math/literacy
minigames so far. The artifact that names *where* a mechanic can carry a learning objective is the **LM-GM map**.

## Artifacts

- **[genre-catalog.md](genre-catalog.md)** — the 35-genre starting-point catalog (the content backlog of minigames).
- **`LM-GM-Map.md`** *(to create)* — Learning-Mechanic ↔ Game-Mechanic mapping: which minigame mechanic can carry
  which learning mechanic (ties `genre-catalog` ↔ `../educational/Learning-Objectives.md`). The insertion-point artifact.
- **[Art-Bible.md](Art-Bible.md)** ✅ — visual style guide (index of the visual system).
- **[character-animation.md](character-animation.md)** ✅ — layered character + animation spec (was `ANIMACOES-PERSONAGEM`).
- **[typography.md](typography.md)** ✅ — canonical font system, evidence-based (was `referencia-tipografica-projeto-v6`).
- **`Game-Feel.md`** *(migration target)* — juice/feel/camera. Absorbs the juice decisions (REGISTRO §8) + `../plano-audio-fase-f.md`.
- **Level design / beat charts** — per game with levels (e.g. `../plano-cenario-cidade.md` → a level-design doc);
  the beat chart is where educational-activity insertion points get marked.
- **Per-game one-sheets** — a short pitch + core loop + its learning objective, created as each minigame is built.
- **Engine (TDD)** stays in `../2-Architecture/` + `../plano-engine.md`; **map/art tooling** in `../plano-editor-mapa.md`.

## Not here (ADR-0009)

Networking (netcode/replication/determinism/lag-comp) is **deferred to the internet-MP tier** (ADR-0008); matchmaking,
MMO sharding, virtual economy, and live-ops are **rejected** (cooperative, no monetization, anti-dark-pattern).
