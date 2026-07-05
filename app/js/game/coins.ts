// SPDX-License-Identifier: GPL-3.0-or-later
// game/coins.ts — POSICIONAMENTO dos coletáveis no mapa (Estágio 4). findCoinCandidates acha as células onde
// cabe um item (tile de ar(1)/água(3) com chão sólido logo abaixo, fora da zona de spawn); pickCoins sorteia n
// posições POR JOGADOR (Lote C: cada dono tem seu conjunto) e carimba shape/letter dos POOLS RECEBIDOS. Corte
// limpo: NÃO conhece MODE nem os dados de quiz — o game.js calcula os pools e os passa. O render (coinTexFor/
// rebuildCoins/coinSprites) e os distratores de alfabetização (malform/ferreiroDistractors) ficam fora (quiz).
import { TILE } from '../core/constants.js';
import { solidAt } from '../core/collision.js';
import { shuffle } from '../core/rng.js';
import { numPlayers } from '../core/state.js';

// mundo injetado no boot (mesma referência do game.js/colisão). Só a grade + dims p/ varrer candidatos.
let _world: number[][] = [], _W = 0, _H = 0;
export function initCoins(ctx: { world: number[][]; W: number; H: number }): void { _world = ctx.world; _W = ctx.W; _H = ctx.H; }

// Células candidatas a receber um item: ar(1)/água(3) com chão sólido em até 10 tiles abaixo (alcançável),
// exceto a zona de spawn/queda (tx≤4 & ty≥16 → evita auto-coleta ao nascer).
export function findCoinCandidates(): { tx: number; ty: number }[] {
  const cand: { tx: number; ty: number }[] = [], maxJ = 10;
  for (let ty = 0; ty < _H; ty++) for (let tx = 0; tx < _W; tx++) {
    const t = _world[ty][tx]; if (t !== 1 && t !== 3) continue;
    if (tx <= 4 && ty >= 16) continue; // zona de spawn/queda: sem moeda (evita auto-coleta)
    let below = -1;
    for (let dy = 1; dy <= maxJ && ty + dy < _H; dy++) { if (solidAt(tx, ty + dy)) { below = dy; break; } }
    if (below >= 1) cand.push({ tx, ty });
  }
  return cand;
}

export type Coin = { x: number; y: number; owner: number; taken: boolean; shape: string; letter: string };
// Sorteia n itens POR JOGADOR (posições independentes por dono). pools.shapes/letters vêm do game.js (derivados
// do MODE): 'somasub' passa as formas; 'silabas' passa as iniciais; 'ludico' passa vazio → shape/letter = ''.
export function pickCoins(n: number, pools: { shapes?: string[]; letters?: string[] } = {}): Coin[] {
  const shapes = pools.shapes ?? [], letters = pools.letters ?? [];
  const out: Coin[] = [], np = Math.max(1, numPlayers);
  for (let owner = 0; owner < np; owner++) {
    const a = shuffle(findCoinCandidates());                 // sorteio de posições independente por jogador
    const sh = shapes.length ? shuffle(shapes.slice()) : [], lt = letters.length ? shuffle(letters.slice()) : [];
    a.slice(0, Math.min(n, a.length)).forEach((p, i) => out.push({
      x: p.tx * TILE + 3, y: p.ty * TILE + 3, owner, taken: false,
      shape: sh.length ? sh[i % sh.length] : '',
      letter: lt.length ? lt[i % lt.length] : '',
    }));
  }
  return out;
}

// Coletar = marca 1 dono; some do mundo em TODAS as telas (o item tem um único dono).
export function takeCoin(cn: { taken: boolean }): void { cn.taken = true; }
