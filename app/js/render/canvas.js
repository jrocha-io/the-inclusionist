// SPDX-License-Identifier: GPL-3.0-or-later
// render/canvas.js — primitivas-folha de desenho: canvas offscreen → textura PixiJS + disco pixel-art nítido.
// Base de toda a arte procedural do jogo (coin/tree/powerup/world/…). Depende só de document + PIXI globais,
// ZERO estado de jogo. NEAREST em tudo (pixel art, sem anti-aliasing). (Fase 2, subsistema render)

// Canvas offscreen do tamanho pedido (fonte de textura procedural).
export const makeCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
// Canvas → PIXI.Texture com escala NEAREST (pixel art crisp).
export const tex = (cv) => { const t = PIXI.Texture.from(cv); t.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; return t; };
// Disco com pixels INTEIROS (serrilhado nítido, sem anti-aliasing dos arcos vetoriais). edge = cor da borda (opcional).
export function pixDisc(c, cx, cy, r, col, edge) { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) { const d = Math.hypot(x - cx, y - cy); if (d <= r) { c.fillStyle = (edge && d > r - 1.05) ? edge : col; c.fillRect(x, y, 1, 1); } } }
