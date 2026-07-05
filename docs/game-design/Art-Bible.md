# Art Bible — visual system

The visual style guide (ADR-0009 "art bible"). This is the **index** of the visual system; detail lives in the linked
docs. **Much is already implemented** — the concrete decisions + commits are in `../REGISTRO-DE-DECISOES.md` §8; this
bible states the enduring rules.

## Core rule — art is data (GPL-clean)

**All art** (character, tiles, decoration) obeys **one unified palette-mother + one light direction + one outline
style**. No embedded PNG in-game: the target is **procedural art** (semantic image `(region, luminosity)` + palette
dictionary → recolor by colour-key + layers). PixelLab/Aseprite/Tiled are **design reference only**, converted by hand
to procedural. Active pipeline plans: [`plano-arte-procedural.md`](plano-arte-procedural.md),
[`plano-tiled-aseprite.md`](plano-tiled-aseprite.md).

## Character & animation

320×180 canvas, 16px tiles, **16×32 sprite** (48×48 cancelled — TDAH concern). In **profile**, facing the last
direction; **always breathing** (idle never static). **Layered** (Fitzpatrick skin + hair + clothes via colour-key +
overlays) for diversity and per-player distinction. Full spec + the animation list →
[`character-animation.md`](character-animation.md).

## Typography

The canonical font system (roster by role, evidence-based, licences) →
[`typography.md`](typography.md). a11y text-spacing thresholds are in `../1-Discovery/NFR.md`; the evidence is in
`../research/` (ESTUDO-FONTES, PESQUISA-FONTES).

## Scene & rendering

- **Four parallax layers:** sky/distant · medium trees + larger animals · near foliage (wind) + clouds + near animals ·
  game region (solid tiles + player, no parallax).
- **Tileset:** borders/corners/slopes/transitions via **autotiling**.

## Game feel

Juice (dust, collect-glow, squash&stretch, hit-stop, screenshake, tile shimmer, camera easing) — **each an independent
debug toggle**, plus a "low-performance" profile that turns all off. CRT scanlines + vignette as toggleable CSS
overlays. Dedicated doc: **`Game-Feel.md`** *(to create — absorbs REGISTRO §8 + `../1-Discovery/plano-audio-fase-f.md`)*.

## Colour & accessibility

Colour roles + high-contrast + colour-blind-safe (Okabe-Ito) are **a11y**, driven by `../1-Discovery/NFR.md` and the
studies in `../research/` (PESQUISA-ALTO-CONTRASTE, PESQUISA-DALTONIZACAO). Concrete ramps are code (palette dictionary).
