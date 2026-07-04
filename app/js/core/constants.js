// SPDX-License-Identifier: GPL-3.0-or-later
// Constantes puras (imutáveis) do jogo — módulo-folha, ZERO dependências (modularização Fase B).
// TUNE é objeto mutável (o painel de debug ajusta propriedades), mas NUNCA reatribuído → o import const
// funciona (mutar propriedade é ok; reatribuir é que quebraria). Ver docs/plano-modularizacao.md.

export const LOGICAL_W = 320, LOGICAL_H = 180, TILE = 16;
export const COIN_TARGET = 10;
export const TUNE = {
  jumpVel: 3.5, waterJump: 3.5, waterJumpRun: 4, waterStrokeFrames: 30,
  trampBase: 5, trampMax: 8, gravity: 0.15, hWalk: 2, hRun: 3, climbSpeed: 1.5,
  maxFall: 7, waterMaxFall: 3, hTurbo: 4.5, ultraJumpVel: 10, // E12: power-ups (valores do José)
};
export const JUMP_BASE = TUNE.jumpVel * Math.sqrt(8 / 5); // ~4.43 (altura confortável)

// E15: cadência de animação (ticks por quadro) — regulável ao vivo no painel ?debug=true. Como TUNE, é objeto
// mutável (o debug ajusta propriedades) mas NUNCA reatribuído → import const funciona. andar 6; correr 8 (~8fps,
// pedido do José); idle 20; swim 24; cling 10; escada 8; flavor ~6s.
export const ANIM = { walkHold: 6, runHold: 8, idleHold: 20, swimHold: 24, clingHold: 10, climbHold: 8, flavorDelay: 360 };

/* TILE_TYPES (fiel ao v3.1.100; subset usado no Lúdico) */
export const TILE_TYPES = {
  0:{solid:false}, 1:{solid:false}, 2:{solid:true,bounce:0.28}, 3:{solid:false,water:true,jump:true},
  4:{solid:false,ladder:true}, 5:{solid:true,bounce:1.1,tramp:true}, 6:{solid:true,bounce:0},
  7:{solid:false}, 8:{solid:false}, 9:{solid:false,hazard:true}, 10:{solid:true,gate:true},
  11:{solid:false,key:true}, 12:{solid:false}, 13:{solid:false}, 14:{solid:false},
};
export const TILE_COLOR = {
  0:'#0a0a14',1:'#241f38',2:'#6b6480',3:'#2f6fae',4:'#8a5a2b',5:'#34e29b',6:'#3a3a46',
  7:'#7fdcff',8:'#ffd23f',9:'#ff5b3a',10:'#9a8a6f',11:'#ffe06a',12:'#3a86ff',13:'#8a5cff',14:'#ff6fae',
};
