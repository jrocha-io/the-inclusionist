// SPDX-License-Identifier: GPL-3.0-or-later
// render/sprites.js — texturas do PERSONAGEM (spritesheets PNG do PixelLab, editados no Aseprite). Módulo-folha:
// depende só do PIXI global (vendor/pixi.min.js, carregado antes dos módulos). As texturas nascem no load (const,
// NUNCA reatribuídas); o alto-contraste REMAPEIA a cor no draw (tint/paleta), não recria a textura. Fonte:
// assets/sprites/menino/<animação>/<i>.png. FLAVORS = idles ocasionais ("gracinhas"). (Fase 2, subsistema render)
const SPR = 'assets/sprites/menino/';
const pngTex = (f) => { const t = PIXI.Texture.from(SPR + f); t.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; return t; };
const A = (anim, n) => Array.from({ length: n }, (_, i) => pngTex(anim + '/' + i + '.png')); // frames de cor

export const TEX_IDLE = A('idle', 4);   // idle = RESPIRAÇÃO por frames (cabeça congelada → sem 'mastigar'; só o tronco respira)
export const TEX_WALK = A('andar', 8);  // ANDAR = running-8 (postura ereta/leve) — José pediu manter estes como andar
export const TEX_RUN = A('correr', 4);  // CORRER = sprint AGRESSIVA (inclinada, braços grandes) — 4 quadros
// E20: idles ocasionais ("gracinhas") — parado um tempo, toca uma e volta a respirar (privadas; só FLAVORS as expõe)
const TEX_JOINHA = A('gracinha-joinha', 2), TEX_ESPREG = A('gracinha-espreguicar', 2), TEX_AQUECER = A('gracinha-aquecer', 1);
export const FLAVORS = [
  { tex: TEX_JOINHA, seq: [0, 1, 0, 1, 0, 1], hold: 12 }, // joínha (bounce do polegar)
  { tex: TEX_ESPREG, seq: [0, 1, 1, 1, 1, 0], hold: 16 }, // espreguiçar (sobe, segura, desce)
  { tex: TEX_AQUECER, seq: [0, 0, 0], hold: 40 },         // aquecer (segura a pose)
];
// E16: pulo — pose aérea estática (sobe=pernas recolhidas / cai=pernas estendidas), recortadas do jumping-1 SE
export const TEX_JUMP_UP = pngTex('pulo/0.png'), TEX_JUMP_DOWN = pngTex('pulo/1.png');
// E17: poses de estado — escada (vista de COSTAS, 2 quadros alternados), voo
export const TEX_CLIMB = A('escada', 2), TEX_FLY = pngTex('voo/0.png');
// E18f: aranha — ANDAR NA PAREDE e ANDAR NO TETO são ciclos distintos (4 quadros cada)
export const TEX_CLING_WALL = A('parede', 4), TEX_CLING_CEIL = A('teto', 4);
export const TEX_SWIM = A('nadar', 2), TEX_SWIMIDLE = A('nadar-parado', 2); // nado MOVENDO (braçada+pernas) / nado PARADO (só pernas)
