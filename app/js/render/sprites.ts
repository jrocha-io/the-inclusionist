// SPDX-License-Identifier: GPL-3.0-or-later
// render/sprites.ts — texturas do PERSONAGEM (spritesheets PNG do PixelLab, editados no Aseprite). Import PURO:
// NADA de I/O no import — um módulo não deve carregar 38 arquivos só por ser importado (era o smell que os testes
// denunciaram; ver docs/plano-testes.md). O contrato testável é o SPRITE_MANIFEST (dados puros: nº de quadros
// por animação); a criação das texturas é um passo EXPLÍCITO em initCharacterSprites(), chamado UMA vez no boot
// do game.js. Os TEX_* começam vazios e são preenchidos por init — importadores os leem como bindings VIVOS
// (atualizam após init). PIXI vem do npm (7.4.2), só usado em initCharacterSprites. Fonte: assets/sprites/menino/. (Fase 2.24)
import * as PIXI from 'pixi.js';

// Manifesto PURO (animação → nº de quadros): fonte única da ESTRUTURA, testável sem carregar textura nenhuma.
export const SPRITE_MANIFEST: Record<string, number> = {
  idle: 4, andar: 8, correr: 4,
  'gracinha-joinha': 2, 'gracinha-espreguicar': 2, 'gracinha-aquecer': 1,
  pulo: 2, escada: 2, voo: 1, parede: 4, teto: 4, nadar: 2, 'nadar-parado': 2,
};

// FLAVORS: idles ocasionais ("gracinhas"). seq/hold são DADOS PUROS; .tex é preenchido por initCharacterSprites().
type Flavor = { seq: number[]; hold: number; tex: PIXI.Texture[] };
export const FLAVORS: Flavor[] = [
  { seq: [0, 1, 0, 1, 0, 1], hold: 12, tex: [] }, // joínha (bounce do polegar)
  { seq: [0, 1, 1, 1, 1, 0], hold: 16, tex: [] }, // espreguiçar (sobe, segura, desce)
  { seq: [0, 0, 0], hold: 40, tex: [] },          // aquecer (segura a pose)
];

// Texturas — bindings VIVOS, VAZIOS até initCharacterSprites(). O game.js só LÊ (nunca reatribui).
export let TEX_IDLE: PIXI.Texture[] = [], TEX_WALK: PIXI.Texture[] = [], TEX_RUN: PIXI.Texture[] = [];
export let TEX_JUMP_UP: PIXI.Texture | null = null, TEX_JUMP_DOWN: PIXI.Texture | null = null, TEX_CLIMB: PIXI.Texture[] = [], TEX_FLY: PIXI.Texture | null = null;
export let TEX_CLING_WALL: PIXI.Texture[] = [], TEX_CLING_CEIL: PIXI.Texture[] = [], TEX_SWIM: PIXI.Texture[] = [], TEX_SWIMIDLE: PIXI.Texture[] = [];

const SPR = 'assets/sprites/menino/';
const pngTex = (f: string): PIXI.Texture => { const t = PIXI.Texture.from(SPR + f); t.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; return t; };
const A = (anim: string, n: number): PIXI.Texture[] => Array.from({ length: n }, (_, i) => pngTex(anim + '/' + i + '.png')); // frames de cor

let _loaded = false;
// Cria as texturas do personagem (I/O EXPLÍCITO). Idempotente. Chamado uma vez no boot do game.js; NUNCA no import.
// O alto-contraste REMAPEIA a cor no draw (tint/paleta), não recria a textura.
export function initCharacterSprites(): void {
  if (_loaded) return; _loaded = true;
  TEX_IDLE = A('idle', 4);   // RESPIRAÇÃO por frames (cabeça congelada → sem 'mastigar'; só o tronco respira)
  TEX_WALK = A('andar', 8);  // ANDAR = running-8 (postura ereta/leve) — José pediu manter estes como andar
  TEX_RUN = A('correr', 4);  // CORRER = sprint AGRESSIVA (inclinada, braços grandes)
  FLAVORS[0].tex = A('gracinha-joinha', 2);
  FLAVORS[1].tex = A('gracinha-espreguicar', 2);
  FLAVORS[2].tex = A('gracinha-aquecer', 1);
  TEX_JUMP_UP = pngTex('pulo/0.png'); TEX_JUMP_DOWN = pngTex('pulo/1.png'); // pose aérea (sobe recolhido / cai estendido)
  TEX_CLIMB = A('escada', 2); TEX_FLY = pngTex('voo/0.png');               // escada (vista de COSTAS) / voo
  TEX_CLING_WALL = A('parede', 4); TEX_CLING_CEIL = A('teto', 4);          // aranha: parede / teto (ciclos distintos)
  TEX_SWIM = A('nadar', 2); TEX_SWIMIDLE = A('nadar-parado', 2);           // nado MOVENDO / nado PARADO
}
