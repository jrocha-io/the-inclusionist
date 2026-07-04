// SPDX-License-Identifier: GPL-3.0-or-later
// Setup do project "browser" — expõe PIXI como GLOBAL, do mesmo jeito que o jogo (que carrega vendor/pixi.min.js
// v7.4.2 num <script> clássico). Os módulos de render (render/canvas, render/sprites, …) leem `PIXI` global —
// aqui apontamos para o pixi.js do npm pinado em 7.4.2 (mesma major do vendor). Ver docs/plano-testes.md.
import * as PIXI from 'pixi.js';
globalThis.PIXI = PIXI;
// Sem supressão de erros: os módulos de render são importados de forma PURA (sprites.js só carrega texturas em
// initCharacterSprites(), que os testes NÃO chamam), então não há mais rejeição de load de asset para ignorar.
