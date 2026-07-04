// SPDX-License-Identifier: GPL-3.0-or-later
// Setup do project "browser" — expõe PIXI como GLOBAL, do mesmo jeito que o jogo (que carrega vendor/pixi.min.js
// v7.4.2 num <script> clássico). Os módulos de render (render/canvas, render/sprites, …) leem `PIXI` global —
// aqui apontamos para o pixi.js do npm pinado em 7.4.2 (mesma major do vendor). Ver docs/plano-testes.md.
import * as PIXI from 'pixi.js';
globalThis.PIXI = PIXI;

// sprites.js cria ~38 texturas de PNGs em assets/ no momento do import. No runner de teste esses PNGs dão 404
// (a raiz servida é o repo, não app/), e o PIXI rejeita promessas de load que ninguém trata → "unhandled
// rejection". Os testes de render são ESTRUTURAIS (dimensões/tipos/contagens), NÃO dependem dos pixels, então
// suprimimos essas rejeições ESPERADAS (senão poluem a saída e o Vitest alerta "false positive"). Os testes em
// si são síncronos (asserts diretos), então isso não pode mascarar falha de asserção. Se um dia formos testar
// PIXELS, servir app/ como publicDir faz os assets resolverem (aí não há mais 404 e podemos remover isto).
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (e) => { e.preventDefault(); });
}
