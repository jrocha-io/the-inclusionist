# Design

Design decisions that are **not** code. The actual colours are **code** — the palette dictionary (pillar
"art = data": semantic image `(region, luminosity)` + palette ramps). This doc holds only what a palette file
cannot express. Consolidates the old `../DIRETRIZES-VISUAIS-E-FISICA.md`, `../referencia-tipografica-projeto-v6.md`,
and `../ANIMACOES-PERSONAGEM.md`. No HTML5 prototype — the game itself is the hi-fi prototype.

## Sections (to fill from the source docs)

- **Typography** — the canonical font roster + preference order per condition (dyslexia, low vision, literacy).
  Source: `../referencia-tipografica-projeto-v6.md`.
- **Colour roles** — semantic roles (background/platform/hazard/player/UI-accent) and the a11y variants
  (high-contrast = a special palette; colour-blind-safe for HUD/menus/items, **not** the scenery). The concrete
  ramps live in code.
- **Physics feel** — the tuned `TUNE` values are **code** (`app/js/core/constants.ts`); here we record the *intent*
  (e.g. "jump velocities are independent, not derived from one another").
- **Layout & motion** — UI spacing scaled to the 320×180 canvas (`--ui-fs`, `--tap`), reduced-motion behavior,
  character animation set. Source: `../ANIMACOES-PERSONAGEM.md`.

## Status

- [ ] Merge the three source docs into the sections above; then archive the sources to `legacy/`.
