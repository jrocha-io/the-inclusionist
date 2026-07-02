// SPDX-License-Identifier: GPL-3.0-or-later
// The Inclusionist v4.0.0 — port do Lúdico real sobre PixiJS.
// Mundo autêntico (CLARITY_MAP+buildWorld portados do v3.1.100), spawn real de moedas,
// física com escada/água/trampolim, animações (idle/walk/climb). Texto/UI no DOM (a11y).

'use strict';

/* ===================== constantes ===================== */
const LOGICAL_W = 320, LOGICAL_H = 180, TILE = 16;
const COIN_TARGET = 10;
const TUNE = {
  jumpVel: 3.5, waterJump: 3.5, waterJumpRun: 4, waterStrokeFrames: 30,
  trampBase: 5, trampMax: 8, gravity: 0.15, hWalk: 2, hRun: 3, climbSpeed: 1.5,
  maxFall: 7, waterMaxFall: 3, hTurbo: 4.5, ultraJumpVel: 10, // E12: power-ups (valores do José)
};
const JUMP_BASE = TUNE.jumpVel * Math.sqrt(8 / 5); // ~4.43 (altura confortável)

/* TILE_TYPES (fiel ao v3.1.100; subset usado no Lúdico) */
const TILE_TYPES = {
  0:{solid:false}, 1:{solid:false}, 2:{solid:true,bounce:0.28}, 3:{solid:false,water:true,jump:true},
  4:{solid:false,ladder:true}, 5:{solid:true,bounce:1.1,tramp:true}, 6:{solid:true,bounce:0},
  7:{solid:false}, 8:{solid:false}, 9:{solid:false,hazard:true}, 10:{solid:true,gate:true},
  11:{solid:false,key:true}, 12:{solid:false}, 13:{solid:false}, 14:{solid:false},
};
// Empatia MOTORA (global, muda a jogabilidade) — declarados cedo pois isSolidType os usa (cadeirante: trampolim vira elevador atravessável)
let oneButton=(()=>{try{return localStorage.getItem('incl_onebtn')==='1';}catch(e){return false;}})();
let wheelchair=(()=>{try{return localStorage.getItem('incl_wheelchair')==='1';}catch(e){return false;}})();
// Modo cego (A12e auditiva): SÓ as ajudas de áudio (bengala + sonar + guarda + narração), sem tela preta. Empatia cegueira liga por padrão.
let modoCego=(()=>{try{return localStorage.getItem('incl_modocego')==='1';}catch(e){return false;}})();
let caneBlockDiv=(()=>{try{return +localStorage.getItem('incl_cane_div')||1;}catch(e){return 1;}})(); // 1 = 1 batida/bloco; 2 = 1 batida/meio bloco (por DISTÂNCIA pisada)
const caneBlockPx=()=>TILE/caneBlockDiv;
const isSolidType = (t) => (wheelchair && (t===9||t===5)) ? true : !!(TILE_TYPES[t] && TILE_TYPES[t].solid); // cadeirante: lava (9) e trampolim (5) viram CHÃO sólido (o elevador para em cima, não atravessa)
const TILE_COLOR = {
  0:'#0a0a14',1:'#241f38',2:'#6b6480',3:'#2f6fae',4:'#8a5a2b',5:'#34e29b',6:'#3a3a46',
  7:'#7fdcff',8:'#ffd23f',9:'#ff5b3a',10:'#9a8a6f',11:'#ffe06a',12:'#3a86ff',13:'#8a5cff',14:'#ff6fae',
};

/* ===================== mundo (CLARITY_MAP portado) ===================== */
const CLARITY_MAP = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,6,6,6,6,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,1,1,1,1,1,2,2,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,7,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,4,2,2,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2,2,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,2,1,2],
  [2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,4,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,4,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,4,2,1,2,2,2,2,2,2,2,2,1,1,1,1,2],
  [2,1,2,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,4,2,1,2,2,2,2,2,2,2,2,1,1,1,1,2],
  [2,1,2,2,2,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,4,2,1,2,2,2,2,2,2,2,2,1,1,1,1,2],
  [2,1,2,2,2,2,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,2,1,2,2,2,2,2,2,2,2,8,1,1,1,2],
  [2,1,2,2,2,2,2,2,2,2,2,6,2,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,4,2],
  [2,1,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,2,2,2,9,9,9,2,10,10,10,10,10,10,1,1,1,1,1,1,1,11,2,2,2,2,4,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,10,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,2,2,2,2,2,2,2,2],
  [2,6,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,2,1,1,1,1,1,1,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2],
  [2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,6,6,6,2,2,2,2,2,2,6,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,2,5,5,2,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,5,5,1,1,1,1,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];
const STRUCTURAL_SOLID = new Set([2,5,6,10]);
const CONVERTIBLE_SOLID = new Set([2,6]);
const NEEDS_2H = new Set([1,3,4,7,8,10,11]);
function expandNarrowPassages(world){
  const H=world.length; if(!H) return; const W=world[0].length;
  const orig=world.map(r=>[...r]); const isAir=(t)=>NEEDS_2H.has(t);
  const walk=Array.from({length:H},()=>new Array(W).fill(false));
  for(let ty=0;ty<H-1;ty++)for(let tx=0;tx<W;tx++)
    if(isAir(orig[ty][tx])&&STRUCTURAL_SOLID.has(orig[ty+1][tx])) walk[ty][tx]=true;
  let changed=true,guard=0;
  while(changed&&guard++<W+4){ changed=false;
    for(let ty=0;ty<H;ty++)for(let tx=0;tx<W;tx++){
      if(walk[ty][tx]||!isAir(orig[ty][tx]))continue;
      if((tx>0&&walk[ty][tx-1])||(tx<W-1&&walk[ty][tx+1])){walk[ty][tx]=true;changed=true;}
    }}
  for(let ty=1;ty<H;ty++)for(let tx=0;tx<W;tx++)
    if(walk[ty][tx]&&CONVERTIBLE_SOLID.has(orig[ty-1][tx])) world[ty-1][tx]=(orig[ty][tx]===3)?3:1;
}
function buildWorld(){
  const W=Math.max(...CLARITY_MAP.map(r=>r.length)),H=CLARITY_MAP.length;
  const world=[];
  for(let cy=0;cy<H;cy++){ const src=CLARITY_MAP[cy],row=new Array(W);
    for(let cx=0;cx<W;cx++) row[cx]=src[cx]===undefined?0:src[cx]; world.push(row); }
  expandNarrowPassages(world);
  if(world[42]&&world[42][53]!==undefined) world[42][53]=1; // playability fix
  // E18: itens injetados (fiel à v3 ITEM_PLACEMENTS): 12=super-corrida, 13=ultra-pulo, 14=ventosa
  for(const [x,y,to] of [[13,8,12],[55,37,13],[13,26,14]]) if(world[y]&&world[y][x]!==undefined) world[y][x]=to;
  return world;
}
const WORLD = buildWorld();
const WORLD_W = WORLD[0].length, WORLD_H = WORLD.length;
const WORLD_PX_W = WORLD_W*TILE, WORLD_PX_H = WORLD_H*TILE;
const tileAt=(tx,ty)=>(tx<0||tx>=WORLD_W||ty<0||ty>=WORLD_H)?2:WORLD[ty][tx];
// E12: portão dinâmico — seus tiles são sólidos enquanto fechado (gateOpen=true ⇒ comporta normal)
let gateTiles=new Set(), gateOpen=true, gate=null;
// Cadeirante: sólidos SÓ-CADEIRANTE (pontes/plataformas que não existem no modo normal) — não altera CLARITY_MAP.
let wcSolid=new Set();
const solidTile=(x,y)=>{ const t=tileAt(x,y); return (wheelchair&&wcSolid.has(x+','+y)) || !!(TILE_TYPES[t]&&TILE_TYPES[t].solid); };
const solidAt=(tx,ty)=>(!gateOpen && gateTiles.has(tx+','+ty)) || (wheelchair && wcSolid.has(tx+','+ty)) || isSolidType(tileAt(tx,ty));
// Cadeirante: geometria da rampa de 1 tile. surfTop=topo caminhável; riser=o degrau que a rampa cobre
// (não é parede p/ o cadeirante: a rampa guia o Y). rampSurfaceY=altura da diagonal 45° num x do mundo.
const surfTop=(x,y)=> solidTile(x,y) && !solidTile(x,y-1);
const isWcRampRiser=(col,row)=> surfTop(col,row) && (surfTop(col-1,row+1)||surfTop(col+1,row+1));
function rampSurfaceY(cx,py){ const tcx=Math.floor(cx/TILE), fx=cx-tcx*TILE, ty=Math.floor(py/TILE);
  for(let y=ty-1;y<=ty+1;y++){ if(y<1||!surfTop(tcx,y))continue;
    if(surfTop(tcx+1,y-1)) return y*TILE-fx;       // degrau sobe p/ direita: y*TILE → (y-1)*TILE
    if(surfTop(tcx-1,y-1)) return (y-1)*TILE+fx;   // degrau sobe p/ esquerda: (y-1)*TILE → y*TILE
  } return null; }
// Itens do mapa Clarity → viram ITENS/barreira (não tiles): 7=pulo-turbo, 8=voo, 11=chave; 10=portão.
// Removemos o tile do grid (vira ar) e o item/barreira é desenhado/colidido à parte; some ao pegar/abrir.
const MAP_ITEMS=[], MAP_GATE=[];
for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){ const t=WORLD[y][x];
  if(t===7){ MAP_ITEMS.push({tx:x,ty:y,kind:'superjump'}); WORLD[y][x]=1; }  // super-pulo (máximo)
  else if(t===8){ MAP_ITEMS.push({tx:x,ty:y,kind:'fly'}); WORLD[y][x]=1; }    // voo
  else if(t===11){ MAP_ITEMS.push({tx:x,ty:y,kind:'key'}); WORLD[y][x]=1; }   // chave
  else if(t===12){ MAP_ITEMS.push({tx:x,ty:y,kind:'turbo'}); WORLD[y][x]=1; } // super-corrida
  else if(t===13){ MAP_ITEMS.push({tx:x,ty:y,kind:'ultrajump'}); WORLD[y][x]=1; } // ultra-pulo
  else if(t===14){ MAP_ITEMS.push({tx:x,ty:y,kind:'wallcling'}); WORLD[y][x]=1; } // ventosa
  else if(t===10){ MAP_GATE.push({tx:x,ty:y}); WORLD[y][x]=1; } // portão
}
// regiões secretas = componentes conexos de tiles 0 (escuridão). Acendem ao entrar.
function buildDarkRegions(){
  const seen=Array.from({length:WORLD_H},()=>new Array(WORLD_W).fill(false)),regions=[];
  for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){
    if(tileAt(x,y)!==0||seen[y][x])continue;
    const stack=[[x,y]],tiles=[]; seen[y][x]=true;
    while(stack.length){ const [cx,cy]=stack.pop(); tiles.push([cx,cy]);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=cx+dx,ny=cy+dy;
        if(nx>=0&&nx<WORLD_W&&ny>=0&&ny<WORLD_H&&!seen[ny][nx]&&tileAt(nx,ny)===0){seen[ny][nx]=true;stack.push([nx,ny]);}}}
    if(tiles.length>=2) regions.push(tiles); // ignora bolsões minúsculos
  }
  return regions;
}

/* ===================== sprite do personagem ===================== */
const PLAYER_IDLE = [
  '................','................','.....HHHHHH.....','....HHHHHHHH....',
  '....HHSSSSHH....','....HSSSSSSH....','....HSKSSKSH....','....HSSSSSSH....',
  '....HSSWWSSH....','....HSSSSSSH....','.....HSSSSH.....','......SSSS......',
  '.....RRRRRR.....','....RRRRRRRR....','...RRRRRRRRRR...','..SRRRRRRRRRRS..',
  '..SRRRRRRRRRRS..','..SRRRRRRRRRRS..','..SRRRRRRRRRRS..','...RRRRRRRRRR...',
  '...RRRRRRRRRR...','....RRRRRRRR....','....BBBBBBBB....','....BBBBBBBB....',
  '....BBB..BBB....','....BBB..BBB....','....BBB..BBB....','....BBB..BBB....',
  '....BBB..BBB....','....BBB..BBB....','...KKKK..KKKK...','...KKKK..KKKK...',
];
const PLAYER_WALK = [
  '................','................','.....HHHHHH.....','....HHHHHHHH....',
  '....HHSSSSHH....','....HSSSSSSH....','....HSKSSKSH....','....HSSSSSSH....',
  '....HSSWWSSH....','....HSSSSSSH....','.....HSSSSH.....','......SSSS......',
  '.....RRRRRR.....','....RRRRRRRR....','...RRRRRRRRRR...','..SRRRRRRRRRRS..',
  '..SRRRRRRRRRRS..','..SRRRRRRRRRRS..','..SRRRRRRRRRRS..','...RRRRRRRRRR...',
  '...RRRRRRRRRR...','....RRRRRRRR....','....BBBBBBBB....','...BBBB..BBB....',
  '..BBB....BBB....','.BBB.....BBB....','KKKK.....KKKK...','................',
  '................','................','................','................',
];
const PLAYER_CLIMB = [ // vista de costas, ALTURA CHEIA (pés na base) — corrige o "encolhimento" na escada
  '................','................','.....HHHHHH.....','....HHHHHHHH....',
  '....HHHHHHHH....','....HHHHHHHH....','....HHHHHHHH....','....HHHHHHHH....',
  '....HHHHHHHH....','....HHHHHHHH....','.....HHHHHH.....','......SSSS......',
  '.....RRRRRR.....','....RRRRRRRR....','...RRRRRRRRRR...','..SRRRRRRRRRRS..',
  '..SRRRRRRRRRRS..','..SRRRRRRRRRRS..','..SRRRRRRRRRRS..','...RRRRRRRRRR...',
  '...RRRRRRRRRR...','....RRRRRRRR....','....BBBBBBBB....','....BBBBBBBB....',
  '....BBB..BBB....','....BBB..BBB....','....BBB..BBB....','....BBB..BBB....',
  '....BBB..BBB....','....BBB..BBB....','...KKKK..KKKK...','...KKKK..KKKK...',
];
const PLAYER_HURT = [
  '................','................','.....HHHHHH.....','....HHHHHHHH....',
  '....HHSSSSHH....','....HSSSSSSH....','....HSWWWWSH....','....HSWKKWSH....',
  '....HSSSSSSH....','....HSKKKKSH....','.....HSSSSH.....','......SSSS......',
  '.....RRRRRR.....','....RRRRRRRR....','...RRRRRRRRRR...','..SRRRRRRRRRRS..',
  '..SRRRRRRRRR.S..','..SRRRRRRRR.SS..','...RRRRRRRRSS...','...RRRRRRRRRR...',
  '...RRRRRRRRRR...','....RRRRRRRR....','....BBBBBBBB....','....BBBBBBBB....',
  '....BBB..BBB....','....BBB..BBB....','....BBB..BBB....','....BBB..BBB....',
  '....BBB..BBB....','....BBB..BBB....','...KKKK..KKKK...','...KKKK..KKKK...',
];
// Paleta UNIFICADA (E15) — luz de cima-esquerda, contorno escuro. H cabelo · S pele · D pele-sombra
// · K contorno/olho · W branco · R camisa · T camisa-sombra · B calça · P calça-sombra.
const APP = { H:'#403020', S:'#c08070', D:'#9a5f50', K:'#1a1420', W:'#e8eef0', R:'#3090d0', T:'#2566a0', B:'#303050', P:'#20203a' };

/* ===================== canvas → textura ===================== */
const makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const tex=(cv)=>{const t=PIXI.Texture.from(cv);t.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST;return t;};

/* ===== Recolor PROCEDURAL por PALETA de grupo (alto contraste) =====
   Cada elemento mantém sua riqueza: a cor original é remapeada para o MATIZ mais próximo
   dentro da PALETA do seu grupo (jogador/item/plataforma/fundo), e o claro-escuro original
   é preservado como sombreado. Cada paleta é um leque de matizes numa faixa de luminância fixa
   (= a faixa de contraste do grupo). pal = array de '#rrggbb'. */
const _hex2rgb=(h)=>{h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];};
function _rgb2hsl(r,g,b){ r/=255;g/=255;b/=255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn; let h=0;
  if(d){ if(mx===r)h=((g-b)/d)%6; else if(mx===g)h=(b-r)/d+2; else h=(r-g)/d+4; h*=60; if(h<0)h+=360; }
  const l=(mx+mn)/2, s=d?d/(1-Math.abs(2*l-1)):0; return [h,s,l]; }
function _palData(pal){ if(pal.__pd)return pal.__pd; const rgb=pal.map(_hex2rgb), hsl=rgb.map(c=>_rgb2hsl(c[0],c[1],c[2]));
  let neu=0,ns=9; hsl.forEach((h,i)=>{ if(h[1]<ns){ns=h[1];neu=i;} }); return pal.__pd={rgb,hsl,neu}; }
function _pickPal(r,g,b,pd){ const hsl=_rgb2hsl(r,g,b); if(hsl[1]<0.12)return pd.neu; // quase neutro → entrada mais neutra da paleta
  let bi=0,bd=999; for(let i=0;i<pd.hsl.length;i++){ let dh=Math.abs(hsl[0]-pd.hsl[i][0]); if(dh>180)dh=360-dh; if(dh<bd){bd=dh;bi=i;} } return bi; }
function mapToPaletteInPlace(c,w,h,pal){ const pd=_palData(pal), img=c.getImageData(0,0,w,h), d=img.data;
  for(let i=0;i<d.length;i+=4){ if(d[i+3]<8)continue; const pc=pd.rgb[_pickPal(d[i],d[i+1],d[i+2],pd)];
    const sl=(0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2])/255, f=0.74+0.52*sl; // sombreado: mantém o claro-escuro original
    d[i]=Math.min(255,pc[0]*f|0); d[i+1]=Math.min(255,pc[1]*f|0); d[i+2]=Math.min(255,pc[2]*f|0); }
  c.putImageData(img,0,0); }
function gradientMapCanvas(src,pal){ const cv=makeCanvas(src.width,src.height),c=cv.getContext('2d'); c.drawImage(src,0,0); mapToPaletteInPlace(c,cv.width,cv.height,pal); return cv; }
// Mapeia uma textura PIXI (PNG, possivelmente assíncrona) → nova textura recolorida pela paleta.
function gradientMapTexture(srcTex,pal){
  const cv=makeCanvas(Math.max(1,srcTex.orig.width),Math.max(1,srcTex.orig.height)); const dst=tex(cv);
  const paint=()=>{ const s=srcTex.baseTexture.resource&&srcTex.baseTexture.resource.source; if(!s||!s.width)return;
    cv.width=s.width; cv.height=s.height; const c=cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height); c.drawImage(s,0,0); mapToPaletteInPlace(c,cv.width,cv.height,pal); dst.update(); };
  if(srcTex.baseTexture.valid) paint(); else srcTex.baseTexture.once('loaded',paint);
  return dst;
}

/* ===== Contorno ESCURO único (Normal AA · Bordas) =====
   Preserva a arte: só adiciona um contorno escuro atrás do elemento. Sem anel claro (cortava o personagem
   nos vãos). O contorno é desenhado ATRÁS e a arte por cima → só aparece nas bordas externas. */
const OUTLINE_DARK='#0a0a08'; // contorno escuro (José refará o gráfico visando 3:1 depois)
function _silhouette(src,color){ const cv=makeCanvas(src.width,src.height),c=cv.getContext('2d'); c.drawImage(src,0,0); c.globalCompositeOperation='source-in'; c.fillStyle=color; c.fillRect(0,0,cv.width,cv.height); return cv; }
function outlineCanvas(src,thick){ const cv=makeCanvas(src.width,src.height),c=cv.getContext('2d');
  const dark=_silhouette(src,OUTLINE_DARK), r=thick>=2?2:1;
  for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){ if(!dx&&!dy)continue; c.drawImage(dark,dx,dy); } // anel escuro
  c.drawImage(src,0,0); return cv; }                                                                  // arte por cima → sem corte interno
function outlineTexture(srcTex,thick){ const cv=makeCanvas(Math.max(1,srcTex.orig.width),Math.max(1,srcTex.orig.height)); const dst=tex(cv);
  const paint=()=>{ const s=srcTex.baseTexture.resource&&srcTex.baseTexture.resource.source; if(!s||!s.width)return;
    const o=outlineCanvas(s,thick); cv.width=o.width; cv.height=o.height; const c=cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height); c.drawImage(o,0,0); dst.update(); };
  if(srcTex.baseTexture.valid) paint(); else srcTex.baseTexture.once('loaded',paint);
  return dst;
}
function spriteToCanvas(art){
  const cv=makeCanvas(16,32),c=cv.getContext('2d');
  for(let y=0;y<32;y++){const row=art[y];if(!row)continue;
    for(let x=0;x<16;x++){const ch=row[x];if(ch==='.'||!ch)continue;c.fillStyle=APP[ch]||'#f0f';c.fillRect(x,y,1,1);}}
  return cv;
}
const isGroundType=(t)=>t===2||t===6; // chão/plataforma genéricos → recebem o tileset do tema
function worldCanvas(tiles){           // canvas NORMAL (tileset do tema ou TILE_COLOR + sombreamento)
  const cv=makeCanvas(WORLD_PX_W,WORLD_PX_H),c=cv.getContext('2d');
  const solidAt=(x,y)=> y>=0&&y<WORLD_H&&x>=0&&x<WORLD_W && isSolidType(WORLD[y][x]);
  for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){
    const t=WORLD[y][x];
    if(t===0||t===1) continue;        // ar/interior: transparente → o parallax aparece através da área jogável
    if(tiles && isGroundType(t)){      // tileset: superfície (topo claro) se há ar acima, senão preenchimento
      c.drawImage(solidAt(x,y-1)?tiles.fill:tiles.surface, x*TILE, y*TILE); continue;
    }
    c.fillStyle=TILE_COLOR[t]||'#202'; c.fillRect(x*TILE,y*TILE,TILE,TILE);
    if(isSolidType(t)){ c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x*TILE,y*TILE,TILE,2);
      c.fillStyle='rgba(0,0,0,.22)';c.fillRect(x*TILE,y*TILE+TILE-2,TILE,2); }
    if(t===4){ c.fillStyle='rgba(0,0,0,.4)';for(let r=2;r<TILE;r+=5)c.fillRect(x*TILE+2,y*TILE+r,TILE-4,2); } // degraus escada
    if(t===3){ c.fillStyle='rgba(255,255,255,.10)';c.fillRect(x*TILE,y*TILE+2,TILE,2); } // brilho água
  }
  return cv;
}
function worldToTexture(tiles){ return tex(worldCanvas(tiles)); }
// Normal AA · Bordas: mantém a ARTE e adiciona contorno bicolor (claro+escuro) nas bordas voltadas ao ar.
// Plataforma/chão (G2): só as bordas (onde você pisa). Escada/porta/perigo (G1/importante): contorno total.
function worldToTextureBordas(srcCanvas){
  const cv=makeCanvas(srcCanvas.width,srcCanvas.height),c=cv.getContext('2d'); c.drawImage(srcCanvas,0,0);
  const air=(x,y)=>{ const t=tileAt(x,y); return t===0||t===1; };
  const full=t=> t===4||t===10||t===9; // escada/porta/perigo: contorna o tile inteiro
  c.fillStyle='rgba(0,0,0,0.72)'; // escurece a borda (deixa ~28% da cor do elemento passar) → não é preto puro
  for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){ const t=WORLD[y][x]; if(t===0||t===1)continue;
    const X=x*TILE,Y=y*TILE, F=full(t);
    if(F||air(x,y-1)) c.fillRect(X,Y,TILE,1);          // fio escurecido 1px na borda voltada ao ar
    if(F||air(x,y+1)) c.fillRect(X,Y+TILE-1,TILE,1);
    if(F||air(x-1,y)) c.fillRect(X,Y,1,TILE);
    if(F||air(x+1,y)) c.fillRect(X+TILE-1,Y,1,TILE);
  }
  return tex(cv);
}
// Alto contraste (re-adicionado): recolore cada tile pela PALETA do grupo (gradient-map por matiz, mantém claro-escuro).
function worldToTextureHC(srcCanvas, pal){
  const cv=makeCanvas(srcCanvas.width,srcCanvas.height),c=cv.getContext('2d'); c.drawImage(srcCanvas,0,0);
  const palFor=t=> (t===4||t===10)?pal.item : t===3?pal.water : pal.plat; // escada/porta=item; água=fundo; resto=plataforma(fundo)
  for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){ const t=WORLD[y][x]; if(t===0||t===1)continue;
    const pd=_palData(palFor(t)), X=x*TILE,Y=y*TILE, img=c.getImageData(X,Y,TILE,TILE), d=img.data;
    for(let i=0;i<d.length;i+=4){ if(d[i+3]<8)continue; const pc=pd.rgb[_pickPal(d[i],d[i+1],d[i+2],pd)];
      const sl=(0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2])/255, f=0.74+0.52*sl; d[i]=Math.min(255,pc[0]*f|0);d[i+1]=Math.min(255,pc[1]*f|0);d[i+2]=Math.min(255,pc[2]*f|0); }
    c.putImageData(img,X,Y);
  }
  return tex(cv);
}
// pixel art: disco com pixels INTEIROS (serrilhado nítido, sem anti-aliasing dos arcos vetoriais)
function pixDisc(c,cx,cy,r,col,edge){ for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++){ const d=Math.hypot(x-cx,y-cy); if(d<=r){ c.fillStyle=(edge&&d>r-1.05)?edge:col; c.fillRect(x,y,1,1);} } }
function coinCanvas(){
  const cv=makeCanvas(11,11),c=cv.getContext('2d');
  pixDisc(c,5,5,5,'#ffd23f','#7a5400');           // disco dourado + contorno
  c.fillStyle='#fff3b0'; c.fillRect(3,2,2,1); c.fillRect(2,3,1,2);  // brilho (canto sup-esq)
  c.fillStyle='#e0a82a'; c.fillRect(7,7,2,1); c.fillRect(8,6,1,2);  // sombra (inf-dir)
  return cv;
}
function coinTexture(){ return tex(coinCanvas()); }
function treeCanvas(){
  const cv=makeCanvas(26,46),c=cv.getContext('2d');
  c.fillStyle='#2e2012'; c.fillRect(10,26,6,20);                 // contorno do tronco
  c.fillStyle='#5c4033'; c.fillRect(11,26,4,20);                 // tronco
  pixDisc(c,13,17,12,'#1f7a4d','#143a22');                       // copa (verde + contorno)
  pixDisc(c,8,15,7,'#2fa35f');                                   // tufos mais claros
  pixDisc(c,18,13,6,'#46b06a');
  return cv;
}
function treeTexture(){ return tex(treeCanvas()); }

/* ===================== moedas (spawn real) ===================== */
function findCoinCandidates(){
  const cand=[],maxJ=10;
  for(let ty=0;ty<WORLD_H;ty++)for(let tx=0;tx<WORLD_W;tx++){
    const t=WORLD[ty][tx]; if(t!==1&&t!==3)continue;
    if(tx<=4 && ty>=16) continue; // zona de spawn/queda: sem moeda (evita auto-coleta)
    let below=-1;
    for(let dy=1;dy<=maxJ&&ty+dy<WORLD_H;dy++){ if(solidAt(tx,ty+dy)){below=dy;break;} }
    if(below>=1) cand.push({tx,ty});
  }
  return cand;
}
// RNG semeado p/ reprodutibilidade (testes estáveis); o jogo final pode randomizar.
let _seed=20260601;
const rnd=()=>(_seed=(_seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
const randInt=(lo,hi)=>lo+Math.floor(rnd()*(hi-lo+1));
const shuffle=(arr)=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=(rnd()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
// modos de jogo
let MODE='ludico'; // 'ludico' | 'somasub' (silabas vem na E7)
const SOMASUB_SHAPES=[
  {id:'circulo',nome:'círculo'},{id:'triangulo',nome:'triângulo'},{id:'quadrado',nome:'quadrado'},
  {id:'retangulo',nome:'retângulo'},{id:'losango',nome:'losango'},{id:'paralelogramo',nome:'paralelogramo'},
  {id:'trapezio',nome:'trapézio'},{id:'pentagono',nome:'pentágono'},{id:'hexagono',nome:'hexágono'},{id:'oval',nome:'oval'},
];
const somaSubName=(id)=>{const x=SOMASUB_SHAPES.find(z=>z.id===id);return x?x.nome:id;};
// Sílabas: palavras de 2 sílabas + emoji (glifo Unicode = zero imagens binárias)
const SILABAS_WORDS=[
  {w:'gato',e:'🐱',s:['ga','to']},{w:'bola',e:'⚽',s:['bo','la']},{w:'casa',e:'🏠',s:['ca','sa']},
  {w:'pato',e:'🦆',s:['pa','to']},{w:'sapo',e:'🐸',s:['sa','po']},{w:'vaca',e:'🐄',s:['va','ca']},
  {w:'rato',e:'🐀',s:['ra','to']},{w:'lua',e:'🌙',s:['lu','a']},{w:'uva',e:'🍇',s:['u','va']},
  {w:'dado',e:'🎲',s:['da','do']},{w:'fogo',e:'🔥',s:['fo','go']},{w:'bolo',e:'🎂',s:['bo','lo']},
  {w:'ovo',e:'🥚',s:['o','vo']},{w:'gelo',e:'🧊',s:['ge','lo']},{w:'rosa',e:'🌹',s:['ro','sa']},
];
const SILABA_POOL=(()=>{const cons='bcdfgjlmnprstv'.split(''),vow='aeiou'.split(''),o=[];for(const c of cons)for(const v of vow)o.push(c+v);return o;})();
const WORD_INITIALS=[...new Set(SILABAS_WORDS.map(w=>w.w[0]))];
let letterCase='lower'; // 'lower' | 'upper' (E7: selecionável)
const disp=(s)=> letterCase==='upper'?String(s).toUpperCase():String(s).toLowerCase();
// E8: Braille (modo pessoa cega). Padrão de pontos da cela por letra (Grau 1, PT).
const BRAILLE={a:[1],b:[1,2],c:[1,4],d:[1,4,5],e:[1,5],f:[1,2,4],g:[1,2,4,5],h:[1,2,5],i:[2,4],j:[2,4,5],
  k:[1,3],l:[1,2,3],m:[1,3,4],n:[1,3,4,5],o:[1,3,5],p:[1,2,3,4],q:[1,2,3,4,5],r:[1,2,3,5],s:[2,3,4],t:[2,3,4,5],
  u:[1,3,6],v:[1,2,3,6],w:[2,4,5,6],x:[1,3,4,6],y:[1,3,4,5,6],z:[1,3,5,6]};
const NUMW={1:'um',2:'dois',3:'três',4:'quatro',5:'cinco',6:'seis'};
const brailleText=(ch)=>{const d=BRAILLE[String(ch).toLowerCase()]; return d?d.map(n=>NUMW[n]).join(' '):'';};
let blindMode=false; // modo pessoa cega: no Sílabas, dita os pontos Braille
// Lote C: cada jogador tem SEU conjunto de n itens em posições ALEATÓRIAS próprias e com a COR do dono
// (owner). Todos os itens de todos os jogadores existem no mundo; cada um coleta só os `owner===seu i`.
function pickCoins(n){
  const shapes = MODE==='somasub' ? SOMASUB_SHAPES.map(s=>s.id) : [];
  const letters = MODE==='silabas' ? WORD_INITIALS : []; // letra = inicial da palavra
  const out=[], np=Math.max(1,numPlayers);
  for(let owner=0; owner<np; owner++){
    const a=shuffle(findCoinCandidates());                 // sorteio de posições independente por jogador
    const sh = shapes.length ? shuffle(shapes.slice()) : [], lt = letters.length ? shuffle(letters.slice()) : [];
    a.slice(0,Math.min(n,a.length)).forEach((p,i)=>out.push({
      x:p.tx*TILE+3, y:p.ty*TILE+3, owner, taken:false,
      shape: sh.length ? sh[i%sh.length] : '',
      letter: lt.length ? lt[i%lt.length] : '',
    }));
  }
  return out;
}

/* ===================== estado ===================== */
const $=(s)=>document.querySelector(s);
const SPAWN_X=2*TILE, SPAWN_Y=24*TILE;
const BOX={w:10,h:30};
// E11: jogadores como array (física por jogador). P1 = players[0] (compat single-player).
function makePlayer(i){ return {i,x:SPAWN_X+i*22,y:SPAWN_Y,vx:0,vy:0,onGround:false,onLadder:false,inWater:false,
  facing:1,anim:0,walkAnim:0,jumpBuffer:0,waterStroke:0,hurtTimer:0,quiz:null,jumpEdge:false,collected:0,ctrl:null,sprite:null,
  activePower:'off',owned:[],hasKey:false,jumpChain:0,groundIdle:0,clinging:false,clingN:null,runEdge:false,swapEdge:false,specialEdge:false,airTime:99,flying:false,idleNow:false,idleTime:0,flavor:-1,flavorT:0,climbFrame:0,
  walkDir:0,leftEdge:false,rightEdge:false, viz:'normal', _tx:null, easy:false, toggleMove:false, pad:-1,
  rmWalk:false, rmBreath:false, rmFlavor:false, stepT:0, guardT:0, _swapDown:false, _swapT:0, _swapSonar:false}; } // stepT/guardT = cadência de áudio; _swap* = detecção segurar-swap p/ sonar
const POWER_MSG={superjump:'Super-pulo! O pulo fica sempre na altura máxima.',ultrajump:'Ultra-pulo! Pulos de distância gigante.',turbo:'Super-corrida! Correndo você fica bem mais rápido.',fly:'Asas! No ar, aperte Pular para começar a voar; Pular de novo encerra.',wallcling:'Escalada (aranha)! No ar, aperte Correr perto de uma parede/teto para grudar; engatinha e contorna quinas; Correr de novo solta.'};
const POWER_SHORT={off:'—',superjump:'Super-pulo',ultrajump:'Ultra-pulo',turbo:'Super-corrida',fly:'Voo',wallcling:'Escalada'};
function showPower(pl){ if(pl===players[0]){ const el=document.getElementById('hud-power'); if(el)el.textContent=(POWER_SHORT[pl.activePower]||'—')+(pl.owned&&pl.owned.length>1?' ('+pl.owned.length+')':''); } }
function jumpVel(pl,tiles){ return -TUNE.jumpVel*Math.sqrt(tiles/5)*(pl.easy?EASY.jump:1); } // Fácil: pulo ×8/7
function isBouncyGroundBelow(pl){ const ty=Math.floor((pl.y+1)/TILE),x0=Math.floor((pl.x-BOX.w/2)/TILE),x1=Math.floor((pl.x+BOX.w/2-0.01)/TILE); for(let tx=x0;tx<=x1;tx++) if(tileAt(tx,ty)===2)return true; return false; }
function touchingWall(pl){ const y0=Math.floor((pl.y-BOX.h)/TILE),y1=Math.floor((pl.y-1)/TILE),lx=Math.floor((pl.x-BOX.w/2-1)/TILE),rx=Math.floor((pl.x+BOX.w/2+1)/TILE); for(let ty=y0;ty<=y1;ty++) if(solidAt(lx,ty)||solidAt(rx,ty))return true; return false; }
// E18c: ventosa "aranha" — sólidos adjacentes à caixa em cada lado (R=direita, L=esquerda, U=teto/acima, D=chão/abaixo)
function clingSides(pl){ const l=pl.x-BOX.w/2,r=pl.x+BOX.w/2,t=pl.y-BOX.h,b=pl.y;
  const x0=Math.floor(l/TILE),x1=Math.floor((r-0.01)/TILE),y0=Math.floor(t/TILE),y1=Math.floor((b-0.01)/TILE);
  const lx=Math.floor((l-1)/TILE),rx=Math.floor((r+1)/TILE),uy=Math.floor((t-1)/TILE),dy=Math.floor((b+1)/TILE);
  let R=false,L=false,U=false,D=false;
  for(let ty=y0;ty<=y1;ty++){ if(solidAt(rx,ty))R=true; if(solidAt(lx,ty))L=true; }
  for(let tx=x0;tx<=x1;tx++){ if(solidAt(tx,uy))U=true; if(solidAt(tx,dy))D=true; }
  return {R,L,U,D}; }
function firstClingSide(pl){ const s=clingSides(pl); return s.R?'R':s.L?'L':s.U?'U':s.D?'D':null; }
// Reancora após o movimento: trata quina CÔNCAVA (bate numa face perpendicular à frente → gruda nela)
// e CONVEXA (a face atual sumiu → contorna para uma face perpendicular disponível); senão, cola na quina.
function spiderReattach(pl,preX,preY){ const s=clingSides(pl),N=pl.clingN,onWall=(N==='R'||N==='L');
  const up=pl.vy<0,dn=pl.vy>0,lf=pl.vx<0,rt=pl.vx>0;
  if(onWall){ if(up&&s.U){pl.clingN='U';pl.vy=0;return;} if(dn&&s.D){pl.clingN='D';pl.vy=0;return;} }   // CÔNCAVA (parede→teto/chão)
  else      { if(rt&&s.R){pl.clingN='R';pl.vx=0;return;} if(lf&&s.L){pl.clingN='L';pl.vx=0;return;} }   // CÔNCAVA (teto→parede)
  if(s[N]) return;                               // ainda na mesma face
  const perp = onWall ? (s.U?'U':s.D?'D':null) : (s.R?'R':s.L?'L':null); // CONVEXA: face perpendicular já adjacente
  if(perp){ pl.clingN=perp; pl.vx=0; pl.vy=0; return; }
  wrapConvex(pl,N,{up,dn,lf,rt},preX,preY);      // CONVEXA "de ponta": reposiciona contornando a quina (dar a volta)
}
// Contorna a quina convexa (ponta): a face atual acabou e não há face perpendicular adjacente.
// Acha a borda da face e reposiciona a caixa do outro lado da quina, na face perpendicular externa.
function wrapConvex(pl,N,mv,preX,preY){ const T=TILE,hw=BOX.w/2,bh=BOX.h;
  const tryland=(nN,nx,ny)=>{ const ox=pl.x,oy=pl.y,oN=pl.clingN; pl.x=nx;pl.y=ny;pl.clingN=nN;
    if(clingSides(pl)[nN]){ pl.vx=0;pl.vy=0; return true; } pl.x=ox;pl.y=oy;pl.clingN=oN; return false; };
  if(N==='U'||N==='D'){                          // estava no teto/chão andando na horizontal → desce/sobe pela face externa
    const d = mv.rt?1:mv.lf?-1:0; if(d){
      const srow = N==='U' ? Math.floor((preY-bh-1)/T) : Math.floor((preY+1)/T);
      let edge=Math.floor(preX/T),guard=0;       // acha a ÚLTIMA coluna sólida da face (a borda), mesmo já tendo passado dela
      if(solidAt(edge,srow)){ while(solidAt(edge+d,srow)&&guard++<64) edge+=d; }
      else { while(!solidAt(edge,srow)&&guard++<64) edge-=d; }
      if(solidAt(edge,srow)){
        const nN = d>0?'L':'R';                  // bloco fica do lado de onde viemos
        const nx = d>0 ? (edge+1)*T+hw+0.6 : edge*T-hw-0.6;
        const ny = N==='U' ? srow*T+bh : (srow+1)*T; // encosta a caixa ao lado da face (na altura do bloco)
        if(tryland(nN,nx,ny)) return;
      }
    }
  } else {                                       // estava na parede subindo/descendo → contorna para o topo/fundo
    const d = mv.up?-1:mv.dn?1:0; if(d){
      const scol = N==='R' ? Math.floor((pl.x+hw+1)/T) : Math.floor((pl.x-hw-1)/T);
      let edge=Math.floor((preY-1)/T),guard=0;   // acha a ÚLTIMA linha sólida da parede (a borda)
      if(solidAt(scol,edge)){ while(solidAt(scol,edge+d)&&guard++<64) edge+=d; }
      else { while(!solidAt(scol,edge)&&guard++<64) edge-=d; }
      if(solidAt(scol,edge)){
        const nN = d<0?'D':'U';                  // sobe→pousa no topo (D); desce→pendura no fundo (U)
        const nx = scol*T+T/2;
        const ny = d<0 ? edge*T-0.6 : (edge+1)*T+bh+0.6;
        if(tryland(nN,nx,ny)) return;
      }
    }
  }
  pl.x=preX; pl.y=preY; pl.vx=0; pl.vy=0;        // sem como contornar → fica colado na quina
}
let players=[makePlayer(0)]; let player=players[0];
let numPlayers=1;
let coins=pickCoins(COIN_TARGET), collected=0, ended=false;
// Itens INDIVIDUAIS por jogador (multiplayer em telas separadas): cada moeda/letra/forma é coletada
// independentemente por cada jogador. Só a CHAVE é compartilhada (ver powerups). taken = espelho do P1 (solo).
function takeCoin(cn){ cn.taken=true; } // item tem 1 dono; coletar = some do mundo (todas as telas)
// Power-ups: individuais por jogador, MENOS a CHAVE (compartilhada — vale para o time todo).
function puTaken(pu,pi){ if(pu.kind==='key') return !!pu.taken; return pu.by ? !!pu.by[pi] : !!pu.taken; }
function takePu(pu,pi){ if(pu.kind==='key'){ pu.taken=true; return; } if(!pu.by)pu.by=[]; pu.by[pi]=1; if(pi===0)pu.taken=true; }
let phase='title'; // E14: 'title' | 'playing' | 'paused' — congela o jogo fora de 'playing'

/* ===================== input ===================== */
const keys=new Set(); let jumpEdge=false, captureAction=null, captureMapRef=null, optionsOpen=false, movementOpen=false, animationOpen=false, visualOpen=false, empathyOpen=false, audioOpen=false;
// Gamepad (Lote B, B3): estado por controle. padCur[gi]=ações seguradas neste frame; joinedPads=ordem de entrada (P1=teclado, P2..=gamepads).
const padCur={}, padPrevAct={}, padPrevStart={}, joinedPads=[]; const PAD_DEAD=0.4;
const CKEY='inclusionist.kbcontrols.v3'; // esquemas de teclado por contagem de jogadores, editáveis + persistidos
// 8 ações: up,left,down,right,run(=corre/interage),jump,swap(troca poder),especial
// 4 esquemas base p/ 3–4 jogadores (E3: modos 3 e 4 têm esquemas SEPARADOS, p3 e p4, editáveis por jogador)
const KB_SCHEMES4=[
  { left:['KeyA'],right:['KeyD'],up:['KeyW'],down:['KeyS'], run:['KeyZ'],jump:['KeyX'],swap:['KeyC'],especial:['KeyV'] },
  { left:['KeyJ'],right:['KeyL'],up:['KeyI'],down:['KeyK'], run:['KeyM'],jump:['Comma'],swap:['Period'],especial:['Semicolon','Slash'] },
  { left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown'], run:['Home'],jump:['End'],swap:['PageUp'],especial:['PageDown'] },
  { left:['Numpad4'],right:['Numpad6'],up:['Numpad8'],down:['Numpad5'], run:['Numpad2'],jump:['Numpad0'],swap:['Numpad3'],especial:['NumpadDecimal'] },
];
const KB_DEFAULTS={
  // 1 jogador: WASD + setas; pulo J/Espaço; UJIK como na mão pequena do DOS. Sem Alt/AltGr/Ctrl/Shift (uso do SO; e Ctrl/Shift ficam pro modo Fácil).
  solo:{ left:['KeyA','ArrowLeft'], right:['KeyD','ArrowRight'], up:['KeyW','ArrowUp'], down:['KeyS','ArrowDown'],
         run:['KeyU'], jump:['KeyJ','Space'], swap:['KeyI'], especial:['KeyK'] },
  p2:[ { left:['KeyA'],right:['KeyD'],up:['KeyW'],down:['KeyS'], run:['KeyU'],jump:['KeyJ'],swap:['KeyI'],especial:['KeyK'] },
       { left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown'], run:['Numpad8'],jump:['Numpad5'],swap:['Numpad9'],especial:['Numpad6'] } ],
  p3: JSON.parse(JSON.stringify(KB_SCHEMES4.slice(0,3))), // modo 3 jogadores (independente do 4)
  p4: JSON.parse(JSON.stringify(KB_SCHEMES4)),            // modo 4 jogadores
};
function loadKB(){ try{ const s=JSON.parse(localStorage.getItem(CKEY)); if(s){ const d=JSON.parse(JSON.stringify(KB_DEFAULTS));
  if(s.solo)Object.assign(d.solo,s.solo);
  if(Array.isArray(s.p34)){ s.p34.forEach((m,i)=>{ if(m){ if(d.p4[i])Object.assign(d.p4[i],m); if(i<3&&d.p3[i])Object.assign(d.p3[i],m); } }); } // migra dado antigo (p34) p/ p3+p4
  ['p2','p3','p4'].forEach(g=>{ if(Array.isArray(s[g]))s[g].forEach((m,i)=>{ if(d[g][i]&&m)Object.assign(d[g][i],m); }); }); return d; } }catch(e){}
  return JSON.parse(JSON.stringify(KB_DEFAULTS)); }
let KB=loadKB();
function saveKB(){ try{localStorage.setItem(CKEY,JSON.stringify(KB));}catch(e){} }
function kbFor(i){ if(numPlayers<=1)return KB.solo; if(numPlayers<=2)return KB.p2[i]||KB.p2[0]; if(numPlayers<=3)return KB.p3[i]||KB.p3[0]; return KB.p4[i]||KB.p4[0]; } // esquema do jogador i (modo 3 e 4 separados)
let controls=KB.solo; // alias do P1 (navegação do quiz + GAME_KEYS)
let KJUMP=controls.jump, KLEFT=controls.left, KRIGHT=controls.right, KUP=controls.up, KDOWN=controls.down, KRUN=controls.run;
let GAME_KEYS=[...KJUMP,...KLEFT,...KRIGHT,...KUP,...KDOWN];
function applyControls(){ controls=KB.solo; KJUMP=controls.jump;KLEFT=controls.left;KRIGHT=controls.right;KUP=controls.up;KDOWN=controls.down;KRUN=controls.run;
  const all=[]; players.forEach((p,i)=>{ const m=kbFor(i); for(const a in m) all.push(...m[a]); }); GAME_KEYS=all.length?all:[...KJUMP,...KLEFT,...KRIGHT,...KUP,...KDOWN]; }
const PCOLOR=[0xffffff,0xff9a9a,0x8affc0,0xffe08a]; // tint distintivo por jogador (P1 = normal)
function assignControls(){ players.forEach((p,i)=>p.ctrl=kbFor(i)); }
assignControls();
// Conflito: uma tecla não pode ser de dois jogadores no MESMO modo. Retorna o índice do outro dono, ou -1.
function keyUsedByOther(code, mapRef){ for(let i=0;i<numPlayers;i++){ const m=kbFor(i); if(m===mapRef)continue; for(const a in m){ if(m[a]&&m[a].indexOf(code)>=0)return i; } } return -1; }
addEventListener('keydown',(e)=>{
  if(captureAction){ // remap: a próxima tecla vira o novo controle (do jogador selecionado)
    if(e.code==='Escape'){ captureAction=null; captureMapRef=null; if(typeof renderControls==='function')renderControls(); e.preventDefault(); return; }
    const m=captureMapRef||controls; const other=keyUsedByOther(e.code, m);
    if(other>=0){ srAlert('Essa tecla já é do Jogador '+(other+1)+'. Escolha outra, ou Esc para cancelar.'); e.preventDefault(); return; } // não associa: segue capturando
    m[captureAction]=[e.code]; saveKB(); applyControls(); assignControls();
    captureAction=null; captureMapRef=null; if(typeof renderControls==='function')renderControls(); e.preventDefault(); return;
  }
  // Diálogo aberto: só bloqueia o jogo se o elemento estiver DE FATO visível (flag preso não trava mais o teclado).
  const dlgVis=(id)=>{ const el=$('#'+id); return el && !el.hidden; };
  if(optionsOpen && dlgVis('options')){ if(e.code==='Escape')closeOptions(); return; }
  if(movementOpen && dlgVis('movement')){ if(e.code==='Escape')closeMovement(); return; }
  if(animationOpen && dlgVis('animation')){ if(e.code==='Escape')closeAnimation(); return; }
  if(visualOpen && dlgVis('visual')){ if(e.code==='Escape')closeVisual(); return; }
  if(empathyOpen && dlgVis('empathy')){ if(e.code==='Escape')closeEmpathy(); return; }
  if(audioOpen && dlgVis('audio')){ if(e.code==='Escape')closeAudio(); return; }
  if(dlgVis('touchcfg')){ if(e.code==='Escape'){ const t=$('#touchcfg'); if(t)t.hidden=true; } return; }
  // Lote B: Alt+1/2/3/4 (fileira de números) ativa dinamicamente 1..4 telas (aviso c). Alt fica livre (solo não o usa).
  if(e.altKey && !e.ctrlKey && /^Digit[1234]$/.test(e.code) && (phase==='playing'||phase==='paused') && !player.quiz){
    e.preventDefault(); activateScreens(+e.code.slice(5)); return; }
  if(!player.quiz && (e.code==='Escape'||e.code==='Enter') && (phase==='playing'||phase==='paused')){ togglePause(); e.preventDefault(); return; } // E14: Esc ou Enter central (NumpadEnter não pausa)
  if(player.quiz){ // navegação do quiz por teclado
    if(player.quiz.kind==='braille'){
      if(KUP.includes(e.code))announceBraille(); else if(KJUMP.includes(e.code))quizConfirm();
      if(GAME_KEYS.includes(e.code))e.preventDefault(); return;
    }
    if(KLEFT.includes(e.code))quizMove(-1); else if(KRIGHT.includes(e.code))quizMove(1);
    else if(KUP.includes(e.code))quizMove(-3); else if(KDOWN.includes(e.code))quizMove(3);
    else if(KJUMP.includes(e.code))quizConfirm();
    if(GAME_KEYS.includes(e.code))e.preventDefault(); return;
  }
  // Fácil (solo): atalhos de acessibilidade — Ctrl=Especial, Shift=Trocar poder (sem usar Win/Alt/AltGr)
  const easyKey = players[0].easy && numPlayers<=1 && (e.code==='ControlLeft'||e.code==='ControlRight'||e.code==='ShiftLeft'||e.code==='ShiftRight');
  const isGameKey = easyKey || GAME_KEYS.includes(e.code) || players.some(p=>p.ctrl && Object.values(p.ctrl).some(arr=>arr.includes(e.code)));
  if(isGameKey){ e.preventDefault(); hideTouchControls('teclado'); } // E13: jogar no teclado oculta os botões de toque
  if(!keys.has(e.code)){ for(const p of players){ if(!p.ctrl)continue;
    if(p.ctrl.jump.includes(e.code)) p.jumpEdge=true;
    if(p.ctrl.run.includes(e.code) && !p.easy) p.runEdge=true; // Fácil: sem correr
    if(p.ctrl.left.includes(e.code)) p.leftEdge=true;        // alternância: edge de direção
    if(p.ctrl.right.includes(e.code)) p.rightEdge=true;
    if(p.ctrl.swap&&p.ctrl.swap.includes(e.code)) p.swapEdge=true;
    if(p.ctrl.especial&&p.ctrl.especial.includes(e.code)) p.specialEdge=true; }
    if(easyKey){ if(e.code.startsWith('Control')) player.specialEdge=true; else player.swapEdge=true; } }
  if(oneButton && isGameKey){ for(const k of [...keys]) if(isGameKeyCode(k)) keys.delete(k); } // empatia: um botão de jogo por vez → solta os demais
  keys.add(e.code); });
addEventListener('keyup',(e)=>keys.delete(e.code));
addEventListener('blur',()=>keys.clear());
const anyOf=(arr)=>arr.some(k=>keys.has(k));
const held=(pl,act)=>pl.ctrl[act].some(k=>keys.has(k)) || (pl.pad>=0 && padCur[pl.pad] && !!padCur[pl.pad][act]); // teclado OU gamepad do jogador

/* ===================== a11y ===================== */
const srSay=(t)=>{const el=$('#sr-status');el.textContent='';requestAnimationFrame(()=>el.textContent=t);};
const srAlert=(t)=>{const el=$('#sr-alert');el.textContent='';requestAnimationFrame(()=>el.textContent=t);};

/* ===== E9: áudio (WebAudio) + legendas (C1) + assistência (C2) ===== */
const SFX={
  jump:{f:520,d:0.12,t:'square',cap:'🔊 Pulo'},
  coin:{f:880,d:0.14,t:'triangle',cap:'🔊 Coletou'},
  hurt:{f:120,d:0.25,t:'sawtooth',cap:'🔊 Ai! Dano'},
  win:{f:700,d:0.5,t:'triangle',cap:'🔊 Vitória!'},
  place:{f:640,d:0.08,t:'sine',cap:''},
  correct:{f:990,d:0.18,t:'triangle',cap:'🔊 Acertou!'},
  wrong:{f:180,d:0.15,t:'square',cap:'🔊 Tente de novo'},
  power:{f:760,d:0.18,t:'triangle',cap:'🔊 Power-up!'},
  key:{f:990,d:0.16,t:'sine',cap:'🔊 Chave'},
  gate:{f:300,d:0.30,t:'sawtooth',cap:'🔊 Portão abriu'},
};
let audioCtx=null, soundOn=true, captionsOn=true, volume=0.6, capTimer=null;
const anyEasy=()=>players.some(p=>p.easy); // efeitos de MUNDO do Fácil (moedas no chão) ligam se QUALQUER jogador usa Fácil
const isGameKeyCode=(c)=>GAME_KEYS.includes(c)||players.some(p=>p.ctrl&&Object.values(p.ctrl).some(a=>a.includes(c)));
// Modo Fácil (deficiência motora): gravidade ×2/3, pulo ×8/7, andar ×0.7, sem perigos, sem correr,
// hitbox de coleta +4px, moedas no chão, proteção de borda, pula-pula suave (segurar = flutuar descendo).
const EASY={grav:2/3, jump:8/7, speed:0.7, pad:4, slowFall:1.4, tramp:3.4};
// Movimento reduzido (WCAG 2.3.3 AA). 5 alvos; padrão herda prefers-reduced-motion; persistido.
// Hoje agem 'parallax' e 'walk'; 'decor/items/particles' ficam prontos e ligam quando a Cidade animar.
const RM_KEYS=['parallax','decor','items','particles']; // animações de CENA (globais)
const RM_CHAR=[ {k:'walk',prop:'rmWalk',lbl:'Personagem em movimento (andar, escalar, nadar, pular)'},
  {k:'breath',prop:'rmBreath',lbl:'Respiração (parado)'}, {k:'flavor',prop:'rmFlavor',lbl:'Gracinhas (animações de descanso)'} ]; // animações do PERSONAGEM (por jogador)
const RM_DEFAULT=!!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const rm=(()=>{ try{ const s=JSON.parse(localStorage.getItem('inclusionist.reducedmotion.v1')); if(s&&typeof s==='object'){ const o={}; RM_KEYS.forEach(k=>o[k]=!!s[k]); return o; } }catch(e){}
  const o={}; RM_KEYS.forEach(k=>o[k]=RM_DEFAULT); return o; })();
function saveRM(){ try{ localStorage.setItem('inclusionist.reducedmotion.v1',JSON.stringify(rm)); }catch(e){} }
// Movimento por alternância (1 dedo): tocar a direção trava a marcha; segurar acelera; pulo não interrompe. Persistido.
function loadPlayerA11y(p,i){ try{ const v=localStorage.getItem('incl_viz_p'+i); if(v&&VIZ_BY_KEY[v])p.viz=v;
  p.audioSink=localStorage.getItem('incl_sink_p'+i)||null; // saída de áudio própria do jogador (setSinkId)
  p.easy=localStorage.getItem('incl_easy_p'+i)==='1'; p.toggleMove=localStorage.getItem('incl_togglemove_p'+i)==='1';
  p.rmWalk=localStorage.getItem('incl_rmWalk_p'+i)==='1'; p.rmBreath=localStorage.getItem('incl_rmBreath_p'+i)==='1'; p.rmFlavor=localStorage.getItem('incl_rmFlavor_p'+i)==='1';
  if(i===0){ const ov=localStorage.getItem('incl_viz'); if(ov&&VIZ_BY_KEY[ov]&&localStorage.getItem('incl_viz_p0')==null)p.viz=ov; // migra chaves antigas
    if(localStorage.getItem('inclusionist.togglemove')==='1'&&localStorage.getItem('incl_togglemove_p0')==null)p.toggleMove=true; } }catch(e){} }
function setToggleMove(i,on){ const p=players[i]; if(!p)return; p.toggleMove=on; try{localStorage.setItem('incl_togglemove_p'+i,on?'1':'0');}catch(e){} if(!on)p.walkDir=0;
  srSay((numPlayers>1?'Jogador '+(i+1)+': ':'')+'Movimento por alternância '+(on?'ligado: toque a direção para andar sem segurar; toque de novo para parar; segure para ir mais rápido. O pulo não interrompe a caminhada.':'desligado.')); }
function showCaption(txt){ const el=$('#caption'); if(!el||!txt)return; el.textContent=txt; el.classList.add('show'); clearTimeout(capTimer); capTimer=setTimeout(()=>{el.classList.remove('show'); el.textContent='';},1300); }
function sfx(name){
  const c=SFX[name]; if(!c)return;
  if(captionsOn && c.cap) showCaption(c.cap);   // legenda (visual + aria-live via role=status)
  if(!soundOn || volume<=0) return;
  try{
    if(!audioCtx){ const AC=window.AudioContext||window.webkitAudioContext; if(AC)audioCtx=new AC(); }
    if(!audioCtx) return; if(audioCtx.state==='suspended') audioCtx.resume();
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.type=c.t; o.frequency.value=c.f; g.gain.value=0.0001; o.connect(g).connect(catNode('earcons')||audioOut()||audioCtx.destination);
    const t=audioCtx.currentTime;
    g.gain.exponentialRampToValueAtTime(Math.max(0.02,0.25*volume), t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t+c.d);
    o.start(t); o.stop(t+c.d+0.02);
  }catch(e){}
}
// ===== Vitória: jingle 8-bit ascendente + fogos de artifício (assobio subindo → estouro/crepitar) =====
function ensureAC(){ if(!audioCtx){ const AC=window.AudioContext||window.webkitAudioContext; if(AC)audioCtx=new AC(); } if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume(); return audioCtx; }
// Modo empatia — perda auditiva: passa-baixas (perda de agudos) + EXPANSÃO DESCENDENTE (frames fracos abafados → dificulta a fala).
// Todos os sons passam por um nó mestre; a cadeia é religada quando o modo liga/desliga.
let hearingLoss=false, _masterGain=null, _hlChain=null;
function audioOut(){ const ac=ensureAC(); if(!ac)return null; if(!_masterGain){ _masterGain=ac.createGain(); wireMaster(); } return _masterGain; }
function buildHearingChain(ac){ const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1400; lp.Q.value=0.7; // agudos primeiro
  const sp=ac.createScriptProcessor(512,1,1); const TH=0.06, RED=0.12;   // energia do frame < limiar → ×0.12 (contrário de aparelho auditivo)
  sp.onaudioprocess=(e)=>{ const inp=e.inputBuffer.getChannelData(0), out=e.outputBuffer.getChannelData(0); let s=0; for(let i=0;i<inp.length;i++)s+=inp[i]*inp[i]; const g=Math.sqrt(s/inp.length)<TH?RED:1; for(let i=0;i<inp.length;i++)out[i]=inp[i]*g; };
  lp.connect(sp); sp.connect(ac.destination); return {input:lp}; }
function wireMaster(){ const ac=audioCtx; if(!ac||!_masterGain)return; try{_masterGain.disconnect();}catch(e){}
  if(hearingLoss){ if(!_hlChain)_hlChain=buildHearingChain(ac); _masterGain.connect(_hlChain.input); } else _masterGain.connect(ac.destination); }
function setHearingLoss(on){ hearingLoss=on; try{localStorage.setItem('incl_hearingloss',on?'1':'0');}catch(e){} if(audioCtx){ audioOut(); wireMaster(); }
  srSay('Simulação de perda auditiva '+(on?'ligada: sons fracos ficam abafados e os agudos são cortados; falas ficam difíceis de entender.':'desligada.')); }
// ===== F1: barramento de áudio por CATEGORIA (cada uma: liga/desliga + volume). Pendura no nó mestre. =====
const AUDIO_CATS=[
  {k:'music',   lbl:'Música'}, {k:'ambient', lbl:'Sons ambiente (água, rua, trânsito, folhas, chuva)'},
  {k:'interact',lbl:'Efeitos de interação (passos, portas, escada)'}, {k:'earcons', lbl:'Earcons (pulo, moeda, dano…)'},
  {k:'other',   lbl:'Outros efeitos'}, {k:'tts', lbl:'Narração (TTS)'}, {k:'sonar', lbl:'Sonar'},
  {k:'guard',   lbl:'Guarda de beirada'}, {k:'guide', lbl:'Pista / guia auditivo'},
];
const audioCat={}; AUDIO_CATS.forEach(c=>{ let on=true,vol=0.8; try{ const s=localStorage.getItem('incl_audiocat_'+c.k); if(s){ const o=JSON.parse(s); on=!!o.on; vol=+o.vol; } }catch(e){} audioCat[c.k]={on,vol}; });
const _catNodes={};
function catNode(cat){ const ac=ensureAC(); if(!ac)return null; const out=audioOut(); if(!_catNodes[cat]){ const g=ac.createGain(); g.gain.value=audioCat[cat].on?audioCat[cat].vol:0; g.connect(out); _catNodes[cat]=g; } return _catNodes[cat]; }
function setCatGain(cat){ const g=_catNodes[cat]; if(g&&audioCtx)g.gain.setTargetAtTime(audioCat[cat].on?audioCat[cat].vol:0, audioCtx.currentTime, 0.02); try{localStorage.setItem('incl_audiocat_'+cat,JSON.stringify(audioCat[cat]));}catch(e){} }
// ===== F2: efeitos de interação com o ambiente (passos por superfície, portas, escada) — ruído filtrado sintetizado =====
let _noiseBuf=null, _footCount=0;
function noiseBuffer(ac){ if(ac._noiseBuf&&ac._noiseBuf.length===((ac.sampleRate*0.2)|0))return ac._noiseBuf; const n=(ac.sampleRate*0.2)|0,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0); for(let i=0;i<n;i++)d[i]=Math.random()*2-1; return ac._noiseBuf=b; } // cache por-contexto (suporta AudioContext por jogador)
// ÁUDIO POR DISPOSITIVO (por jogador): um AudioContext por jogador, roteado com setSinkId ao dispositivo escolhido.
// Só p/ as PISTAS por jogador (bengala/sonar/guarda/guia/nado). Sem dispositivo próprio → usa o contexto global.
function playerCtx(pl){ if(!pl || !pl.audioSink) return null;
  try{ if(!pl._ac){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return null; pl._ac=new AC(); pl._acOut=pl._ac.createGain(); pl._acOut.connect(pl._ac.destination); if(pl._ac.setSinkId)pl._ac.setSinkId(pl.audioSink).catch(()=>{}); }
    if(pl._ac.state==='suspended')pl._ac.resume(); return {ac:pl._ac, out:pl._acOut}; }catch(e){ return null; } }
// timbre por material: filtro + frequência + duração + volume (grama macia, piso seco, pedra brilhante, areia abafada, madeira grave, ferro metálico)
const FOOT={ grama:{f:'highpass',hz:2000,d:0.09,v:0.10}, piso:{f:'bandpass',hz:1200,d:0.06,v:0.15}, pedra:{f:'highpass',hz:1600,d:0.05,v:0.19},
  areia:{f:'lowpass',hz:650,d:0.13,v:0.10}, madeira:{f:'bandpass',hz:480,d:0.08,v:0.15}, ferro:{f:'bandpass',hz:2600,d:0.12,v:0.16}, parede:{f:'highpass',hz:3200,d:0.10,v:0.08},
  terra:{f:'lowpass',hz:520,d:0.11,v:0.12}, agua:{f:'lowpass',hz:330,d:0.15,v:0.13} }; // bengala (cego): terra abafada, água molhada
function noiseHit(mat,pan,pc){ if(!soundOn||volume<=0)return; const ac=pc?pc.ac:ensureAC(); if(!ac)return; const f=FOOT[mat]||FOOT.piso; try{
  const src=ac.createBufferSource(); src.buffer=noiseBuffer(ac); const bq=ac.createBiquadFilter(); bq.type=f.f; bq.frequency.value=f.hz; bq.Q.value=1.2;
  const g=ac.createGain(),t=ac.currentTime; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(0.02,f.v*volume),t+0.006); g.gain.exponentialRampToValueAtTime(0.0001,t+f.d);
  let node=g; if(pan!=null&&ac.createStereoPanner){ const p=ac.createStereoPanner(); p.pan.value=Math.max(-1,Math.min(1,pan)); g.connect(p); node=p; } // F3 usará o pan; F2 passa pan=0
  src.connect(bq).connect(g); node.connect(pc?pc.out:(catNode('interact')||audioOut()||ac.destination)); src.start(t); src.stop(t+f.d+0.03); _footCount++; // pc = dispositivo do jogador
}catch(e){} }
// material sob os pés (cenário Cidade = concreto → 'piso'; futuros cenários mapeiam grama/areia/pedra)
function surfaceUnder(pl){ const t=tileAt(Math.floor(pl.x/TILE),Math.floor((pl.y+1)/TILE)); if(t!==2&&t!==6&&t!==5)return null; return CENARIO==='cidade'?'piso':'pedra'; }
// BENGALA (modo cego / amaurose): bate À FRENTE e o som diz o material adiante (ou vazio).
const SURF_MAT={ cidade:'piso', campo:'grama', floresta:'grama', cemiterio:'terra', espaco:'pedra', classico:'pedra' }; // chão por tema (piso = cimento)
const caneOn=(pl)=>{ const m=VIZ_BY_KEY[pl.viz]; return modoCego || !!(m&&(m.kind==='blind'||m.kind==='lowvision')); }; // cego (branca), baixa visão (verde) ou modo cego (branca)
const caneColor=(pl)=>{ const m=VIZ_BY_KEY[pl.viz]; return (m&&m.kind==='lowvision') ? 0x35d06a : 0xf2f2f2; }; // baixa visão = VERDE; cegueira/modo cego = BRANCA
function caneProbe(pl){ const dir=pl.facing<0?-1:1;
  const ax=Math.floor((pl.x+dir*(BOX.w/2+TILE*0.6))/TILE), footTy=Math.floor((pl.y+1)/TILE);
  if(tileAt(ax,footTy)===3||tileAt(ax,footTy-1)===3) return 'agua';        // água à frente
  let gty=-1; for(let ty=footTy; ty<=footTy+1; ty++){ if(solidAt(ax,ty)){ gty=ty; break; } } // chão à frente (pé ou 1 abaixo = degrau/rampa)
  if(gty<0) return 'vazio';                                                 // sem chão → fosso
  if(tileAt(ax,gty)===4) return 'madeira';                                  // escada
  return SURF_MAT[CENARIO]||'pedra';
}
let _caneCount=0;
function caneTap(pl){ const mat=caneProbe(pl), dir=pl.facing<0?-1:1, pan=dir*0.5, pc=playerCtx(pl); _caneCount++;
  if(mat==='vazio'){ tonePan(150,0.18,'guard',pan,0.16,'sine',pc); return; } // vazio = tom grave oco (nada à frente)
  noiseHit(mat,pan,pc);                                                      // batida no material adiante (no dispositivo do jogador)
}
// NADO CEGO: guia por contato com as bordas (azulejo das paredes, chão) e superfície (cordas flutuantes).
let _waterNavCount=0;
function waterNav(pl){ const dir=pl.facing<0?-1:1, tx=Math.floor(pl.x/TILE), tyF=Math.floor((pl.y-1)/TILE), tyH=Math.floor((pl.y-BOX.h)/TILE);
  const wallAhead = solidAt(tx+dir,tyF)||solidAt(tx+dir,tyH);               // parede lateral (azulejo)
  const floorBelow = solidAt(tx,tyF+1);                                     // chão (fundo)
  const openAbove = tileAt(tx,tyH-1)!==3 && !solidAt(tx,tyH-1);             // acima da cabeça é ar → dá p/ subir/sair
  const moving=(dir!==0)||held(pl,'up')||held(pl,'down'), pc=playerCtx(pl);
  pl.wnT=(pl.wnT||0)+1; if(pl.wnT<18)return; let played=true;
  if(openAbove && wallAhead) noiseHit('parede', dir*0.5, pc);               // superfície + parede = batida (fim da corda)
  else if(openAbove && moving) tonePan(560,0.09,'guide', dir*0.4, 0.12,'sine', pc); // corda/superfície livre: "dá p/ subir aqui"
  else if(wallAhead && dir!==0) noiseHit('parede', dir*0.5, pc);           // parede submersa (azulejo) à frente
  else if(floorBelow && held(pl,'down')) noiseHit('areia', 0, pc);        // fundo (chão)
  else played=false;
  if(played){ pl.wnT=0; _waterNavCount++; } else pl.wnT=17; }              // sem contato = SEM som (pronto p/ tocar ao encostar)
function doorSound(mat){ if(!soundOn||volume<=0)return; const ac=ensureAC(); if(!ac)return; try{ // porta: rangido (madeira) ou clangor (ferro) + baque
  const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime; o.type=mat==='ferro'?'square':'sawtooth'; o.frequency.setValueAtTime(mat==='ferro'?520:200,t); o.frequency.exponentialRampToValueAtTime(mat==='ferro'?300:110,t+0.3);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.14*volume,t+0.03); g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);
  o.connect(g).connect(catNode('interact')||audioOut()||ac.destination); o.start(t); o.stop(t+0.4); noiseHit(mat==='ferro'?'ferro':'madeira'); }catch(e){} }
// ===== F3: espacialização (pan pela direção, tom pela distância) + sonar + guarda de beirada =====
function panFor(wx,pl){ return Math.max(-1,Math.min(1,(wx-pl.x)/(LOGICAL_W*0.55))); } // esquerda −1 … direita +1
function tonePan(freq,dur,cat,pan,vol,type,pc){ if(!soundOn||volume<=0)return; const ac=pc?pc.ac:ensureAC(); if(!ac)return; try{
  const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime; o.type=type||'sine'; o.frequency.value=freq;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(0.02,(vol||0.2)*volume),t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  let node=g; if(pan!=null&&ac.createStereoPanner){ const p=ac.createStereoPanner(); p.pan.value=Math.max(-1,Math.min(1,pan)); g.connect(p); node=p; }
  o.connect(g); node.connect(pc?pc.out:(catNode(cat)||audioOut()||ac.destination)); o.start(t); o.stop(t+dur+0.02); }catch(e){} } // pc = dispositivo do jogador
function needsAudioCues(pl){ if(modoCego)return true; const m=VIZ_BY_KEY[pl.viz]; return !!(m&&(m.kind==='blind'||m.kind==='lowvision')); } // guarda/guia só quando a visão está comprometida ou no modo cego
let _sonarCount=0;
function sonar(pl){ _sonarCount++; let best=null,bd=1e9; for(const cn of coins){ if(cn.taken||cn.owner!==pl.i)continue; const d=Math.hypot(cn.x-pl.x,cn.y-pl.y); if(d<bd){bd=d;best=cn;} }
  const pc=playerCtx(pl); if(!best){ tonePan(300,0.2,'sonar',0,0.2,'sine',pc); srSay('Nenhuma moeda por perto.'); return; }
  const pan=panFor(best.x,pl), near=Math.max(0,1-bd/(12*TILE)); tonePan(380+740*near,0.16,'sonar',pan,0.26,'sine',pc); // mais perto = mais agudo (dispositivo do jogador)
  const lado=best.x<pl.x-4?'à esquerda':best.x>pl.x+4?'à direita':'à frente', dist=bd<4*TILE?'bem perto':bd<9*TILE?'perto':'longe';
  const msg=(numPlayers>1?'Jogador '+(pl.i+1)+': ':'')+'Sonar: moeda '+lado+', '+dist+'.'; srSay(msg); narrate(msg); }
// ===== F4: camadas de AMBIENTE (loops sintetizados) + PISTA/GUIA auditivo (beacon em laço) =====
let _ambient=null, _rainLevel=0, _weatherT=0, _guideCount=0;
function buildAmbient(ac){ const cat=catNode('ambient'); if(!cat)return null;
  const n=(ac.sampleRate*2)|0, buf=ac.createBuffer(1,n,ac.sampleRate), d=buf.getChannelData(0); let last=0; for(let i=0;i<n;i++){ const w=Math.random()*2-1; last=(last+0.02*w)/1.02; d[i]=last*3.2; } // ruído rosa em loop
  const mk=(type,freq,q,vol)=>{ const s=ac.createBufferSource(); s.buffer=buf; s.loop=true; const f=ac.createBiquadFilter(); f.type=type; f.frequency.value=freq; if(q)f.Q.value=q; const g=ac.createGain(); g.gain.value=vol; s.connect(f).connect(g).connect(cat); try{s.start();}catch(e){} return g; };
  return { hum:mk('lowpass',480,0,0.055), wind:mk('highpass',3200,0,0.028), water:mk('bandpass',820,1.4,0), rain:mk('highpass',1700,0,0) }; } // trânsito/rumor · folhas/vento · água(proximidade) · chuva(ciclo)
function updateAmbient(){ if(!audioCtx||!soundOn||!audioCat.ambient.on){ return; } if(!_ambient){ _ambient=buildAmbient(audioCtx); if(!_ambient)return; }
  const ac=audioCtx, pl=players[0], px=Math.floor(pl.x/TILE), py=Math.floor(pl.y/TILE);
  let nearWater=0; for(let dx=-3;dx<=3;dx++)for(let dy=-3;dy<=3;dy++){ if(tileAt(px+dx,py+dy)===3) nearWater=Math.max(nearWater,1-Math.hypot(dx,dy)/4.2); }
  _ambient.water.gain.setTargetAtTime(0.15*nearWater, ac.currentTime, 0.3);
  _ambient.rain.gain.setTargetAtTime(0.09*_rainLevel, ac.currentTime, 0.5); } // chuva: gain segue _rainLevel (calculado em updateWeather); 0 = silêncio total
// ===== CLIMA: chuva de verdade (visual + trovão), o áudio segue o visual =====
let weatherLayer=null, _rainDrops=null, _flash=0, _thunderCD=240; // weatherLayer criado após o `app` existir
function thunder(inten){ if(!soundOn||volume<=0)return; const ac=ensureAC(); if(!ac)return; try{ // rumor grave sintetizado (intensidade variável)
  const src=ac.createBufferSource(); src.buffer=noiseBuffer(ac); src.loop=true; const bq=ac.createBiquadFilter(); bq.type='lowpass'; bq.frequency.value=140+Math.random()*220; bq.Q.value=0.7;
  const g=ac.createGain(),t=ac.currentTime, dur=0.7+inten*1.4; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(Math.min(0.55,0.2*inten)*volume,t+0.04); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  src.connect(bq).connect(g).connect(catNode('ambient')||audioOut()||ac.destination); src.start(t); src.stop(t+dur+0.1); }catch(e){} }
function updateWeather(){ _weatherT++; const cyc=_weatherT%3600; _rainLevel = cyc<600 ? (cyc<300?cyc/300:(600-cyc)/300) : 0; // ~10s de chuva a cada 60s (visual SEMPRE calculado)
  if(_rainLevel>0.45){ _thunderCD--; if(_thunderCD<=0){ _thunderCD=200+Math.floor(rnd()*420); const inten=0.35+rnd()*0.65; _flash=Math.max(_flash,inten); thunder(inten); } } // clarão + trovão em intensidades variadas
  if(_flash>0) _flash=Math.max(0,_flash-0.05); }
function drawWeather(){ if(!weatherLayer)return; const g=weatherLayer; if(weatherLayer.parent===app.stage) app.stage.setChildIndex(weatherLayer, app.stage.children.length-1); g.clear();
  const W=app.screen.width, H=app.screen.height; if(_rainLevel<=0 && _flash<=0) return;
  if(_rainLevel>0){ g.beginFill(0x0a0e1a, _rainLevel*0.34); g.drawRect(0,0,W,H); g.endFill();                         // céu mais escuro
    if(!_rainDrops){ _rainDrops=[]; for(let i=0;i<110;i++)_rainDrops.push({x:rnd()*W,y:rnd()*H,len:6+rnd()*9,spd:8+rnd()*7}); }
    const mv=(phase==='playing'); g.lineStyle(1,0xaebfe0,0.5*_rainLevel); for(const d of _rainDrops){ if(mv){ d.y+=d.spd; d.x-=d.spd*0.35; if(d.y>H){ d.y=-d.len; d.x=rnd()*W; } if(d.x<0)d.x+=W; } g.moveTo(d.x,d.y); g.lineTo(d.x-2,d.y+d.len); } g.lineStyle(0); } // GAG: gotas congelam na pausa
  if(_flash>0){ g.beginFill(0xe4ecff, _flash*0.55); g.drawRect(0,0,W,H); g.endFill(); } }                            // clarão do relâmpago
function updateGuide(){ if(!audioCtx||!soundOn||!audioCat.guide.on)return;
  for(const pl of players){ if(!needsAudioCues(pl))continue; pl.guideT=(pl.guideT||0)+1; if(pl.guideT<48)continue; pl.guideT=0; // pinga ~0,8s
    let best=null,bd=1e9; for(const cn of coins){ if(cn.taken||cn.owner!==pl.i)continue; const d=Math.hypot(cn.x-pl.x,cn.y-pl.y); if(d<bd){bd=d;best=cn;} }
    if(best){ const pan=panFor(best.x,pl), near=Math.max(0,1-bd/(14*TILE)); tonePan(300+380*near,0.12,'guide',pan,0.11,'triangle',playerCtx(pl)); _guideCount++; } } }
// ===== F5 (plumbing): camada de narração TTS. Motor NEURAL (Piper pt-BR) é carregado LAZY (ver docs/plano-tts-fase-f5.md).
// Decisões: pt-BR=Piper (só ele tem pt-BR); lazy-fetch de CDN + cache; voz Faber agora, seleção de voz depois.
let ttsEngine=null, ttsLoading=false, _narrateCount=0, ttsLang='pt-BR', ttsVoice='faber';
let ttsEngineSel=(()=>{try{return localStorage.getItem('incl_tts_engine')||'webspeech';}catch(e){return 'webspeech';}})(); // webspeech | piper | kokoro | kitten | espeak
let _ttsVoiceObj=null; // voz do Web Speech selecionada
function speakWebSpeech(text){ try{ const ss=window.speechSynthesis; if(!ss)return false; ss.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='pt-BR'; if(_ttsVoiceObj)u.voice=_ttsVoiceObj; u.rate=1; u.volume=Math.min(1,volume*1.4); ss.speak(u); return true; }catch(e){ return false; } }
const TTS_SOURCES={ 'pt-BR':{ engine:'piper', voice:'pt_BR-faber-medium',
  // URL configurável (D1: CDN agora; espelhar no LAN depois). Modelo VITS + fonemizador espeak-ng (só fonemas).
  model:'https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx' } };
function loadTTS(){ if(ttsEngine||ttsLoading)return; ttsLoading=true; // PONTO DE INTEGRAÇÃO F5: vendorizar piper-tts-web + onnxruntime-web + espeak WASM,
  // baixar TTS_SOURCES[ttsLang].model (lazy, cache), instanciar e setar ttsEngine={speak(text){ ...PCM→AudioBuffer→catNode('tts')... }}.
  // Deixado como no-op verificável até a sessão de integração+hardware (a voz real precisa das libs + teste no Positivo).
}
function ttsSpeak(text){ if(ttsEngineSel!=='webspeech'){ if(ttsEngine&&ttsEngine.speak){ try{ ttsEngine.speak(text); }catch(e){} return true; } loadTTS(); } // motor neural (baixando) → cai no fallback
  return speakWebSpeech(text); } // fallback imediato: Web Speech (nativo pt-BR); enquanto o neural não carrega

function narrate(text){ if(!soundOn||!audioCat.tts.on||!text)return; _narrateCount++; ttsSpeak(text); } // gated pelo toggle 'Narração (TTS)' do mixer, independente das legendas
function tone(freq,dur,type,when,vol){ if(!soundOn||volume<=0)return; try{ const ac=ensureAC(); if(!ac)return; const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+(when||0);
  o.type=type||'square'; o.frequency.setValueAtTime(freq,t); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(0.02,(vol||0.22)*volume),t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g).connect(catNode('earcons')||audioOut()||ac.destination); o.start(t); o.stop(t+dur+0.02); }catch(e){} }
function firework(when){ if(!soundOn||volume<=0)return; try{ const ac=ensureAC(); if(!ac)return; const t=ac.currentTime+(when||0);
  const o=ac.createOscillator(),g=ac.createGain(); o.type='sine'; o.frequency.setValueAtTime(300,t); o.frequency.exponentialRampToValueAtTime(1200,t+0.35); // assobio subindo
  const out=catNode('earcons')||audioOut()||ac.destination;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.12*volume,t+0.05); g.gain.exponentialRampToValueAtTime(0.0001,t+0.36); o.connect(g).connect(out); o.start(t); o.stop(t+0.4);
  [0,0.04,0.09,0.15,0.22].forEach((dt,i)=>{ const po=ac.createOscillator(),pg=ac.createGain(),tt=t+0.36+dt; po.type='square'; po.frequency.setValueAtTime(180+((i*131)%520),tt); // estouro/crepitar
    pg.gain.setValueAtTime(0.18*volume,tt); pg.gain.exponentialRampToValueAtTime(0.0001,tt+0.09); po.connect(pg).connect(out); po.start(tt); po.stop(tt+0.11); }); }catch(e){} }
function playVictory(){ [[523,0],[659,0.12],[784,0.24],[1047,0.36],[988,0.52],[1319,0.64]].forEach(([f,w])=>tone(f,0.16,'square',w,0.22)); [0.2,0.8,1.35,1.9].forEach(w=>firework(w)); }

/* ===================== Pixi ===================== */
PIXI.settings.ROUND_PIXELS=true;
const app=new PIXI.Application({width:LOGICAL_W,height:LOGICAL_H,backgroundColor:0x05070f,
  antialias:false,resolution:1,powerPreference:'low-power'});
$('#pixi-mount').appendChild(app.view);
app.view.setAttribute('aria-hidden','true');
const camera=new PIXI.Container(); app.stage.addChild(camera);
weatherLayer=new PIXI.Graphics(); app.stage.addChild(weatherLayer); // CLIMA (chuva/clarão) em tela-espaço, mantido no topo em draw

/* ===== Parallax: 3 camadas de FUNDO atrás do tileset (Camada 1 = tileset+personagem).
   Camada 4 (fator 0.10) é a mais distante e "quase não se mexe" — receberá a maior
   imagem possível do PixelLab. Vivem DENTRO do camera (contra-posicionadas p/ ficarem
   fixas na tela) para também aparecerem nas render-textures do multiplayer.
   tilePosition faz o scroll fracionado → ilusão de profundidade. */
const PARALLAX=[
  {key:'sky',  factor:0.10, fy:0}, // Camada 4 — mais distante (céu/horizonte), maior imagem
  {key:'far',  factor:0.28, fy:0}, // Camada 3
  {key:'near', factor:0.52, fy:0}, // Camada 2 — mais próxima do tileset (fy=0: parallax horizontal clássico; textura=altura do viewport → sem repetição vertical)
];
function parallaxPlaceholder(i){ // provisório: gradiente + silhuetas p/ enxergar o movimento (trocado pela arte do PixelLab)
  const w=320,h=LOGICAL_H,cv=makeCanvas(w,h),c=cv.getContext('2d');
  const pal=[['#0a1024','#1b2350'],['#13284a','#22406e'],['#1d3a52','#356a86']][i];
  const g=c.createLinearGradient(0,0,0,h); g.addColorStop(0,pal[0]); g.addColorStop(1,pal[1]); c.fillStyle=g; c.fillRect(0,0,w,h);
  c.fillStyle=pal[1];
  for(let x=0;x<w;x+=44+i*14){ const hh=24+((x*7+i*29)%(46+i*22)); c.fillRect(x,h-hh,30+i*6,hh); }
  c.fillStyle='rgba(255,255,255,.18)'; for(let k=0;k<8;k++){ c.fillRect((k*53+i*17)%w,(k*23+i*11)%(h-40),2,2); } // marcadores
  return tex(cv);
}
const parallaxLayers=PARALLAX.map((p,i)=>{
  const ts=new PIXI.TilingSprite(parallaxPlaceholder(i),LOGICAL_W,LOGICAL_H);
  camera.addChildAt(ts,i); // i=0 (sky) fica no fundo; depois far, near; tileset entra por cima
  return ts;
});
const parallaxTexNormal=parallaxLayers.map(ts=>ts.texture); // texturas normais (recoloridas p/ o fundo no alto contraste)
const _parallaxTexHC={}; // cache: {mode: [tex,tex,tex]}
function updateParallax(camX,camY){
  for(let i=0;i<parallaxLayers.length;i++){ const ts=parallaxLayers[i],p=PARALLAX[i];
    ts.x=camX; ts.y=camY;                                  // anula o camera → fixa na tela
    if(rm.parallax){ ts.tilePosition.set(0,0); continue; } // movimento reduzido: fundo vira papel de parede estático
    ts.tilePosition.x=-camX*p.factor; ts.tilePosition.y=-camY*p.fy;
  }
}
/* Tema de cenário: troca as 3 texturas de parallax por assets/cenarios/<tema>/c{4,3,2}.png.
   Sem tema definido → placeholders. Persiste em localStorage. */
let CENARIO=null;
function loadTileImages(theme){ return new Promise(res=>{
  const fill=new Image(), surf=new Image(); let n=0, fail=false;
  const done=()=>{ if(fail)return; if(++n===2) res({fill,surface:surf}); };
  fill.onload=done; surf.onload=done; fill.onerror=surf.onerror=()=>{fail=true;res(null);};
  fill.src='assets/cenarios/'+theme+'/tile_fill.png'; surf.src='assets/cenarios/'+theme+'/tile_surface.png';
}); }
function setCenario(theme){
  CENARIO=theme;
  parallaxLayers.forEach((ts,i)=>{ const n=[4,3,2][i];
    const t=PIXI.Texture.from('assets/cenarios/'+theme+'/c'+n+'.png');
    t.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST; parallaxTexNormal[i]=t; if(vizMode==='normal') ts.texture=t; });
  loadTileImages(theme).then(tiles=>{ worldCanvasNormal=worldCanvas(tiles); worldTexNormal=tex(worldCanvasNormal); _worldTexHC={}; // reconstrói o chão com o tileset do tema; invalida cache HC
    if(vizReady) reapplyVizAll(); else if(worldSprite) worldSprite.texture=worldTexNormal; });
  if(vizReady) reapplyVizAll(); // reaplica o cenário recolorido (só após o init montar tudo)
  try{ localStorage.setItem('incl_cenario',theme); }catch(e){}
}
// ===== Paletas do José: 13 tiers de luminância (cada um é um leque de matizes). Verificadas: gap 5≈3:1, 7≈4.5:1, 9≈7:1. =====
const PALETTES={
  1:['#D3FD01','#FFEC84','#9EFFC9','#E4F3C3','#FFE8C6','#BEF7F0','#FFE5E5','#E7EDE8'],
  2:['#B1E203','#EDD102','#9AE282','#FEC870','#00E5FF','#D4D684','#85E4BC','#E4C6FF','#FEC6A3','#9ED9FF','#FEC1C1','#C3D6B7','#DFD0B2','#A8DBD8','#C6D0EB','#DACDCD'],
  3:['#9CD402','#E4BF29','#FFB351','#8FD382','#03D8D4','#01D3FD','#D6B2FF','#FEA8DA','#FFB089','#C5C67A','#8EC6FF','#FEADAD','#97CDB6','#D9BE9A','#A4C8D0','#BFC4AF','#B9C1D9','#D1BCBC'],
  4:['#8CBA01','#E980FE','#FE8D42','#14B4FF','#FB8888','#C5A65C','#02BDC3','#9CA6E7','#9AB096','#B3A7A7'],
  5:['#51AA02','#C370FF','#FF6060','#D97F39','#6591FF','#01A4C4','#5BA38A','#A19667','#A69090'],
  6:['#FD01BA','#AD60FF','#FE3838','#D06C24','#739300','#008ED6','#A18443','#00969E','#689070','#7D84AF','#AE7979','#898784'],
  7:['#9E3DFF','#EC0303','#5B61FF','#DD039F','#E5006B','#AB4FB9','#0072E5','#558201','#CB4848','#AA651C','#7B7903','#BA5A34','#7F67BB','#4F814F','#8F7132','#007EAC','#9A648F','#00828E','#75794D','#9D6666','#966C54','#627697','#4C7F71','#81745F','#79708E','#5D7983','#6F786D','#827171'],
  8:['#4D50FE','#B900C6','#D80303','#8942DB','#C90294','#0064E0','#D10068','#B24A00','#2A7A00','#BC3D3D','#695EBA','#667000','#8A54A4','#7E6900','#0D7B41','#965E25','#A2563D','#A54F6D','#0070A8','#58733A','#01786C','#885C81','#6F6391','#00748E','#7F673D','#945B5B','#497358','#86634F','#556C8B','#6D6C4A','#497273','#7A6666','#716A5F','#6A697B','#5E6C73','#626E62'],
  9:['#6500FF','#0049DB','#980BB1','#B70000','#B20053','#6349A0','#506000','#8D3976','#8B4521','#6C5703','#943C3C','#005D93','#3C623B','#046275','#665170','#5B5A3D','#6D543A','#4E5973','#705151','#445E58','#5B5856'],
  10:['#5B00CC','#003BBC','#990000','#7A178B','#90025F','#4F3C85','#7D2F2F','#424F01','#5A4700','#753918','#034D7C','#33502F','#564260','#025163','#5B452E','#4B4A33','#604242','#414961','#3B4D49','#4B4848'],
  11:['#002CA8','#5D158D','#820101','#7D0141','#1C4700','#3C366C','#5C2C59','#414000','#623012','#612D2D','#16452F','#02425E','#4B3B24','#034549','#383D4C','#4A3A3A','#3A3F30'],
  12:['#000A9E','#48165E','#650000','#600038','#153502','#492502','#202B55','#352E07','#452525','#033244','#13332B','#2E2D2C'],
  13:['#4B0000','#001F4C','#22201A'],
};
// Modos de cor. normal=arte crua · bordas=contorno escurecido (WCAG AA, preserva a arte) ·
// sim-*=SIMULAÇÃO de daltonismo via filtro SVG na <canvas> (auditoria + demo; preserva a arte, transformação linear na GPU).
// Grupos por importância: G1 (personagem/itens/NPC especial), G2 (plataforma/escada/porta/secundário), G3 (fundo).
// kind: normal | bordas | hc (recolor por paleta de grupo) | filter (SVG na canvas) | lowvision | blind
const VIZ_MODES=[
  {key:'normal', kind:'normal', nome:'Cores normais',        desc:'Arte original do jogo.'},
  {key:'bordas', kind:'bordas', nome:'Contorno (Normal AA)', desc:'Contorno escuro em personagem, itens e bordas das plataformas (WCAG AA).'},
  {key:'hc1', kind:'hc', bg:10, player:1, item:3, nome:'Alto contraste: claro',   desc:'Fundo escuro colorido; personagem e itens em paletas separadas (provisório, p/ alguns níveis de baixa visão).'},
  {key:'hc2', kind:'hc', bg:11, player:2, item:4, nome:'Alto contraste: médio',   desc:'Fundo mais escuro; personagem e itens recoloridos por matiz.'},
  {key:'hc3', kind:'hc', bg:12, player:3, item:5, nome:'Alto contraste: escuro',  desc:'Fundo bem escuro; máximo destaque do personagem.'},
  {key:'hc4', kind:'hc', bg:13, player:4, item:6, nome:'Alto contraste: noturno', desc:'Fundo quase preto colorido.'},
  {key:'sim-deuter', kind:'filter', filter:'url(#cvd-deuter)', nome:'Simular Deuteranopia', desc:'Como vê quem não enxerga o verde (mais comum).'},
  {key:'sim-protan', kind:'filter', filter:'url(#cvd-protan)', nome:'Simular Protanopia',   desc:'Como vê quem não enxerga o vermelho.'},
  {key:'sim-tritan', kind:'filter', filter:'url(#cvd-tritan)', nome:'Simular Tritanopia',   desc:'Como vê quem não enxerga o azul.'},
  {key:'fix-protan', kind:'filter', filter:'url(#cvd-fix-protan)', nome:'Correção protanopia', desc:'Daltonização: realça a distinção vermelho/verde para quem tem protanopia.'},
  {key:'fix-deuter', kind:'filter', filter:'url(#cvd-fix-deuter)', nome:'Correção deuteranopia', desc:'Daltonização: realça a distinção vermelho/verde para quem tem deuteranopia.'},
  {key:'fix-tritan', kind:'filter', filter:'url(#cvd-fix-tritan)', nome:'Correção tritanopia', desc:'Daltonização: realça a distinção azul/amarelo para quem tem tritanopia.'},
  {key:'lv-blur',     kind:'lowvision', lv:'blur',     nome:'Baixa visão: desfoque',         desc:'Miopia severa / astigmatismo. (bolinha verde; toque 2× p/ sair)'},
  {key:'lv-haze',     kind:'lowvision', lv:'haze',     nome:'Baixa visão: névoa',            desc:'Catarata — película esbranquiçada, baixo contraste.'},
  {key:'lv-tunnel',   kind:'lowvision', lv:'tunnel',   nome:'Baixa visão: visão de túnel',   desc:'Glaucoma — só o centro é visível.'},
  {key:'lv-macular',  kind:'lowvision', lv:'macular',  nome:'Baixa visão: mancha central',   desc:'Degeneração macular — borrão no centro.'},
  {key:'lv-diabetic', kind:'lowvision', lv:'diabetic', nome:'Baixa visão: manchas dispersas',desc:'Retinopatia diabética — manchas espalhadas.'},
  {key:'blind', kind:'blind', nome:'Simular cegueira total', desc:'Tela preta — jogue como uma pessoa cega (resposta tátil/sonora). (bolinha branca; toque 2× p/ sair)'},
];
const VIZ_BY_KEY=Object.fromEntries(VIZ_MODES.map(m=>[m.key,m]));
const VIZ_FILTER={'sim-deuter':'url(#cvd-deuter)','sim-protan':'url(#cvd-protan)','sim-tritan':'url(#cvd-tritan)',
  'fix-protan':'url(#cvd-fix-protan)','fix-deuter':'url(#cvd-fix-deuter)','fix-tritan':'url(#cvd-fix-tritan)',
  'lv-blur':'blur(2.4px)', 'lv-haze':'contrast(.58) brightness(1.14) blur(.6px)', 'lv-tunnel':'blur(.5px)', 'lv-macular':'', 'lv-diabetic':'blur(.8px)', 'blind':'brightness(0)'};
const VIZ_CYCLE=VIZ_MODES.map(m=>m.key);
function hcPal(m){ return { player:PALETTES[m.player], item:PALETTES[m.item], plat:PALETTES[m.bg], bg:PALETTES[m.bg], water:PALETTES[m.bg] }; }
let vizMode=(()=>{ try{ const v=localStorage.getItem('incl_viz'); if(VIZ_CYCLE.includes(v))return v; }catch(e){}
  return (window.matchMedia && matchMedia('(prefers-contrast: more)').matches) ? 'bordas' : 'normal'; })();
let hcMode = vizMode!=='normal'; // mantém o nome p/ o resto do código (agora = "modo de cor acessível ativo")
let vizReady=false; // só após todas as dependências de applyViz existirem (evita TDZ no init via setCenario)
let worldCanvasNormal=worldCanvas();
let worldTexNormal=tex(worldCanvasNormal);
const worldSprite=new PIXI.Sprite(worldTexNormal); camera.addChild(worldSprite);
try{ setCenario(localStorage.getItem('incl_cenario')||'cidade'); }catch(e){ setCenario('cidade'); }
const coinCanvasNormal=coinCanvas();
const coinTex=tex(coinCanvasNormal);
// caches de modos acessíveis (preguiçosos), invalidados ao trocar de cenário (worldCanvasNormal muda)
let _worldTexHC={}, _coinTexHC={}, _lastSharedViz=null; // _lastSharedViz: cache do modo aplicado (otimização do render MP)
function worldTexFor(mode){ const m=VIZ_BY_KEY[mode]; if(!m||(m.kind!=='bordas'&&m.kind!=='hc'))return worldTexNormal;
  if(!_worldTexHC[mode]) _worldTexHC[mode] = m.kind==='hc' ? worldToTextureHC(worldCanvasNormal,hcPal(m)) : worldToTextureBordas(worldCanvasNormal); return _worldTexHC[mode]; }
function coinTexFor(mode){ const m=VIZ_BY_KEY[mode]; if(!m||(m.kind!=='bordas'&&m.kind!=='hc'))return coinTex;
  if(!_coinTexHC[mode]) _coinTexHC[mode] = m.kind==='hc' ? tex(gradientMapCanvas(coinCanvasNormal,hcPal(m).item)) : tex(outlineCanvas(coinCanvasNormal,1)); return _coinTexHC[mode]; }
function shapeTexture(id){
  const cv=makeCanvas(16,16),c=cv.getContext('2d');
  c.fillStyle='#7fdcff';c.strokeStyle='#04121a';c.lineWidth=1.5;
  const cx=8,cy=8,r=6; c.beginPath();
  switch(id){
    case 'circulo': c.arc(cx,cy,r,0,7); break;
    case 'oval': c.ellipse(cx,cy,r,r*0.66,0,0,7); break;
    case 'quadrado': c.rect(cx-r,cy-r,2*r,2*r); break;
    case 'retangulo': c.rect(cx-r,cy-r*0.6,2*r,r*1.2); break;
    case 'triangulo': c.moveTo(cx,cy-r);c.lineTo(cx+r,cy+r);c.lineTo(cx-r,cy+r);c.closePath(); break;
    case 'losango': c.moveTo(cx,cy-r);c.lineTo(cx+r,cy);c.lineTo(cx,cy+r);c.lineTo(cx-r,cy);c.closePath(); break;
    case 'paralelogramo': c.moveTo(cx-r+3,cy-r*0.6);c.lineTo(cx+r,cy-r*0.6);c.lineTo(cx+r-3,cy+r*0.6);c.lineTo(cx-r,cy+r*0.6);c.closePath(); break;
    case 'trapezio': c.moveTo(cx-r*0.5,cy-r*0.7);c.lineTo(cx+r*0.5,cy-r*0.7);c.lineTo(cx+r,cy+r*0.7);c.lineTo(cx-r,cy+r*0.7);c.closePath(); break;
    case 'pentagono': for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5;c[i?'lineTo':'moveTo'](cx+r*Math.cos(a),cy+r*Math.sin(a));}c.closePath(); break;
    case 'hexagono': for(let i=0;i<6;i++){const a=i*2*Math.PI/6;c[i?'lineTo':'moveTo'](cx+r*Math.cos(a),cy+r*Math.sin(a));}c.closePath(); break;
    default: c.arc(cx,cy,r,0,7);
  }
  c.fill();c.stroke(); return tex(cv);
}
const SHAPE_TEX={}; SOMASUB_SHAPES.forEach(s=>SHAPE_TEX[s.id]=shapeTexture(s.id));
function letterTexture(ch){
  const cv=makeCanvas(16,16),c=cv.getContext('2d');
  c.fillStyle='#ffd23f';c.strokeStyle='#1a1400';c.lineWidth=1.5;
  c.beginPath(); if(c.roundRect)c.roundRect(2,2,12,12,3); else c.rect(2,2,12,12); c.fill(); c.stroke();
  c.fillStyle='#1a1400';c.font='bold 11px system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.fillText(disp(ch),8,9); return tex(cv);
}
const coinContainer=new PIXI.Container(); camera.addChild(coinContainer);
let coinSprites=[];
// Fácil: rebaixa cada moeda até o chão logo abaixo (scan ≤10 tiles); guarda y0 p/ reverter ao desligar.
function positionEasyCoins(){
  coins.forEach(cn=>{ if(cn.y0==null)cn.y0=cn.y;
    if(anyEasy()||wheelchair){ const tx=Math.floor((cn.x+5)/TILE); let fy=null;
      for(let ty=Math.floor(cn.y0/TILE);ty<WORLD_H && ty<Math.floor(cn.y0/TILE)+10;ty++){ if(solidAt(tx,ty)){ fy=ty*TILE; break; } }
      cn.y = fy!=null ? fy-11 : cn.y0; } // moeda (10px) repousa com 1px de folga
    else cn.y=cn.y0; });
}
function rebuildCoins(){
  positionEasyCoins();
  coinContainer.removeChildren().forEach(s=>s.destroy());
  coinSprites=coins.map(cn=>{
    let s;
    if(MODE==='somasub'&&cn.shape){ s=new PIXI.Sprite(SHAPE_TEX[cn.shape]); s.width=15;s.height=15; s.x=cn.x-3;s.y=cn.y-3; }
    else if(MODE==='silabas'&&cn.letter){ s=new PIXI.Sprite(letterTexture(cn.letter)); s.width=14;s.height=14; s.x=cn.x-2;s.y=cn.y-2; }
    else { s=new PIXI.Sprite(coinTexFor(vizMode)); s.x=cn.x;s.y=cn.y; }
    s.tint=PCOLOR[cn.owner]||0xffffff; // Lote C: cor do dono (solo=branco → sem alteração)
    s.visible=!cn.taken; coinContainer.addChild(s); return s;
  });
  _lastSharedViz=null; // moedas recriadas → força re-aplicar texturas por viewport no próximo draw
}
rebuildCoins();
// camada de escuridão das áreas secretas (acima de mundo/moedas, ABAIXO do player → player sempre visível)
const darkLayer=new PIXI.Container(); camera.addChild(darkLayer);
const darkRegions=buildDarkRegions().map(tiles=>{
  const gfx=new PIXI.Graphics(); gfx.beginFill(0x04060d,1);
  for(const [tx,ty] of tiles) gfx.drawRect(tx*TILE,ty*TILE,TILE,TILE);
  gfx.endFill(); darkLayer.addChild(gfx);
  return { set:new Set(tiles.map(([tx,ty])=>tx+','+ty)), gfx, announced:false };
});
const TEX={idle:tex(spriteToCanvas(PLAYER_IDLE)),walk:tex(spriteToCanvas(PLAYER_WALK)),climb:tex(spriteToCanvas(PLAYER_CLIMB)),hurt:tex(spriteToCanvas(PLAYER_HURT))};
/* E15: personagem em 3/4 (frente-direita, VIVO) — convertido de referência PixelLab v3 → procedural
   INDEXADO 23×32 (cores chapadas, sem PNG; GPL-clean). Olhos nítidos (largura natural; caixa de
   colisão segue 10×30, visual transborda). Idle respira por juice; corpo anima no andar; flip por direção. */
const PIP_W=24,PIP_H=32;
const PIP_PAL=['#fcd7ab','#e2aa86','#9d6e62','#5d2e22','#472a1e','#231c1c','#1e1011','#ff00ff','#050809','#010909'];
const PIP_IDLE=['.....99444446666888.....','...9444444444444448.....','..924444444444444488....','.9422442444444444439....','.94424222442424495338...','894444444424224495348...','964664444444444915548...','966664455444449101658...','966666595689998000859...','966659986991891000859...','96656919911011009819....','.99969111890000910119...','990099198999008998819...','902281890990001920929...','91133119889000089099....','.911111121500003409.....','....991100003330009.....','.....9821000000009......','.....999821111198.......','....92223999998429......','...9022222399823229.....','...99888822222283829....','...91118892222281008....','..9910000182224910089...','.939211001844449300829..','.9335821139999999229329.','92355589985335229999939.','939955955255552589..99..','99..99952555958129......','.....928899.9925489.....','....991999..99554339....','........................'];
const PIP_WALK=[
  ['.....5566655...........','...69344433365666......','..533344434444336......','.66224444444443466.....','.54324444443444436.....','6644442234424499346....','66466433422323999444...','66666344434434929445...','66666448944939313935...','66666659969856121945...','66666889992191000945...','6699681601102018929....','6921981999900040026....','9013891806960689926....','903382190550009905.....','.41231100220002306.....','...592100000220006.....','.....921100000006......','.....56661111186.......','....9622269999825......','....9522222992525......','....9968862222989......','....8910062222929......','.....810082222828......','.....8100922229919.....','.....9100996699914.....','.....6200092559916.....','.....5100094558988.....','.....98112989689.......','.....99889899119.......','.....9558...95554......','.....94444.............'],
  ['.....6656655...........','...68443344466665......','..933444444444336......','.98224444443344466.....','.63424444443444435.....','6544442244424499446....','65366434422413695444...','66566444434433618445...','66666449944939213845...','65656869969946122945...','66666889992191000845...','6588690911101019919....','6900881998600080026....','6012891509950499926....','813362191860005805.....','.51131100230002306.....','...992100000220019.....','.....921100000008......','.....98951111189.......','....8422299989924......','...99411222992925......','...89996992222999......','...99910082222999......','....981009222299.......','.....81009222299.......','.....89206198999.......','......9200095499.......','.....54622292499.......','.....9556999659........','.....999999.1198.......','.....9349...64444......','.....83455.............'],
  ['.....6665656...........','...96444444466665......','..633444443444446......','.55324444443444466.....','.64424444333444435.....','6644432244222369334....','66466433422413699444...','66666444444444929634...','66566339944948813934...','66666649969958121635...','66666999992081000945...','6699681922101016629....','6921991989800081016....','8002961505950499625....','903361160550005506.....','.50131110440003306.....','...861100000330004.....','.....961200000115......','.....59891111189.......','....9222266989926......','...99222222992629......','...99999992222999......','...99920060022999......','....99200610229........','....992229222299.......','.....992200999999......','.....999200925999......','.....55822292598.......','....95599999969........','....985589992289.......','....9489...933223......','....94469..............'],
  ['.....5665566...........','...98444443366666......','..644444444444446......','.96224444444444456.....','.63313444443443436.....','6543332243424469434....','65466434422324499434...','66666334444444939444...','66665349944936312934...','66666859958968122934...','66666999992081000934...','6686691611101009625....','6922991989800060015....','9013991508960699825....','903381190650006506.....','.51221110420002406.....','...992200000220006.....','.....931100000116......','......9991111169.......','.....522299899315......','...89222222992225......','...99888922222866......','...99200942222929......','....8100992222829......','....810099222298166....','....810899998899216....','....810099925999216....','....91006454459895.....','....91216355928........','.....99959992158.......','......8689.943444......','......94465............'],
  ['.....6665655...........','...56444444356665......','..633333344443446......','.86314444443444466.....','.83423434433434445.....','6633432243423399434....','66456434422413899434...','66566434434434828636...','66566349944949213935...','66666659969968111636...','66666989982091000645...','6699691922201018829....','6811991999900081016....','6002961505960499625....','603361160560005506.....','.51131100440002206.....','...981100000230015.....','.....961100000116......','.....99991111189.......','....9222296966825......','...89222222992625......','...99998922222996......','...99200932222826......','....62009922229138.....','....810099222299169....','....910699898899206....','....810099525599219....','....91008545559988.....','....82119946529........','.....99899991169.......','......9555.833323......','......95555............'],
  ['.....6556656...........','...56443344456566......','..833444444443336......','.56224444444443466.....','.64324434343444435.....','6644442244424499349....','65466444422313695444...','66566344444333619446...','66666439944939223945...','65665669969949121945...','66666899982190000845...','6699690911101019919....','6911991996600081026....','8113891609960499925....','913381191980005606.....','.51131100430002306.....','...992100000220019.....','.....821100000006......','.....99961111196.......','....9222269899924......','...99222222992625......','...99998922222995......','...89100922222929......','....92008822229215.....','....920089222299139....','....620099988999108....','....610009523399129....','....91000855249998.....','....9922299989998......','.....899999.81198......','.....99559..943445.....','.....995548............'],
];
const isPix=(ch)=>ch>='0'&&ch<='9'&&ch!=='7'; // dígito de cor válido (7 = fundo vazado, ignora); robusto p/ linhas curtas
function indexedToCanvas(rows){ const cv=makeCanvas(PIP_W,PIP_H),c=cv.getContext('2d'); for(let y=0;y<PIP_H;y++){const r=rows[y];if(!r)continue;for(let x=0;x<PIP_W;x++){const ch=r[x];if(!isPix(ch))continue;c.fillStyle=PIP_PAL[+ch];c.fillRect(x,y,1,1);}} return cv; }
function silhouetteCanvasIdx(rows){ const cv=makeCanvas(PIP_W,PIP_H),c=cv.getContext('2d'); c.fillStyle='#ffe600'; for(let y=0;y<PIP_H;y++){const r=rows[y];if(!r)continue;for(let x=0;x<PIP_W;x++){if(isPix(r[x]))c.fillRect(x,y,1,1);}} return cv; }
// FASE ATUAL: usa o PIXEL ART do PixelLab DIRETO (PNG, tamanho NATIVO de cada frame — aspect ratio
// próprio, sem padronizar). A conversão procedural (PIP_* acima) fica para uma fase posterior.
// E15: cadência de animação (ticks por quadro) — regulável ao vivo no painel ?debug=true
const ANIM={ walkHold:6, runHold:8, idleHold:20, swimHold:24, clingHold:10, climbHold:8, flavorDelay:360 };  // andar 6; correr 8 (~8fps, pedido do José); swim 24; cling 10; escada 8; flavor ~6s
// Fonte única dos sprites: assets/sprites/menino/<animação>/<i>.png (cor, editado no Aseprite).
// Alto contraste: o quadro de cor é remapeado em tempo real para a PALETA do jogador da variação ativa (sem silhuetas _hc).
const SPR='assets/sprites/menino/';
const pngTex=(f)=>{ const t=PIXI.Texture.from(SPR+f); t.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST; return t; };
const A=(anim,n)=>Array.from({length:n},(_,i)=>pngTex(anim+'/'+i+'.png'));        // frames de cor
const _playerHC={}; // {mode: Map(texCor→tex)} — player recolorido só nos modos HC (bordas/sim não mexem no player)
function playerHCTex(srcTex){ const m=VIZ_BY_KEY[vizMode]; if(!m||m.kind!=='hc')return srcTex; const mm=(_playerHC[vizMode]=_playerHC[vizMode]||new Map());
  if(!mm.has(srcTex)) mm.set(srcTex, gradientMapTexture(srcTex, hcPal(m).player)); return mm.get(srcTex); }
const TEX_IDLE=A('idle',4);          // idle = RESPIRAÇÃO por frames (cabeça congelada → sem 'mastigar'; só o tronco respira)
const TEX_WALK=A('andar',8);         // ANDAR = running-8 (postura ereta/leve) — José pediu manter estes como andar
const TEX_RUN=A('correr',4);         // CORRER = sprint AGRESSIVA (inclinada, braços grandes) — 4 quadros
// E20: idles ocasionais ("gracinhas") — parado um tempo, toca uma e volta a respirar
const TEX_JOINHA=A('gracinha-joinha',2);
const TEX_ESPREG=A('gracinha-espreguicar',2);
const TEX_AQUECER=A('gracinha-aquecer',1);
const FLAVORS=[
  {tex:TEX_JOINHA, seq:[0,1,0,1,0,1], hold:12}, // joínha (bounce do polegar)
  {tex:TEX_ESPREG, seq:[0,1,1,1,1,0], hold:16}, // espreguiçar (sobe, segura, desce)
  {tex:TEX_AQUECER, seq:[0,0,0], hold:40},     // aquecer (segura a pose)
];
// E16: pulo — pose aérea estática (sobe=pernas recolhidas / cai=pernas estendidas), recortadas do jumping-1 SE
const TEX_JUMP_UP=pngTex('pulo/0.png'), TEX_JUMP_DOWN=pngTex('pulo/1.png');
// E17: poses de estado — escada, água, voo, ventosa
const TEX_CLIMB=A('escada',2), TEX_FLY=pngTex('voo/0.png'); // ESCADA: vista de COSTAS (rotação norte), 2 quadros alternados
// E18f: aranha — ANDAR NA PAREDE e ANDAR NO TETO são ciclos distintos (4 quadros cada)
const TEX_CLING_WALL=A('parede',4);
const TEX_CLING_CEIL=A('teto',4);
const TEX_SWIM=A('nadar',2);          // nado MOVENDO: braçada + pernas
const TEX_SWIMIDLE=A('nadar-parado',2); // nado PARADO: só pernas batendo
// E4: decoração de fundo (árvores) ATRÁS do jogador — sempre visível, NÃO some ao pular
const decoLayer=new PIXI.Container(); camera.addChild(decoLayer);
const treeCanvasNormal=treeCanvas(), treeTexNormal=tex(treeCanvasNormal); // árvore = grupo fundo (recolorida no alto contraste)
const _treeTexHC={}; function treeTexFor(mode){ const m=VIZ_BY_KEY[mode]; if(!m||m.kind!=='hc')return treeTexNormal; if(!_treeTexHC[mode])_treeTexHC[mode]=tex(gradientMapCanvas(treeCanvasNormal,hcPal(m).bg)); return _treeTexHC[mode]; } // HC recolore a árvore p/ o fundo
const decoSprites=[];
(function placeTrees(){ let last=-99;
  for(let tx=2;tx<WORLD_W-2;tx++){
    for(let ty=3;ty<WORLD_H-1;ty++){
      if(tileAt(tx,ty)===1 && solidAt(tx,ty+1) && tileAt(tx,ty-1)===1){
        if(tx-last>=5){ const s=new PIXI.Sprite(treeTexNormal); s.anchor.set(0.5,1); s.x=tx*TILE+TILE/2; s.y=(ty+1)*TILE; decoLayer.addChild(s); decoSprites.push(s); last=tx; }
        break;
      }
    }
  }
})();
/* ===================== E12: power-ups + chave/portão ===================== */
function powerupCanvas(kind){
  const cv=makeCanvas(12,12),c=cv.getContext('2d');
  const COL={superjump:'#7fdcff',ultrajump:'#b388ff',turbo:'#34e29b',fly:'#c8a2ff',wallcling:'#ff9a4d',key:'#ffd23f',runcane:'#eaeaea'};
  const col=COL[kind]||'#7fdcff', BG='#04121a';
  c.fillStyle=BG; c.fillRect(1,0,10,12); c.fillRect(0,1,12,10);   // fundo escuro, cantos cortados (pixel-rounded, sem AA)
  c.fillStyle=col;
  const triU=(cx,topY,baseW,H)=>{ for(let i=0;i<H;i++){ const w=Math.max(1,Math.round(baseW*(i+1)/H)); c.fillRect(cx-(w>>1), topY+i, w,1);} }; // triângulo ↑ nítido
  const triR=(lx,cy,baseH,W)=>{ for(let i=0;i<W;i++){ const h=Math.max(1,Math.round(baseH*(W-i)/W)); c.fillRect(lx+i, cy-(h>>1), 1,h);} };       // chevron → nítido
  if(kind==='superjump'){ triU(6,1,8,4); triU(6,6,8,4); }                                  // ▲▲ super-pulo
  else if(kind==='ultrajump'){ triU(6,1,9,4); c.fillRect(5,5,2,6); }                        // ↑ ultra-pulo (cabeça + haste)
  else if(kind==='turbo'){ triR(2,6,9,4); triR(6,6,9,4); }                                  // » super-corrida
  else if(kind==='fly'){ triR(1,5,9,6); c.fillStyle=BG; c.fillRect(4,6,1,1); c.fillRect(6,6,1,1); } // asa = voo (com nervuras)
  else if(kind==='wallcling'){ pixDisc(c,6,6,4,col); pixDisc(c,6,6,1.6,BG); }               // ventosa
  else if(kind==='runcane'){ for(let i=0;i<6;i++)c.fillRect(3+i,2+i,2,1); pixDisc(c,9,10,1.9,col); pixDisc(c,9,10,0.8,BG); c.fillStyle='#d23b3b'; c.fillRect(7,6,2,1); } // bengala de corrida: haste diagonal + roda + faixa vermelha
  else { pixDisc(c,4,6,3,col); pixDisc(c,4,6,1.3,BG); c.fillStyle=col; c.fillRect(6,5,5,2); c.fillRect(9,7,1,1); c.fillRect(10,7,1,2); } // ⚷ chave (anel + haste + dentes)
  return cv;
}
const PUP_CANVAS={}, PUP_TEX={};
['superjump','ultrajump','turbo','fly','wallcling','key','runcane'].forEach(k=>{ PUP_CANVAS[k]=powerupCanvas(k); PUP_TEX[k]=tex(PUP_CANVAS[k]); });
const _pupTexHC={}; // {mode:{kind:tex}} — power-up: contorno (bordas) ou recolor (hc)
function pupTexFor(kind,mode){ const m=VIZ_BY_KEY[mode]; if(!m||(m.kind!=='bordas'&&m.kind!=='hc'))return PUP_TEX[kind]; (_pupTexHC[mode]=_pupTexHC[mode]||{});
  if(!_pupTexHC[mode][kind]) _pupTexHC[mode][kind] = m.kind==='hc' ? tex(gradientMapCanvas(PUP_CANVAS[kind],hcPal(m).item)) : tex(outlineCanvas(PUP_CANVAS[kind],1)); return _pupTexHC[mode][kind]; }
const extraLayer=new PIXI.Container(); camera.addChild(extraLayer); // power-ups + portão (atrás do player)
let powerups=[];
function rebuildExtras(){
  extraLayer.removeChildren().forEach(s=>s.destroy());
  powerups.forEach(pu=>{ const s=new PIXI.Sprite(pupTexFor(pu.kind,vizMode)); s.x=pu.x; s.y=pu.y; s.visible=!pu.taken; extraLayer.addChild(s); pu.sprite=s; });
  if(gate && !gateOpen){ const g=new PIXI.Graphics();
    const DARK=parseInt(OUTLINE_DARK.slice(1),16);
    for(const k of gateTiles){ const [tx,ty]=k.split(',').map(Number); const X=tx*TILE,Y=ty*TILE;
      g.beginFill(0x8a5a2b).drawRect(X,Y,TILE,TILE).endFill();
      g.beginFill(0x5a3a1b); for(let i=2;i<TILE;i+=5)g.drawRect(X+i,Y+1,2,TILE-2); g.endFill();
      if(vizMode==='bordas') g.beginFill(DARK).drawRect(X,Y,TILE,1).drawRect(X,Y+TILE-1,TILE,1).drawRect(X,Y,1,TILE).drawRect(X+TILE-1,Y,1,TILE).endFill(); // porta: contorno escuro
    }
    extraLayer.addChild(g);
  }
  _lastSharedViz=null; // power-ups/porta recriados → força re-aplicar texturas por viewport
}
function setupExtras(){
  // itens e portão vêm das posições REAIS do mapa Clarity (não mais aleatórios)
  const _blind = modoCego || players.some(p=>{const m=VIZ_BY_KEY[p.viz];return m&&m.kind==='blind';}); // experiência de cego ativa?
  powerups = MAP_ITEMS.filter(it=> !wheelchair || it.kind==='fly'||it.kind==='turbo'||it.kind==='key') // cadeirante: só voo/super-corrida (chave mantida p/ o portão)
    .map(it=>({ x:it.tx*TILE+2, y:it.ty*TILE+2, kind:it.kind, taken:false, by:[], sprite:null })); // by[i]=1 → coletado por aquele jogador (chave é global)
  if(_blind){ const sj=powerups.find(pu=>pu.kind==='superjump'); if(sj) sj.kind='runcane'; } // cego: o item de SUPER-PULO vira a bengala de corrida (habilita correr)
  gateTiles = new Set(MAP_GATE.map(g=>g.tx+','+g.ty));
  gate = MAP_GATE.length ? MAP_GATE : null;
  gateOpen = MAP_GATE.length===0; // havendo portão, começa FECHADO (abre com a chave)
  rebuildExtras();
}
setupExtras();

// Fácil: retângulo translúcido mostrando a hitbox de coleta tolerante (sob o player)
const easyHitbox=new PIXI.Graphics(); camera.addChild(easyHitbox);
// Cadeirante: RAMPAS desenhadas sobre os degraus de 1 tile (sobre o mundo, abaixo do player)
const rampLayer=new PIXI.Graphics(); camera.addChildAt(rampLayer, camera.getChildIndex(worldSprite)+1);
function buildRamps(){ rampLayer.clear(); rampLayer.visible=wheelchair; if(!wheelchair)return;
  const sol=(x,y)=>{ const t=tileAt(x,y); return !!(TILE_TYPES[t]&&TILE_TYPES[t].solid); }, surf=(x,y)=> sol(x,y)&&!sol(x,y-1); // topo caminhável
  const FILL=0x7b7f8b, EDGE=0x4a4e59, STRIPE=0xf2c200; // STRIPE = faixa amarela de acessibilidade (na superfície da rampa)
  for(let y=1;y<WORLD_H;y++)for(let x=0;x<WORLD_W-1;x++){ if(!surf(x,y))continue;
    if(surf(x+1,y-1)){ const X=(x+1)*TILE, yL=y*TILE, yU=(y-1)*TILE;                 // degrau SOBE p/ direita
      rampLayer.beginFill(FILL); rampLayer.moveTo(X-TILE,yL); rampLayer.lineTo(X,yU); rampLayer.lineTo(X,yL); rampLayer.closePath(); rampLayer.endFill();
      rampLayer.lineStyle(1,EDGE); rampLayer.moveTo(X-TILE,yL); rampLayer.lineTo(X,yU);
      rampLayer.lineStyle(2,STRIPE); rampLayer.moveTo(X-TILE,yL-1); rampLayer.lineTo(X,yU-1); rampLayer.lineStyle(0);
    } else if(surf(x+1,y+1)){ const X=(x+1)*TILE, yL=y*TILE, yD=(y+1)*TILE;          // degrau DESCE p/ direita
      rampLayer.beginFill(FILL); rampLayer.moveTo(X,yL); rampLayer.lineTo(X+TILE,yD); rampLayer.lineTo(X,yD); rampLayer.closePath(); rampLayer.endFill();
      rampLayer.lineStyle(1,EDGE); rampLayer.moveTo(X,yL); rampLayer.lineTo(X+TILE,yD);
      rampLayer.lineStyle(2,STRIPE); rampLayer.moveTo(X,yL-1); rampLayer.lineTo(X+TILE,yD-1); rampLayer.lineStyle(0);
    }
  }
  // cadeirante: LAVA (9) e TRAMPOLIM (5) viram chão — cada um coberto por um bloco de concreto (o vidro do elevador fica por cima)
  for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){ const t=tileAt(x,y); if(t!==9&&t!==5)continue; const X=x*TILE,Y=y*TILE;
    rampLayer.beginFill(0x6f7481); rampLayer.drawRect(X,Y,TILE,TILE); rampLayer.endFill();
    rampLayer.beginFill(0x8a8f9c); rampLayer.drawRect(X,Y,TILE,2); rampLayer.endFill();               // topo claro
    rampLayer.lineStyle(1,0x4a4e59); rampLayer.drawRect(X+0.5,Y+0.5,TILE-1,TILE-1); rampLayer.lineStyle(0); // borda
  }
  // cadeirante: PLATAFORMAS só-cadeirante (wcSolid) desenhadas como concreto (ex.: ponte que liga o elevador do corredor à escada)
  for(const k of wcSolid){ const [x,y]=k.split(',').map(Number); const X=x*TILE,Y=y*TILE;
    rampLayer.beginFill(0x6f7481); rampLayer.drawRect(X,Y,TILE,TILE); rampLayer.endFill();
    rampLayer.beginFill(0x8a8f9c); rampLayer.drawRect(X,Y,TILE,2); rampLayer.endFill();
    rampLayer.lineStyle(1,0x4a4e59); rampLayer.drawRect(X+0.5,Y+0.5,TILE-1,TILE-1); rampLayer.lineStyle(0);
  }
}
// Geometria só-cadeirante: plataformas que dão DESTINO aos elevadores (não existem no modo normal).
const WC_BRIDGES=[ {x:23,y:47},{x:24,y:47} ]; // ponte do elevador do corredor: liga o poço do trampolim B (x20-22) ao topo da escada (x25)
// Elevadores SÓ-CADEIRANTE (sem trampolim no modo normal): fosso onde o jogador normalmente PULA.
// D: fosso x53-54 — sobe do chão (row45) à plataforma (row42), saída à esquerda (x52).
const WC_ELEVATORS=[ {cols:[53,54], yTop:42*TILE, yBottom:45*TILE, kind:'wide'} ];
function buildWcGeom(){ wcSolid=new Set(); if(!wheelchair)return; for(const b of WC_BRIDGES) wcSolid.add(b.x+','+b.y); }
buildWcGeom();
buildRamps(); // desenha as rampas + coberturas (lava, pontes) se já iniciar em modo cadeirante
// CORDAS FLUTUANTES na superfície da água (o cego atravessa por elas; visual para todos)
const ropeLayer=new PIXI.Graphics(); camera.addChildAt(ropeLayer, camera.getChildIndex(worldSprite)+1);
function buildRopes(){ ropeLayer.clear();
  for(let y=1;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){ if(tileAt(x,y)!==3||tileAt(x,y-1)===3)continue; const X=x*TILE, Y=y*TILE+1; // topo da poça (superfície)
    ropeLayer.lineStyle(1,0xcaa96a,0.85); ropeLayer.moveTo(X,Y); ropeLayer.lineTo(X+TILE,Y); ropeLayer.lineStyle(0);
    ropeLayer.beginFill(0x8a6f3a); ropeLayer.drawRect(X+TILE/2-1,Y-1,2,2); ropeLayer.endFill(); } } // nó
buildRopes();
// ELEVADOR (cadeirante): trampolim = plataforma LARGA, escada = plataforma FINA. Toque ↑/↓ = viaja até a parada segura.
const ELEV_SPEED=2.4; let elevShafts=[];
function buildElevators(){ elevShafts=[]; if(!wheelchair)return;
  const isE=(x,y)=>{const t=tileAt(x,y);return t===4||t===5;};
  const wall=(x,y)=>{const t=tileAt(x,y);return !!(TILE_TYPES[t]&&TILE_TYPES[t].solid)&&t!==5;};
  const seen=new Set();
  for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){
    if(!isE(x,y)||seen.has(x+','+y))continue;
    let x2=x; while(x2+1<WORLD_W&&isE(x2+1,y))x2++;                    // largura do poço (run horizontal)
    const cols=[]; for(let cx=x;cx<=x2;cx++)cols.push(cx);
    let yb=y; while(yb+1<WORLD_H&&isE(cols[0],yb+1))yb++;              // base do run vertical
    for(const cx of cols)for(let yy=y;yy<=yb;yy++)seen.add(cx+','+yy);
    let ytop=y; while(ytop-1>=0&&!cols.some(cx=>wall(cx,ytop-1)))ytop--; // topo aberto (até um teto sólido)
    const isTramp=tileAt(cols[0],y)===5;
    let fr=yb+1; while(fr<WORLD_H&&!wall(cols[0],fr))fr++;             // 1º chão sólido abaixo (p/ escada)
    const yBottom = isTramp ? y*TILE : fr*TILE;                       // trampolim = CHÃO sólido (para EM CIMA); escada = desce ao chão de baixo
    const L=cols[0]-1, R=cols[cols.length-1]+1;
    let yTop=yBottom; for(let r=ytop;r<=yb;r++){ if(surfTop(L,r)||surfTop(R,r)){ yTop=r*TILE; break; } } // 1ª parada c/ piso ao lado
    elevShafts.push({cols,xMin:cols[0],xMax:cols[cols.length-1],yTop,yBottom,kind:isTramp?'wide':'thin'});
  }
  for(const e of WC_ELEVATORS) elevShafts.push({cols:e.cols,xMin:e.cols[0],xMax:e.cols[e.cols.length-1],yTop:e.yTop,yBottom:e.yBottom,kind:e.kind}); // elevadores só-cadeirante (fossos)
}
function elevAt(pl){ const l=Math.floor((pl.x-BOX.w/2)/TILE), r=Math.floor((pl.x+BOX.w/2-0.01)/TILE);
  for(const s of elevShafts){ if(r>=s.xMin&&l<=s.xMax && pl.y>=s.yTop-3 && pl.y<=s.yBottom+3) return s; } return null; }
buildElevators();
const elevLayer=new PIXI.Graphics(); camera.addChildAt(elevLayer, camera.getChildIndex(worldSprite)+1);
// Estilo VIDRO PREDIAL (rodoviária/shopping/aeroporto): fosso de vidro translúcido (vê o background),
// moldura cinza/branco/azul, escada some virando blocos de elevador, e a cabine PERMANECE onde foi deixada.
function drawElevators(g){ g.clear(); if(!wheelchair)return;
  for(const s of elevShafts){ if(s.carY==null)s.carY=s.yBottom; for(const pl of players){ if(elevAt(pl)===s) s.carY=pl.y; } } // cabine segue quem está nela; senão fica
  const GLASS=0x9fd0e6, FRAME=0x8aa0b8, WHITE=0xeaf2f8, BLUE=0x4a78b0, INNER=0x24384d;
  for(const s of elevShafts){
    const x0=s.xMin*TILE, x1=(s.xMax+1)*TILE, w=x1-x0, yt=s.yTop-TILE, yb=s.yBottom, h=yb-yt; // vidro só ACIMA do chão (yBottom)
    g.beginFill(GLASS,0.14); g.drawRect(x0,yt,w,h); g.endFill();                                   // fosso de vidro (vê o background)
    for(const cx of s.cols)for(let ry=Math.floor(yt/TILE);ry<=Math.floor((yb-1)/TILE);ry++){ if(tileAt(cx,ry)!==4)continue; const X=cx*TILE,Y=ry*TILE; // ESCADA some → bloco de elevador
      g.beginFill(INNER,0.9); g.drawRect(X,Y,TILE,TILE); g.endFill(); g.beginFill(GLASS,0.22); g.drawRect(X,Y,TILE,TILE); g.endFill(); }
    g.lineStyle(1,BLUE,0.45); for(let yy=yt+TILE; yy<yb; yy+=TILE){ g.moveTo(x0,yy); g.lineTo(x1,yy); } for(let xx=x0+TILE; xx<x1; xx+=TILE){ g.moveTo(xx,yt); g.lineTo(xx,yb); } // divisões dos painéis
    g.lineStyle(2,FRAME,0.95); g.drawRect(x0,yt,w,h);                                               // contorno da estrutura
    g.lineStyle(2,WHITE,0.22); g.moveTo(x0+2,yt+h*0.6); g.lineTo(x0+w*0.55,yt+2); g.lineStyle(0);   // reflexo de vidro
    const cy=Math.round(s.carY);                                                                    // CABINE persistente
    g.beginFill(INNER,0.92); g.drawRect(x0+1,cy-15,w-2,15); g.endFill();
    g.beginFill(GLASS,0.35); g.drawRect(x0+2,cy-14,w-4,13); g.endFill();
    g.lineStyle(2,FRAME); g.drawRect(x0+1,cy-15,w-2,15); g.lineStyle(0);
    g.beginFill(0x2a3145); g.drawRect(x0,cy,w,4); g.endFill();                                      // piso da cabine
    g.beginFill(WHITE,0.85); g.drawRect(x0,cy-1,w,2); g.endFill();                                  // faixa clara
  }
  for(const pl of players){ if(pl.elevTarget==null)continue; const s=elevAt(pl); if(!s)continue; const y=Math.round(pl.y), up=pl.elevTarget<y, ax=(s.xMin*TILE+(s.xMax+1)*TILE)/2, ay=up?y-9:y+11; // seta de destino
    g.beginFill(0xf2c200); g.moveTo(ax,ay+(up?-4:4)); g.lineTo(ax-4,ay); g.lineTo(ax+4,ay); g.closePath(); g.endFill(); }
}
const caneLayer=new PIXI.Graphics(); camera.addChild(caneLayer); // bengala (modo cego)
// Bengala RÍGIDA de MEIO BLOCO (~8px): extensão da mão dianteira, presa ao corpo (não oscila sozinha).
function drawCane(g,pl){ const dir=pl.facing<0?-1:1, C=caneColor(pl);
  const hx=pl.x+dir*4, hy=pl.y-9, tx=pl.x+dir*8, ty=pl.y-1;                     // punho na mão → ponteira no chão à frente
  g.lineStyle(2,C); g.moveTo(hx,hy); g.lineTo(tx,ty);                           // haste curta (branca=cego / verde=baixa visão)
  g.lineStyle(1,0xd23b3b); g.moveTo(tx-dir*2,ty-2); g.lineTo(tx,ty);            // faixa vermelha (ponta)
  g.lineStyle(0); g.beginFill(C); g.drawCircle(tx,ty,1.3); g.endFill();         // ponteira
}
// Bengala de CORRIDA (item): RODA na ponta, contato constante com o chão (alta performance).
function drawRunCane(g,pl){ const dir=pl.facing<0?-1:1, C=caneColor(pl);
  const hx=pl.x+dir*4, hy=pl.y-9, wx=pl.x+dir*10, wy=pl.y-2;                     // haste até o eixo da roda, à frente
  g.lineStyle(2,C); g.moveTo(hx,hy); g.lineTo(wx,wy-1);
  g.lineStyle(1.5,C); g.drawCircle(wx,wy,2.4);                                   // RODA na ponta (contato constante)
  g.lineStyle(1,0xd23b3b); g.moveTo(wx-2.4,wy); g.lineTo(wx+2.4,wy); g.lineStyle(0); // eixo/faixa
}
const chairLayer=new PIXI.Graphics(); camera.addChild(chairLayer); // cadeira de rodas (modo cadeirante)
function drawChair(g,pl){ const cx=pl.x, base=pl.y, f=pl.facing<0?-1:1, MET=0x4a586e, HUB=0x1c2230;
  g.lineStyle(2,MET); g.drawCircle(cx,base-6,7);                                   // roda grande
  g.lineStyle(1,MET); for(let a=0;a<6;a++){ const an=a*Math.PI/3; g.moveTo(cx,base-6); g.lineTo(cx+Math.cos(an)*6,base-6+Math.sin(an)*6); } // raios
  g.lineStyle(0); g.beginFill(HUB); g.drawCircle(cx,base-6,2); g.endFill();        // cubo
  g.lineStyle(3,MET); g.moveTo(cx-f*5,base-6); g.lineTo(cx-f*5,base-22); g.lineTo(cx-f*2,base-24); // encosto atrás das costas
  g.moveTo(cx+f*4,base-4); g.lineTo(cx+f*9,base-2);                                 // apoio de pés à frente
  g.lineStyle(0); }

const playerSprite=new PIXI.Sprite(TEX_IDLE[0]); playerSprite.anchor.set(0.5,1); camera.addChild(playerSprite);
players[0].sprite=playerSprite;
/* E11: sprites por jogador + render multi-viewport (render-to-texture) */
let allPSprites=[playerSprite];
function ensureSprites(){
  for(let i=allPSprites.length;i<numPlayers;i++){ const s=new PIXI.Sprite(TEX_IDLE[0]); s.anchor.set(0.5,1); camera.addChild(s); allPSprites.push(s); }
  allPSprites.forEach((s,i)=>{ s.visible=i<numPlayers; s.tint=PCOLOR[i]||0xffffff; if(i<numPlayers)players[i].sprite=s; });
}
let vpTex=[], vpSpr=[], vpFrames=null, vpDots=[];
// HUD por jogador em DOM SOBREPOSTO (alta definição, não pixela): moedas (1ª coluna) + poder (2ª coluna), por viewport.
let gameHudEl=null, vpHudDom=[], vpQuitDom=[], vpScreens=[], vpPause=[], pauseActor=0;
// Menu de pausa POR TELA (Etapa 2): um por jogador, dentro da .player-screen dele.
const PM_BTNS=[ {act:'resume',lbl:'▶ Continuar'},{act:'letra',lbl:'🔠 ABC',letra:true},{act:'audio',lbl:'🦻 Acessibilidade auditiva'},{act:'motora',lbl:'♿ Acessibilidade motora'},{act:'anim',lbl:'🎞 Sensibilidade visual'},{act:'visual',lbl:'🎨 Acessibilidade visual'},{act:'empatia',lbl:'🫂 Modo empatia'},{act:'ajuda',lbl:'❓ Ajuda'},{act:'print',lbl:'📷 Print (ver a tela)'},{act:'quit',lbl:'🚪 Sair do jogo'} ];
// Barra de atalhos de a11y no topo da pausa (por tela). Sons (cego/TTS) só com saída própria; webcam/voz em construção.
const PAUSE_ICONS=[ {k:'blind',e:'🦯',n:'Modo cego (navegação sonora)'},{k:'tts',e:'🗨️',n:'Narração por voz (TTS)'},{k:'tea',e:'🧩',n:'Modo TEA (calmo / silencioso)'},{k:'altmove',e:'🦾',n:'Teclas de alternância'},{k:'contrast',e:'🌗',n:'Alto contraste'},{k:'cvd',e:'🚥',n:'Correção de daltonismo (protan/deutan/tritan)'},{k:'face',e:'🧑',n:'Webcam — rosto',soon:true},{k:'eyes',e:'👀',n:'Webcam — olhos',soon:true},{k:'voice',e:'👄',n:'Comando de voz',soon:true} ];
let calmMode=0; // 0=normal · 1=calmo (reduz) · 2=silencioso (desliga) — nunca mexe em TTS/modo cego
function buildScreenPause(i){ const sp=document.createElement('div'); sp.className='screen-pause'; sp.hidden=true; sp.dataset.player=String(i);
  const icons=PAUSE_ICONS.map(ic=>'<button class="pi-btn'+(ic.soon?' pi-soon':'')+'" type="button" data-pi="'+ic.k+'" aria-label="'+ic.n+(ic.soon?' (em construção)':'')+'">'+ic.e+'</button>').join('');
  sp.innerHTML='<div class="pause-card" role="dialog" aria-modal="true" aria-label="Menu de pausa do jogador '+(i+1)+'">'+
    '<div class="pause-icons" role="group" aria-label="Atalhos de acessibilidade">'+icons+'</div><p class="pause-icons-cap" aria-live="polite"></p>'+
    '<h2>Pausado'+(numPlayers>1?' · Jogador '+(i+1):'')+'</h2><div class="pause-menu" role="menu">'+
    PM_BTNS.map(b=>'<button class="pm-btn'+(b.letra?' pm-letra':'')+'" role="menuitem" type="button" data-act="'+b.act+'">'+b.lbl+'</button>').join('')+
    '</div><p class="pause-legend" aria-hidden="true"></p></div>';
  sp.addEventListener('click',(e)=>{ const b=e.target.closest('.pm-btn'); if(b){ pauseActor=i; const act=b.dataset.act; if(pauseActs[act])pauseActs[act](); return; }
    const ib=e.target.closest('.pi-btn'); if(ib){ pauseActor=i; iconAct(ib.dataset.pi,i); reflectPauseIcons(); const cp=sp.querySelector('.pause-icons-cap'); if(cp)cp.textContent=ib.getAttribute('aria-label')||''; } });
  const cap=sp.querySelector('.pause-icons-cap');
  sp.querySelectorAll('.pi-btn').forEach(b=>{ const show=()=>{ cap.textContent=b.getAttribute('aria-label')||''; }; // legenda = aria-label (reflete o estado on/off atual)
    b.addEventListener('mouseenter',show); b.addEventListener('focus',show); });
  return sp; }
function hasPrivateOutput(i){ if(numPlayers<=1)return true; const p=players[i]; if(!p||!p.audioSink)return false; return !players.some((q,j)=>j!==i&&q&&q.audioSink===p.audioSink); }
function applyCalm(){ const scene=calmMode>=1; RM_KEYS.forEach(k=>{ rm[k]=scene; }); if(typeof saveRM==='function')saveRM();
  players.forEach(p=>RM_CHAR.forEach(c=>{ p[c.prop]=(calmMode===2); })); // silencioso congela o personagem também
  ['ambient','music','earcons','other','interact'].forEach(k=>{ if(audioCat[k]){ if(calmMode===0){audioCat[k].on=true;} else if(calmMode===1){audioCat[k].on=true;audioCat[k].vol=Math.min(audioCat[k].vol,0.3);} else {audioCat[k].on=false;} if(typeof setCatGain==='function')setCatGain(k); } }); } // TTS/sonar/guarda/guia intactos
function iconAct(k,i){ const ic=PAUSE_ICONS.find(x=>x.k===k);
  if(ic&&ic.soon){ srAlert(ic.n+': em construção — chega com os subsistemas de webcam/fala e o filtro de daltonismo.'); return; }
  if((k==='blind'||k==='tts')&&!hasPrivateOutput(i)){ srAlert('Só dá para mexer em som/TTS/modo cego com uma saída de áudio SÓ sua (não compartilhada). Escolha um dispositivo próprio em A12e auditiva.'); return; }
  if(k==='blind'){ setModoCego(!modoCego); srSay('Modo cego '+(modoCego?'ligado.':'desligado.')); }
  else if(k==='tts'){ audioCat.tts.on=!audioCat.tts.on; if(typeof setCatGain==='function')setCatGain('tts'); if(typeof reflectTTS==='function')reflectTTS(); srSay('Narração '+(audioCat.tts.on?'ligada.':'desligada.')); }
  else if(k==='tea'){ calmMode=(calmMode+1)%3; applyCalm(); srSay('Modo TEA: '+['off','calmo','silencioso'][calmMode]+'.'); }
  else if(k==='altmove'){ if(typeof setToggleMove==='function')setToggleMove(i,!players[i].toggleMove); }
  else if(k==='contrast'){ const cur=(players[i]||{}).viz; setPlayerViz(i,(cur&&cur!=='normal')?'normal':'hc3'); }
  else if(k==='cvd'){ const seq=['normal','fix-protan','fix-deuter','fix-tritan']; let idx=seq.indexOf((players[i]||{}).viz); idx=idx<0?1:(idx+1)%seq.length; setPlayerViz(i,seq[idx]); srSay('Correção de daltonismo: '+['off','protanopia','deuteranopia','tritanopia'][idx]+'.'); }
}
// Legenda do botão refletindo o ESTADO atual (on/off ou o nível). Vira o aria-label e o rodapé de legenda.
function iconLabel(k,i){ const ic=PAUSE_ICONS.find(x=>x.k===k); if(!ic)return '';
  if(ic.soon) return ic.n+' (em construção)';
  const p=players[i]||{};
  if(k==='blind')   return 'Modo cego (navegação sonora): '+(modoCego?'on':'off');
  if(k==='tts')     return 'Narração por voz (TTS): '+((audioCat.tts&&audioCat.tts.on)?'on':'off');
  if(k==='tea')     return 'Modo TEA: '+['off','calmo','silencioso'][calmMode];
  if(k==='altmove') return 'Teclas de alternância: '+(p.toggleMove?'on':'off');
  if(k==='contrast'){ const m=VIZ_BY_KEY[p.viz]; return 'Alto contraste: '+((m&&(m.kind==='hc'||m.kind==='bordas'))?'on':'off'); }
  if(k==='cvd'){ const map={'fix-protan':'protanopia','fix-deuter':'deuteranopia','fix-tritan':'tritanopia'}; return 'Correção de daltonismo: '+(map[p.viz]||'off'); }
  return ic.n; }
function reflectPauseIcons(){ vpPause.forEach((sp,i)=>{ sp.querySelectorAll('.pi-btn').forEach(b=>{ const k=b.dataset.pi; let on=false,dis=false;
  b.classList.remove('pi-calm','pi-cvd-protan','pi-cvd-deuter','pi-cvd-tritan');
  if(k==='blind'){ on=modoCego; dis=!hasPrivateOutput(i); }
  else if(k==='tts'){ on=!!(audioCat.tts&&audioCat.tts.on); dis=!hasPrivateOutput(i); }
  else if(k==='tea'){ on=(calmMode===2); if(calmMode===1)b.classList.add('pi-calm'); } // 2=silencioso (amarelo) · 1=calmo (branco) · 0=off (base)
  else if(k==='altmove'){ on=!!(players[i]&&players[i].toggleMove); }
  else if(k==='contrast'){ const m=VIZ_BY_KEY[(players[i]||{}).viz]; on=!!(m&&(m.kind==='hc'||m.kind==='bordas')); }
  else if(k==='cvd'){ const v=(players[i]||{}).viz||''; if(v==='fix-protan')b.classList.add('pi-cvd-protan'); else if(v==='fix-deuter')b.classList.add('pi-cvd-deuter'); else if(v==='fix-tritan')b.classList.add('pi-cvd-tritan'); } // fundo bicolor = o próprio sinal de ativo; off=base
  b.classList.toggle('pi-on',on); b.classList.toggle('pi-dis',dis);
  const active=on||b.classList.contains('pi-calm')||/pi-cvd-/.test(b.className); b.setAttribute('aria-pressed',String(active));
  if(!(PAUSE_ICONS.find(x=>x.k===k)||{}).soon) b.setAttribute('aria-label',iconLabel(k,i)); }); }); }
// Contêiner "tela do jogador" por viewport (Etapa 1): hospeda o HUD; nas próximas etapas, a pausa e os menus.
function screenRect(i){ const cols=numPlayers<=1?1:(numPlayers<=2?numPlayers:2), rows=numPlayers<=2?1:2;
  const col=i%cols, row=Math.floor(i/cols); let colFrac=col/cols;
  if(numPlayers===3 && i===2) colFrac=(1-1/cols)/2; // 3 telas: a 3ª centralizada na linha de baixo (casa com o render)
  return { L:(colFrac*100)+'%', T:(row/rows*100)+'%', W:(100/cols)+'%', H:(100/rows)+'%' }; }
function buildGameHud(){ if(!gameHudEl) gameHudEl=$('#game-hud'); if(!gameHudEl)return; gameHudEl.innerHTML=''; vpHudDom=[]; vpQuitDom=[]; vpScreens=[]; vpPause=[];
  for(let i=0;i<Math.max(1,numPlayers);i++){ const r=screenRect(i);
    const scr=document.createElement('div'); scr.className='player-screen'; scr.dataset.player=String(i); scr.style.left=r.L; scr.style.top=r.T; scr.style.width=r.W; scr.style.height=r.H;
    const d=document.createElement('div'); d.className='vphud';
    d.innerHTML='<span class="vphud-coins"><b class="vphud-ico">🪙</b> <b class="vphud-n">0</b> / '+COIN_TARGET+'</span><span class="vphud-power"><b class="vphud-ico">✨</b> <span class="vphud-pw">—</span></span>';
    scr.appendChild(d); vpHudDom.push(d);
    const q=document.createElement('div'); q.className='vphud-quit'; q.hidden=true; q.textContent='Jogo abandonado'; scr.appendChild(q); vpQuitDom.push(q);
    const sp=buildScreenPause(i); scr.appendChild(sp); vpPause.push(sp);
    gameHudEl.appendChild(scr); vpScreens.push(scr); }
  // reflete ABC + legenda sim/não nos menus recém-criados (no 1º build do init, LETRA/PAD_DESIGNS ainda estão
  // em TDZ — o try/catch ignora; applyLetra/applyPadDesign preenchem logo depois no fluxo de init).
  try{ applyLetra(false); }catch(e){}
  try{ renderPauseLegend(); }catch(e){}
}
function updateGameHud(){ for(let i=0;i<vpHudDom.length;i++){ const p=players[i]; if(!p)continue; const d=vpHudDom[i];
  const n=d.querySelector('.vphud-n'); if(n)n.textContent=String(p.collected); const pw=d.querySelector('.vphud-pw'); if(pw)pw.textContent=POWER_SHORT[p.activePower]||'—';
  if(vpQuitDom[i])vpQuitDom[i].hidden=!p.quit; if(d)d.style.visibility=p.quit?'hidden':'visible'; } } // jogador que saiu: tela preta "jogo abandonado"
function configureRender(){
  vpSpr.forEach(s=>s.destroy()); vpSpr=[]; vpTex.forEach(t=>t.destroy(true)); vpTex=[];
  if(vpFrames){ vpFrames.destroy(); vpFrames=null; }
  vpDots.forEach(g=>g.destroy()); vpDots=[];
  if(numPlayers<=1){
    if(camera.parent!==app.stage) app.stage.addChildAt(camera,0);
    minimap.visible=true; app.renderer.resize(LOGICAL_W,LOGICAL_H); buildGameHud();
  } else {
    if(camera.parent) camera.parent.removeChild(camera); // câmera renderizada manualmente nas RTs
    minimap.visible=false;
    const cols=numPlayers<=2?numPlayers:2, rows=numPlayers<=2?1:2;
    app.renderer.resize(LOGICAL_W*cols, LOGICAL_H*rows);
    const positions=[];
    for(let i=0;i<numPlayers;i++){
      let x=(i%cols)*LOGICAL_W, y=Math.floor(i/cols)*LOGICAL_H;
      if(numPlayers===3 && i===2) x=(LOGICAL_W*cols-LOGICAL_W)/2; // 3 telas: a 3ª centralizada na linha de baixo
      const rt=PIXI.RenderTexture.create({width:LOGICAL_W,height:LOGICAL_H}); rt.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST;
      const s=new PIXI.Sprite(rt); s.x=x; s.y=y;
      app.stage.addChild(s); vpTex.push(rt); vpSpr.push(s); positions.push([x,y]);
    }
    // linha de moldura por tela (1px lógico; escala por k junto com o canvas) — separa e enquadra como a tela única
    vpFrames=new PIXI.Graphics();
    for(const [x,y] of positions){ vpFrames.lineStyle(1,0xcdd6f2,0.95); vpFrames.drawRect(x+0.5,y+0.5,LOGICAL_W-1,LOGICAL_H-1); }
    app.stage.addChild(vpFrames);
    vpDots=positions.map(([x,y])=>{ const g=new PIXI.Graphics(); g.x=x+LOGICAL_W-9; g.y=y+9; g.visible=false; app.stage.addChild(g); return g; }); // bolinhas por viewport (acima de tudo, sem filtro)
    buildGameHud(); applyVpFilters(); updateVpDots();
  }
}

// E5: minimapa estilo Metroid (canto inferior esquerdo, fixo na tela, fog-of-war)
const MM_SCALE=0.8, MM_PAD=4, mmW=WORLD_W*MM_SCALE, mmH=WORLD_H*MM_SCALE;
const minimap=new PIXI.Container(); minimap.x=MM_PAD; minimap.y=LOGICAL_H-mmH-MM_PAD; minimap.alpha=0.92;
app.stage.addChild(minimap);
buildGameHud(); // HUD por jogador no init (single-screen; configureRender só roda ao trocar nº de telas)
const mmBg=new PIXI.Graphics(); mmBg.beginFill(0x05070f,0.72); mmBg.drawRect(-1,-1,mmW+2,mmH+2); mmBg.endFill();
const mmTiles=new PIXI.Graphics(), mmPlayer=new PIXI.Graphics();
minimap.addChild(mmBg,mmTiles,mmPlayer);
const seen=Array.from({length:WORLD_H},()=>new Uint8Array(WORLD_W)); let mmDirty=false;
function markSeen(camX,camY){
  const tx0=Math.max(0,(camX/TILE)|0),tx1=Math.min(WORLD_W-1,((camX+LOGICAL_W)/TILE)|0);
  const ty0=Math.max(0,(camY/TILE)|0),ty1=Math.min(WORLD_H-1,((camY+LOGICAL_H)/TILE)|0);
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++) if(!seen[ty][tx]){seen[ty][tx]=1;mmDirty=true;}
}
function redrawMinimap(){
  mmTiles.clear();
  for(let ty=0;ty<WORLD_H;ty++)for(let tx=0;tx<WORLD_W;tx++){
    if(!seen[ty][tx])continue;
    const t=tileAt(tx,ty);
    const col=isSolidType(t)?0x9a93b5:(t===3?0x2f6fae:(t===9?0xff5b3a:0x232038));
    mmTiles.beginFill(col,1); mmTiles.drawRect(tx*MM_SCALE,ty*MM_SCALE,MM_SCALE+0.4,MM_SCALE+0.4); mmTiles.endFill();
  }
  mmDirty=false;
}

/* ===================== física (por jogador — E11) ===================== */
function sampleFeatures(pl){
  const l=pl.x-BOX.w/2,r=pl.x+BOX.w/2,t=pl.y-BOX.h,b=pl.y;
  let water=false,ladder=false,lava=false;
  for(let ty=Math.floor(t/TILE);ty<=Math.floor((b-0.01)/TILE);ty++)
    for(let tx=Math.floor(l/TILE);tx<=Math.floor((r-0.01)/TILE);tx++){
      const tt=tileAt(tx,ty); if(tt===3)water=true; if(tt===4)ladder=true; if(tt===9)lava=true; if(tt===5&&wheelchair)ladder=true; // cadeirante: trampolim = elevador (↑/↓)
    }
  if(wheelchair && elevAt(pl)) ladder=true; // cadeirante: toda a coluna do poço "segura" o jogador (plataforma), sem gravidade
  return {water,ladder,lava};
}
function resolveX(pl){
  const l=pl.x-BOX.w/2,r=pl.x+BOX.w/2,t=pl.y-BOX.h,b=pl.y;
  const c0=Math.floor(l/TILE),c1=Math.floor((r-0.01)/TILE),r0=Math.floor(t/TILE),r1=Math.floor((b-0.01)/TILE);
  for(let row=r0;row<=r1;row++)for(let col=c0;col<=c1;col++){ if(!solidAt(col,row))continue;
    if(wheelchair && isWcRampRiser(col,row))continue; // cadeirante: degrau com rampa não é parede — a rampa guia o Y
    const tl=col*TILE;
    if(pl.vx>0)pl.x=tl-BOX.w/2-0.01; else if(pl.vx<0)pl.x=tl+TILE+BOX.w/2+0.01;
    pl.vx=0; return;
  }
}
function resolveY(pl){
  const l=pl.x-BOX.w/2,r=pl.x+BOX.w/2,t=pl.y-BOX.h,b=pl.y;
  const c0=Math.floor(l/TILE),c1=Math.floor((r-0.01)/TILE),r0=Math.floor(t/TILE),r1=Math.floor((b-0.01)/TILE);
  for(let row=r0;row<=r1;row++)for(let col=c0;col<=c1;col++){ if(!solidAt(col,row))continue;
    const tt=row*TILE,type=tileAt(col,row);
    if(pl.vy>0){ pl.y=tt-0.01;
      if(type===5&&!wheelchair){ pl.vy = pl.easy ? -EASY.tramp : -(held(pl,'jump')?TUNE.trampMax:TUNE.trampBase); } // Fácil: quique suave. Cadeirante: sem quique (é elevador)
      else { pl.vy=0; pl.onGround=true; }
    } else if(pl.vy<0){ pl.y=tt+TILE+BOX.h+0.01; pl.vy=0; }
    return;
  }
}
function triggerLava(pl){
  if(pl.hurtTimer>0)return;
  coins=pickCoins(COIN_TARGET); rebuildCoins();
  players.forEach(p=>p.collected=0); collected=0; updateHud();
  sfx('hurt'); pl.hurtTimer=60; pl.vy=-10; pl.vx=(rnd()<0.5?-1:1)*5;
  srAlert('Cuidado! Tocou na lava. As moedas voltaram para posições aleatórias.');
}
function stepPlayer(pl,dt){
  if(pl.quiz||pl.quit)return; // P1 em desafio; ou jogador que abandonou (tela preta)
  const run=held(pl,'run') && !pl.easy && !pl.toggleMove && (!caneOn(pl)||!!pl.runCane), turbo=pl.activePower==='turbo'; // cego só corre com a bengala de corrida
  let dir;
  if(pl.toggleMove){ // movimento por alternância (1 dedo): tocar trava a direção; segurar acelera
    if(pl.leftEdge)  pl.walkDir = pl.walkDir===-1?0:-1;   // toque inverte/para
    if(pl.rightEdge) pl.walkDir = pl.walkDir=== 1?0: 1;
    dir=pl.walkDir;
    const holding=(dir===-1&&held(pl,'left'))||(dir===1&&held(pl,'right'));
    pl.vx=dir*TUNE.hWalk*(holding?2/3:1/3);               // segurando = 2/3 · travado = 1/3
  } else {
    dir=(held(pl,'right')?1:0)-(held(pl,'left')?1:0); // Fácil: sem correr
    pl.vx=dir*(pl.easy?TUNE.hWalk*EASY.speed:(run?(turbo?TUNE.hTurbo:TUNE.hRun):TUNE.hWalk)); // E18: super-corrida (turbo); Fácil: andar ×0.7
  }
  if(dir!==0)pl.facing=dir; pl.leftEdge=false; pl.rightEdge=false;
  const feat=sampleFeatures(pl); pl.inWater=feat.water; pl.onLadder=feat.ladder;
  if(pl.hurtTimer>0)pl.hurtTimer-=dt;
  if(feat.lava && !pl.easy && !wheelchair) triggerLava(pl); // Fácil e cadeirante: imunidade (cadeirante: lava vira chão)
  if(pl.jumpEdge)pl.jumpBuffer=7; else if(pl.jumpBuffer>0)pl.jumpBuffer--;
  // E18: ventosa (homem-aranha) — gruda na parede ao apertar Correr no ar; solta com Pular
  if(pl.clinging && (pl.onLadder||pl.inWater||pl.activePower!=='wallcling' || pl.onGround || clingSides(pl).D)) pl.clinging=false; // E18d: pés numa superfície estável (sólido logo abaixo) ENCERRAM; pendurado no teto (pés p/ cima) ou na parede alta continua
  if(pl.activePower==='wallcling' && !pl.clinging && pl.runEdge && !pl.onGround && !pl.onLadder && !pl.inWater && firstClingSide(pl)){ pl.clinging=true; pl.clingN=firstClingSide(pl); pl.vy=0; pl.vx=0; pl.jumpBuffer=0; sfx('power'); srSay('Modo aranha! Engatinha em paredes e teto; contorna quinas. Correr solta.'); }
  else if(pl.clinging && pl.runEdge){ pl.clinging=false; sfx('power'); srSay('Soltou da superfície.'); } // E18b: CANCELA só com Correr (não com Pular); a caixa não larga a superfície antes disso
  if(!pl.clinging) pl.clingN=null;
  // TROCAR PODER / SONAR: tap curto no swap = troca poder; SEGURAR o swap ou o acorde swap+especial = SONAR (F3).
  const doSwap=()=>{ if(!pl.owned.length)return; const seq=['off',...pl.owned]; let idx=seq.indexOf(pl.activePower); pl.activePower=seq[(idx+1)%seq.length];
    pl.clinging=false; pl.flying=false; sfx('power'); showPower(pl); srSay(pl.activePower==='off'?'Sem poder ativo.':(POWER_MSG[pl.activePower]||'Poder ativado!')); };
  const swapNow=held(pl,'swap');
  if(swapNow){ pl._swapT+=dt;
    if(!pl._swapSonar && (pl._swapT>18 || held(pl,'especial'))){ pl._swapSonar=true; sonar(pl); } // segurar ~0,3s OU acorde swap+especial
  } else { if(pl._swapDown && !pl._swapSonar) doSwap(); pl._swapT=0; pl._swapSonar=false; } // soltou após tap curto → troca
  pl._swapDown=swapNow;
  // ESPECIAL: ação ainda não implementada (stub — apenas registra o gatilho)
  if(pl.specialEdge){ /* TODO: ação especial por poder/contexto */ }
  pl.jumpEdge=false; pl.runEdge=false; pl.swapEdge=false; pl.specialEdge=false;
  // E16c: voo é ALTERNADO pelo Pulo NO AR (com o poder ativo): pula no ar → liga; pula voando → desliga.
  // Tocar o solo ou a água também encerra. (Antes ligava ao coletar; agora exige o pulo no ar.)
  if(pl.activePower==='fly' && pl.jumpBuffer>0 && !pl.onGround){ pl.flying=!pl.flying; pl.jumpBuffer=0; sfx('power'); srSay(pl.flying?'Voo ativado! Cima/Baixo sobem e descem; Pular encerra.':'Voo encerrado.'); }
  if(pl.flying && (pl.onGround||pl.inWater||pl.activePower!=='fly')) pl.flying=false;
  let fired=false;
  if(pl.clinging){
    const sp=TUNE.climbSpeed; // E18c: movimento TANGENTE à face; a caixa fica colada até cancelar com Correr
    if(pl.clingN==='R')pl.facing=1; else if(pl.clingN==='L')pl.facing=-1;   // E18e: ALPINISMO — vira de frente PARA a parede
    if(pl.clingN==='U'||pl.clingN==='D'){ pl.vy=0; const h=held(pl,'left')?-1:held(pl,'right')?1:0; pl.vx=h*sp; if(h)pl.facing=h; } // teto/chão: anda na horizontal
    else { pl.vx=0; pl.vy = held(pl,'up')?-sp : held(pl,'down')?sp : 0; }                                        // parede: sobe/desce
  } else if(pl.onLadder){
    pl.vy=0;
    if(wheelchair){ // ELEVADOR: toque ↑/↓ = viaja sozinho até a parada segura (topo/base); andar p/ L/R numa parada sai
      const s=elevAt(pl);
      if(s){ if(held(pl,'up')&&s.yTop<pl.y-0.5) pl.elevTarget=s.yTop; else if(held(pl,'down')&&s.yBottom>pl.y+0.5) pl.elevTarget=s.yBottom;
        if((held(pl,'left')||held(pl,'right'))){ const col=held(pl,'right')?s.xMax+1:s.xMin-1; if(surfTop(col,Math.floor(pl.y/TILE))) pl.elevTarget=null; } }
      if(pl.elevTarget!=null){ const dy=pl.elevTarget-pl.y;
        if(Math.abs(dy)<=ELEV_SPEED){ pl.y=pl.elevTarget; pl.vy=0; pl.elevTarget=null; } else pl.vy=Math.sign(dy)*ELEV_SPEED; }
    } else {
      if(held(pl,'up'))pl.vy=-TUNE.climbSpeed; else if(held(pl,'down'))pl.vy=TUNE.climbSpeed;
      if(pl.jumpBuffer>0){ pl.vy=(pl.activePower==='ultrajump')?-TUNE.ultraJumpVel:jumpVel(pl,pl.activePower==='superjump'?9:5); pl.onLadder=false; pl.jumpBuffer=0; sfx('jump'); hideTips(); }
    }
  } else if(pl.flying){ // voo ATIVO: Cima sobe / Baixo desce / plana parado. Pular alterna (tratado acima)
    pl.waterStroke=0; const fs=turbo?3.9:2.6;
    if(held(pl,'up')) pl.vy=-fs; else if(held(pl,'down')) pl.vy=fs; else pl.vy*=0.7;
    pl.vy=Math.max(-fs,Math.min(fs,pl.vy));
  } else {
    const g = (pl.inWater?0.10:TUNE.gravity)*(pl.easy?EASY.grav:1); // Fácil: gravidade ×2/3
    if(!(pl.onGround&&pl.vy>=0)) pl.vy += g*dt;
    if(pl.easy && held(pl,'jump') && pl.vy>EASY.slowFall && !pl.inWater) pl.vy=EASY.slowFall; // Fácil: segurar pulo = flutua descendo
    if(pl.inWater){
      if(held(pl,'jump')){ if(pl.waterStroke<=0){ pl.vy-=run?TUNE.waterJumpRun:TUNE.waterJump; pl.waterStroke=TUNE.waterStrokeFrames; } }
      else pl.waterStroke=0;
      if(pl.waterStroke>0)pl.waterStroke-=dt;
      pl.vy=Math.min(pl.vy,TUNE.waterMaxFall);
    } else {
      pl.waterStroke=0;
      if(pl.onGround&&pl.jumpBuffer>0&&!wheelchair){ // E18: pulo encadeado (bunny-hop). Cadeirante: sem pulo.
        if(run && isBouncyGroundBelow(pl) && pl.jumpChain>0) pl.jumpChain=Math.min(pl.jumpChain+1,3); else pl.jumpChain=1;
        pl.vy = (pl.activePower==='ultrajump') ? -TUNE.ultraJumpVel : jumpVel(pl, pl.activePower==='superjump'?9:[0,5,8,9][pl.jumpChain]);
        pl.onGround=false; pl.jumpBuffer=0; fired=true; sfx('jump'); hideTips();
      }
      pl.vy=Math.min(pl.vy,TUNE.maxFall);
    }
  }
  // Proteção de borda (Fácil e alternância) — andar não derruba em fosso; só cai segurando ↓ (não vale na água/escada/voo/aranha)
  if((pl.easy||pl.toggleMove||wheelchair) && pl.onGround && pl.vx!==0 && !held(pl,'down') && !pl.inWater && !pl.onLadder && !pl.flying && !pl.clinging){
    const dirX=pl.vx>0?1:-1, leadX=pl.x+dirX*(BOX.w/2)+pl.vx*dt, leadTx=Math.floor(leadX/TILE), belowTy=Math.floor((pl.y+1)/TILE);
    const grounded = solidAt(leadTx,belowTy) || (wheelchair && solidAt(leadTx,belowTy+1)); // cadeirante: rampa = chão a até 1 tile abaixo (não é fosso)
    if(!grounded) pl.vx=0;
  }
  const _preX=pl.x, _preY=pl.y;
  pl.x+=pl.vx*dt; resolveX(pl);
  // Cadeirante: anda COLADO na superfície da rampa 45° (sobe e desce a diagonal desenhada), em vez do antigo empurrão
  const _ry = (wheelchair && !pl.onLadder && !pl.inWater && !pl.flying) ? rampSurfaceY(pl.x, pl.y) : null;
  if(_ry!=null && Math.abs(_ry-pl.y)<=TILE+4 && (_ry<pl.y || pl.onGround)){
    pl.y=_ry; pl.vy=0; pl.onGround=true;                 // superfície da rampa (subindo sempre; descendo só se já apoiado)
  } else {
    pl.onGround=false; pl.y+=pl.vy*dt; resolveY(pl);
  }
  if(pl.clinging) spiderReattach(pl,_preX,_preY); // E18c: mantém contato e contorna quinas (parede↔teto↔topo)
  if(pl.onGround && !fired){ if(++pl.groundIdle>10)pl.jumpChain=0; } else pl.groundIdle=0; // zera cadeia parado
  if(pl.onGround) pl.airTime=0; else pl.airTime+=dt; // E16: tempo no ar (estabiliza anim — onGround pisca ao repousar)
  // F2: passos por superfície · escada (madeira) · escalada (parede). Cadência = ritmo do andar/correr.
  if(!pl.inWater){
    if(caneOn(pl)){ if(pl.airTime<=5){ // modo cego: chão ESTÁVEL (coyote) evita o flicker do onGround
      if(dir!==0){ pl.caneDist=(pl.caneDist||0)+Math.abs(pl.vx*dt); if(pl.caneDist>=caneBlockPx()){ pl.caneDist=0; caneTap(pl); } } // ANDANDO: batida por DISTÂNCIA
      else { pl.caneDist=0; if(held(pl,'run')){ pl.stepT+=dt; if(pl.stepT>=25){ pl.stepT=0; caneTap(pl); } } else pl.stepT=99; } } } // PARADO: sem batida; segurar corrida = sondagem (batida no chão à frente)
    else if(pl.onGround && dir!==0){ const cad=(held(pl,'run')&&!pl.easy&&!pl.toggleMove)?11:17; pl.stepT+=dt; if(pl.stepT>=cad){ pl.stepT=0; const m=surfaceUnder(pl); if(m)noiseHit(m); } } } // normal: passo no chão sob os pés
  else if(pl.onLadder && pl.vy!==0){ pl.stepT+=dt; if(pl.stepT>=20){ pl.stepT=0; noiseHit('madeira'); } }
  else if(pl.clinging && (pl.vx!==0||pl.vy!==0)){ pl.stepT+=dt; if(pl.stepT>=16){ pl.stepT=0; noiseHit('parede'); } }
  else if(pl.inWater && caneOn(pl)){ waterNav(pl); } // NADO CEGO: guia por contato (paredes/chão/superfície-cordas)
  else pl.stepT=99; // parado → próximo passo soa logo ao recomeçar
  // F3: guarda de beirada — bipa ao caminhar em direção a um fosso (só quando a visão está comprometida: blind/baixa visão)
  if(needsAudioCues(pl) && pl.onGround && dir!==0 && !pl.inWater && !pl.onLadder && !pl.flying && !pl.clinging){
    const leadTx=Math.floor((pl.x+dir*(BOX.w/2+TILE*0.5))/TILE), belowTy=Math.floor((pl.y+1)/TILE);
    if(!solidAt(leadTx,belowTy)){ pl.guardT+=dt; if(pl.guardT>=9){ pl.guardT=0; tonePan(760,0.06,'guard',panFor((leadTx+0.5)*TILE,pl),0.16,'square',playerCtx(pl)); } } else pl.guardT=99;
  } else pl.guardT=99;
  if(pl.y-BOX.h>WORLD_PX_H+40){ pl.x=SPAWN_X; pl.y=SPAWN_Y; pl.vx=pl.vy=0; }
  // coletar (P1 abre quiz nos modos didáticos; MP é Lúdico). Fácil: hitbox de coleta +4px por lado.
  const pad=pl.easy?EASY.pad:0;
  const box={x:pl.x-BOX.w/2-pad,y:pl.y-BOX.h-pad,w:BOX.w+2*pad,h:BOX.h+2*pad};
  coins.forEach((cn,i)=>{ if(cn.taken||cn.owner!==pl.i)return; // Lote C: só coleta os itens da SUA cor
    const big=(MODE!=='ludico'); const sz=big?15:9, ox=big?3:0;
    if(box.x<cn.x+sz-ox&&box.x+box.w>cn.x-ox&&box.y<cn.y+sz-ox&&box.y+box.h>cn.y-ox){
      if(MODE==='somasub'&&cn.shape){ if(pl===player&&!player.quiz) openQuiz(i,cn.shape); }
      else if(MODE==='silabas'&&cn.letter){ if(pl===player&&!player.quiz) openSilabas(i,cn.letter); }
      else { takeCoin(cn); coinSprites[i].visible=false; pl.collected++; if(pl===player)collected=pl.collected; sfx('coin'); // some p/ todas as telas (item tem 1 dono)
        updateHud(); { const msg=(numPlayers>1?`Jogador ${pl.i+1}: `:'')+`Moeda ${pl.collected} de ${COIN_TARGET}.`; srSay(msg); narrate(msg); }
        if(pl.collected>=COIN_TARGET)win(pl); }
    }});
  // E12: power-ups + chave (por jogador) e portão (compartilhado)
  powerups.forEach(pu=>{ if(puTaken(pu,pl.i))return;
    if(box.x<pu.x+12 && box.x+box.w>pu.x && box.y<pu.y+12 && box.y+box.h>pu.y){
      takePu(pu,pl.i); if((numPlayers<=1||pu.kind==='key') && pu.sprite)pu.sprite.visible=false; const who=numPlayers>1?`Jogador ${pl.i+1}: `:''; // chave: some p/ todos; demais: por viewport (no draw)
      if(pu.kind==='key'){ pl.hasKey=true; sfx('key'); srAlert(who+'pegou a chave. Toque no portão para abri-lo.'); } // chave individual: só quem pegou fica com ela (mas o portão, aberto, vale p/ todos)
      else if(pu.kind==='runcane'){ pl.runCane=true; sfx('power'); const pm=who+'Bengala de corrida! Agora dá para correr — segure Correr.'; srSay(pm); narrate(pm); } // cego: habilita correr (bengala com roda)
      else { if(!pl.owned.includes(pu.kind))pl.owned.push(pu.kind); pl.activePower=pu.kind; pl.clinging=false; pl.flying=false; sfx('power'); showPower(pl); const pm=who+(POWER_MSG[pu.kind]||'Poder ativado!'); srSay(pm+' (Trocar poder cicla entre os coletados.)'); narrate(pm); } // entra no inventário; ativo = o último pego
    }});
  if(gate && !gateOpen && pl.hasKey){ // portão (vários tiles) abre se o portador da chave o toca (margem: vale por cima/ao lado)
    const m=4; for(const gt of gate){ const X=gt.tx*TILE, Y=gt.ty*TILE;
      if(box.x<X+TILE+m && box.x+box.w>X-m && box.y<Y+TILE+m && box.y+box.h>Y-m){ gateOpen=true; rebuildExtras(); sfx('gate'); doorSound('madeira'); srAlert('Portão aberto!'); break; } }
  }
  // animação por frames (E15). 'moving' baseado no INPUT (direção segurada), NÃO em vx — a colisão
  // zera vx por frames e isso resetava o ciclo (só apareciam 2 quadros). Assim os 8 quadros tocam contínuos.
  // E16: estado aéreo ESTÁVEL — subindo (vy<0) entra na hora; cair/sair de borda só após coyote-time.
  // Evita o flicker walk↔jump no pouso (onGround pisca 1 frame ao repousar). 'grounded' p/ anim.
  const COYOTE=5, grounded = pl.airTime<=COYOTE;
  const airborne = !pl.clinging && ((pl.vy<0 && !pl.onGround) || !grounded);
  const moving=(dir!==0) && grounded && !pl.clinging;
  pl.walking = moving && !pl.inWater && !pl.onLadder && !pl.flying; // andando no chão (para a bengala: só aparece andando)
  pl.running = pl.walking && held(pl,'run') && !!pl.runCane;        // correndo (bengala de corrida): só com o item
  pl.anim += dt;                                   // idle (1 quadro; clock contínuo)
  pl.walkAnim += dt;                               // clock do passo NUNCA reseta → ciclo de 8 sem reinício
  const II=TEX_IDLE;
  const wcFreeze = wheelchair || pl.rmWalk; // cadeirante: pernas paradas (sentado) — mesma via do movimento reduzido
  let tx; pl.idleNow=false;
  // E17: prioridade ventosa → escada → água → voo → aéreo(pulo) → andando → idle
  // movimento reduzido: pl.rmWalk congela TODA a locomoção (escalar, escada, nado, pulo) num quadro único
  if(pl.clinging){ const ceil=(pl.clingN==='U'); // E18f: teto e parede usam ciclos distintos
    const CL = ceil ? TEX_CLING_CEIL : TEX_CLING_WALL;
    if(!pl.rmWalk && (pl.vx!==0||pl.vy!==0)) pl.climbFrame=(Math.floor(pl.walkAnim/ANIM.clingHold))%CL.length; // só avança ao mover; parado MANTÉM o quadro
    tx = CL[(pl.rmWalk?0:(pl.climbFrame||0))%CL.length]; }
  else if(pl.onLadder){ const CB=TEX_CLIMB;
    if(wheelchair){ tx = II[0]; }                                  // ELEVADOR cadeirante: pose PARADA (idle), não de escada
    else { const climbing=(pl.vy!==0)&&!pl.rmWalk; tx = climbing ? CB[Math.floor(pl.walkAnim/ANIM.climbHold)%CB.length] : CB[0]; } }
  else if(pl.inWater){ const stroking=((dir!==0)||held(pl,'jump'))&&!wcFreeze; // movendo = braçada+pernas; parado/congelado/cadeirante = pernas paradas
    const SW = stroking ? TEX_SWIM : TEX_SWIMIDLE;
    tx = wcFreeze ? SW[0] : SW[Math.floor(pl.walkAnim/ANIM.swimHold)%SW.length]; }
  else if(pl.flying)              tx = TEX_FLY;
  else if(airborne){ if(wcFreeze) tx = wheelchair ? II[0] : TEX_JUMP_UP; // cadeirante caindo = pose neutra sentado; congelado = pulo num quadro
    else tx = pl.vy<0 ? TEX_JUMP_UP : TEX_JUMP_DOWN; }           // subindo: pernas recolhidas / caindo: estendidas
  else if(moving){
    if(wcFreeze){ tx = II[0]; }                                    // cadeirante/movimento reduzido: anda sem ciclo de passos (pose neutra)
    else { const running=held(pl,'run');                         // E19: correr (Correr segurado) ≠ andar — passada/cadência distintas
      const M = running ? TEX_RUN : TEX_WALK;
      const hold = running ? ANIM.runHold : ANIM.walkHold;
      tx = M[Math.floor(pl.walkAnim/hold)%M.length]; } }
  else { pl.idleNow=true; pl.idleTime+=dt;                       // E20: parado → respira; após flavorDelay, toca uma gracinha
    if(!pl.rmFlavor){                                             // gracinhas (toggle próprio — há quem se incomode)
      if(pl.flavor<0 && pl.idleTime>ANIM.flavorDelay){ pl.flavor=Math.floor(rnd()*FLAVORS.length); pl.flavorT=0; }
      if(pl.flavor>=0){ const F=FLAVORS[pl.flavor]; const step=Math.floor(pl.flavorT/F.hold); pl.flavorT+=dt;
        if(step>=F.seq.length){ pl.flavor=-1; pl.idleTime=0; } else { tx=F.tex[F.seq[step]]; } }
    } else pl.flavor=-1;
    if(pl.flavor<0) tx = pl.rmBreath ? II[0] : II[Math.floor(pl.anim/ANIM.idleHold)%II.length]; } // respiração: congela (quadro 0) ou cicla
  if(!pl.idleNow){ pl.idleTime=0; pl.flavor=-1; }                 // saiu do idle → zera gracinha
  pl._tx=tx;                                                     // quadro base (cor) p/ recolor por viewport
  if(pl.sprite) pl.sprite.texture=playerVizTex(tx, pl.viz);      // solo/default; no MP o draw troca por viewport
}
function update(dt){
  if(ended||phase!=='playing')return; // E14: congelado no título e na pausa
  for(const pl of players) stepPlayer(pl,dt);
  // E1 (corrigido): revela a área secreta ENQUANTO houver jogador dentro e RE-ESCURECE ao sair.
  // Não é inversão — só mostra o que estava escondido e some de novo ao deixar o ambiente.
  for(const reg of darkRegions){
    let occ=false;
    for(const pl of players){
      const tx0=Math.floor((pl.x-BOX.w/2)/TILE),tx1=Math.floor((pl.x+BOX.w/2-0.01)/TILE);
      const ty0=Math.floor((pl.y-BOX.h)/TILE),ty1=Math.floor((pl.y-0.01)/TILE);
      for(let ty=ty0;ty<=ty1&&!occ;ty++)for(let tx=tx0;tx<=tx1;tx++){ if(reg.set.has(tx+','+ty)){occ=true;break;} }
      if(occ)break;
    }
    const target=occ?0:1, step=0.08*dt;
    if(reg.gfx.alpha!==target){
      reg.gfx.alpha = target>reg.gfx.alpha ? Math.min(target,reg.gfx.alpha+step) : Math.max(target,reg.gfx.alpha-step);
      reg.gfx.visible = reg.gfx.alpha>0.001;
    }
    if(occ && !reg.announced){ reg.announced=true; srSay('Área secreta revelada.'); }
    else if(!occ && reg.gfx.alpha>=1) reg.announced=false; // re-anuncia na próxima entrada
  }
}
function placeCam(pl){
  let camX=pl.x-LOGICAL_W/2, camY=(pl.y-BOX.h/2)-LOGICAL_H/2;
  camX=Math.max(0,Math.min(camX,WORLD_PX_W-LOGICAL_W)); camY=Math.max(0,Math.min(camY,WORLD_PX_H-LOGICAL_H));
  camera.x=-Math.round(camX); camera.y=-Math.round(camY); updateParallax(camX,camY); return {camX,camY};
}
function draw(){
  for(const pl of players){ if(!pl.sprite)continue;
    pl.sprite.x=pl.x; pl.sprite.y=pl.y+1;
    pl.sprite.scale.set((pl.facing<0?-1:1), 1); // sem escala procedural (parecia mastigar) — respiração agora é por FRAMES
    pl.sprite.alpha = pl.hurtTimer>0 ? (Math.floor(pl.hurtTimer/4)%2?0.4:1) : 1;
  }
  drawElevators(elevLayer); // cadeirante: plataforma do elevador sob os pés (largo/fino)
  caneLayer.clear(); // modo cego: bengala SÓ andando (corrida = bengala de roda); nada parado/nadando/voando/escada
  for(const pl of players){ if(!caneOn(pl)||!pl.sprite||!pl.sprite.visible)continue;
    if(pl.running) drawRunCane(caneLayer,pl); else if(pl.walking) drawCane(caneLayer,pl); }
  chairLayer.clear(); // cadeirante: desenha a cadeira nos jogadores (exceto nadando/voando)
  if(wheelchair){ for(const pl of players){ if(pl.sprite&&pl.sprite.visible&&!pl.inWater&&!pl.flying) drawChair(chairLayer,pl); } }
  easyHitbox.clear(); // Fácil: hitbox de coleta tolerante (retângulo translúcido) — só para os jogadores em Fácil
  const pad=EASY.pad; for(const pl of players){ if(!pl.easy)continue;
    easyHitbox.lineStyle(1,0xffffff,0.45); easyHitbox.beginFill(0xffffff,0.10);
    easyHitbox.drawRect(pl.x-BOX.w/2-pad, pl.y-BOX.h-pad, BOX.w+2*pad, BOX.h+2*pad); easyHitbox.endFill(); }
  if(numPlayers<=1){
    const {camX,camY}=placeCam(players[0]);
    markSeen(camX,camY); if(mmDirty) redrawMinimap();
    mmPlayer.clear(); mmPlayer.beginFill(0xffd23f,1);
    mmPlayer.drawRect((players[0].x/TILE)*MM_SCALE-1,((players[0].y-BOX.h/2)/TILE)*MM_SCALE-1,2.6,2.6); mmPlayer.endFill();
  } else {
    // Otimização: se TODOS estão no mesmo modo (caso comum), troca as texturas UMA vez; senão, por viewport.
    const v0=players[0].viz, allSame=players.every(p=>p.viz===v0), anyOverlay=players.some(p=>{const m=VIZ_BY_KEY[p.viz];return m&&m.kind==='lowvision';});
    if(allSame) applySharedTextures(v0);
    for(let i=0;i<numPlayers;i++){ const viz=players[i].viz;
      if(!allSame) applySharedTextures(viz);                      // só troca por viewport quando os modos diferem
      for(let j=0;j<coinSprites.length;j++){ const s=coinSprites[j]; if(!s)continue; const cn=coins[j]; s.visible=!cn.taken; s.alpha=(cn.owner===i)?1:0.4; } // Lote C: item alheio esmaecido (cor do dono) p/ ajudar a achar; o seu, cheio
      for(const pu of powerups){ if(pu.sprite)pu.sprite.visible=!puTaken(pu,i); }                            // chave some p/ todos; demais são por jogador
      placeCam(players[i]); app.renderer.render(camera,{renderTexture:vpTex[i]});
      if(anyOverlay) renderVpOverlay(i,viz);                      // passada extra só se algum jogador está em baixa visão
    }
  }
  drawWeather(); // chuva/clarão em tela-espaço, sobre tudo
  updateGameHud(); // HUD por jogador (moedas + poder) em DOM sobreposto (alta definição)
}

/* ===================== Soma-Sub: quiz (DOM, acessível) ===================== */
function openQuiz(coinIndex,shapeId){
  const op=rnd()<0.5?'+':'-'; let a,b,answer;
  if(op==='+'){a=randInt(0,9);b=randInt(0,10-a);answer=a+b;} else {a=randInt(0,10);b=randInt(0,a);answer=a-b;}
  const pool=[answer]; while(pool.length<9){const n=randInt(0,10); if(!pool.includes(n))pool.push(n);}
  player.quiz={kind:'somasub',coinIndex,shape:shapeId,a,b,op,answer,choices:shuffle(pool),sel:0,tries:0,revealed:false};
  player.vx=0;player.vy=0;
  srSay(`${somaSubName(shapeId)}. Quanto é ${a} ${op==='+'?'mais':'menos'} ${b}?`);
  renderQuiz();
}
function openSilabas(coinIndex,letter){
  if(blindMode){ openBraille(coinIndex,letter); return; } // E8: ditado de Braille
  const pool=SILABAS_WORDS.filter(w=>w.w[0]===letter);
  const item=pool.length?pool[randInt(0,pool.length-1)]:SILABAS_WORDS[randInt(0,SILABAS_WORDS.length-1)];
  const correct=item.s.slice(), distract=[];
  for(const sy of shuffle(SILABA_POOL)){ if(distract.length>=7)break; if(!correct.includes(sy)&&!distract.includes(sy))distract.push(sy); }
  player.quiz={kind:'silabas',coinIndex,letter,word:item.w,emoji:item.e,correct,options:shuffle(correct.concat(distract)),boxes:[null,null],sel:0,tries:0,revealed:false};
  player.vx=0;player.vy=0;
  srSay(`Letra ${disp(letter)}. Monte a palavra: ${item.w}.`);
  renderQuiz();
}
function placeSilaba(sy){ const q=player.quiz; if(!q)return; const idx=q.boxes[0]===null?0:(q.boxes[1]===null?1:-1); if(idx<0)return; q.boxes[idx]=sy; sfx('place'); srSay(disp(sy)); renderQuiz(); }
function eraseLastSilaba(){ const q=player.quiz; if(!q)return; if(q.boxes[1]!==null)q.boxes[1]=null; else if(q.boxes[0]!==null)q.boxes[0]=null; renderQuiz(); }
// E8: ditado de Braille (modo pessoa cega) — dita os pontos da cela por letra
function openBraille(coinIndex,letter){
  const pool=SILABAS_WORDS.filter(w=>w.w[0]===letter);
  const item=pool.length?pool[randInt(0,pool.length-1)]:SILABAS_WORDS[randInt(0,SILABAS_WORDS.length-1)];
  const cells=item.w.split('').map(ch=>({l:ch,dots:BRAILLE[ch]||[],text:brailleText(ch)}));
  player.quiz={kind:'braille',coinIndex,letter,word:item.w,emoji:item.e,cells,revealed:false};
  player.vx=0;player.vy=0; renderQuiz(); announceBraille();
}
function announceBraille(){ const q=player.quiz; if(!q||q.kind!=='braille')return;
  srAlert(`${q.word}. `+q.cells.map(c=>`${c.l}: ${c.text}.`).join(' ')+' Pule para coletar.'); }
function somasubHtml(q){
  const opTxt=q.op==='+'?'+':'−';
  const choices=q.choices.map((n,i)=>`<button class="quiz-choice${i===q.sel?' sel':''}${q.revealed&&n===q.answer?' reveal':''}" data-i="${i}" type="button">${n}</button>`).join('');
  const hint=q.revealed?'Resposta certa em destaque. Pule (L) para seguir.':(q.tries>0?'Quase! Tente de novo.':'Escolha e pule (L) para confirmar.');
  return `<div class="quiz-box quiz-box--math" role="dialog" aria-modal="true" aria-label="Conta de Soma-Sub"><div class="quiz-shape">${somaSubName(q.shape)}</div><div class="quiz-prob">${q.a} ${opTxt} ${q.b} = ?</div><div class="quiz-grid">${choices}</div><div class="quiz-hint">${hint}</div></div>`;
}
function silabaHtml(q){
  const N=q.options.length;
  const boxes=`<div class="silaba-boxes">`+q.boxes.map(b=>`<span class="silaba-box${b!==null?' filled':''}">${b!==null?disp(b):''}</span>`).join('')+`</div>`;
  const opts=q.options.map((sy,i)=>`<button class="quiz-choice${i===q.sel?' sel':''}" data-i="${i}" type="button">${disp(sy)}</button>`).join('');
  const acts=`<button class="quiz-choice${q.sel===N?' sel':''}" data-i="${N}" type="button">Apagar</button><button class="quiz-choice${q.sel===N+1?' sel':''}" data-i="${N+1}" type="button">OK</button>`;
  const hint=q.revealed?`A palavra é "${disp(q.word)}". Pule (L) para seguir.`:'Monte a palavra. Pule (L) coloca/confirma.';
  return `<div class="quiz-box" role="dialog" aria-modal="true" aria-label="Monte a palavra"><div class="quiz-emoji" aria-label="${q.word}">${q.emoji}</div><div class="quiz-letter">letra: ${disp(q.letter)}</div>${boxes}<div class="quiz-grid">${opts}</div><div class="silaba-actions">${acts}</div><div class="quiz-hint">${hint}</div></div>`;
}
function brailleHtml(q){
  const cells=q.cells.map(c=>{
    const dots=[1,4,2,5,3,6].map(n=>`<span class="bdot${c.dots.includes(n)?' on':''}"></span>`).join('');
    return `<div class="bcell"><div class="bcell-grid">${dots}</div><div class="bcell-l">${disp(c.l)}</div></div>`;
  }).join('');
  return `<div class="quiz-box" role="dialog" aria-modal="true" aria-label="Braille da palavra ${q.word}"><div class="quiz-emoji" aria-hidden="true">${q.emoji}</div><div class="quiz-letter">palavra: ${disp(q.word)}</div><div class="bcells">${cells}</div><div class="quiz-hint">Ouça os pontos. Pule (L) para coletar. (Cima repete)</div></div>`;
}
function renderQuiz(){
  const q=player.quiz, ov=$('#quiz'); if(!ov)return; if(!q){ov.hidden=true;return;}
  ov.innerHTML = q.kind==='braille' ? brailleHtml(q) : q.kind==='silabas' ? silabaHtml(q) : somasubHtml(q);
  ov.querySelectorAll('.quiz-choice').forEach(b=>b.addEventListener('click',()=>{ if(player.quiz){player.quiz.sel=+b.dataset.i; quizConfirm();} }));
  ov.hidden=false;
}
function quizMove(d){ const q=player.quiz; if(!q)return;
  const max = q.kind==='silabas' ? q.options.length+1 : q.choices.length-1;
  q.sel=Math.max(0,Math.min(max,q.sel+d)); renderQuiz();
  if(q.kind==='silabas'){ const N=q.options.length; srSay(q.sel<N?disp(q.options[q.sel]):(q.sel===N?'apagar':'ok')); }
  else srSay(String(q.choices[q.sel]));
}
function quizConfirm(){
  const q=player.quiz; if(!q)return;
  if(q.revealed){ respawnFigure(q.coinIndex); closeQuiz(); return; }
  if(q.kind==='braille'){ takeCoin(coins[q.coinIndex]); coinSprites[q.coinIndex].visible=false; player.collected++; collected=player.collected;
    sfx('coin'); srSay('Coletado!'); closeQuiz(); if(collected>=COIN_TARGET)win(); return; }
  if(q.kind==='silabas'){
    const N=q.options.length;
    if(q.sel<N){ placeSilaba(q.options[q.sel]); return; }
    if(q.sel===N){ eraseLastSilaba(); return; }
    if(q.boxes[0]===q.correct[0] && q.boxes[1]===q.correct[1]){
      takeCoin(coins[q.coinIndex]); coinSprites[q.coinIndex].visible=false; player.collected++; collected=player.collected;
      sfx('correct'); srSay('Acertou!'); closeQuiz(); if(collected>=COIN_TARGET)win();
    } else { q.tries++;
      if(q.tries>=2){ q.revealed=true; q.boxes=q.correct.slice(); srAlert(`A palavra é ${disp(q.word)}. Pule para seguir.`); }
      else { q.boxes=[null,null]; sfx('wrong'); srSay('Tente de novo.'); }
      renderQuiz();
    }
    return;
  }
  if(q.choices[q.sel]===q.answer){
    takeCoin(coins[q.coinIndex]); coinSprites[q.coinIndex].visible=false; player.collected++; collected=player.collected;
    sfx('correct'); srSay('Acertou!'); closeQuiz();
    if(collected>=COIN_TARGET)win();
  } else { q.tries++;
    if(q.tries>=2){q.revealed=true; srAlert(`A resposta é ${q.answer}. Pule para seguir.`);} else sfx('wrong'); srSay('Tente de novo.');
    renderQuiz();
  }
}
function closeQuiz(){ player.quiz=null; const ov=$('#quiz'); if(ov)ov.hidden=true; }
function respawnFigure(i){
  const occ=new Set(); coins.forEach((c,j)=>{ if(j!==i)occ.add(c.x+','+c.y); });
  for(const cand of shuffle(findCoinCandidates())){ const x=cand.tx*TILE+3,y=cand.ty*TILE+3;
    if(!occ.has(x+','+y)){ coins[i].x=x;coins[i].y=y;coins[i].taken=false; // dono (owner) preservado
      const s=coinSprites[i]; s.x=(MODE==='somasub')?x-3:x; s.y=(MODE==='somasub')?y-3:y; s.visible=true; return; } }
}

/* ===================== vitória ===================== */
function updateHud(){
  if(numPlayers<=1) $('#hud-coins').textContent=String(players[0].collected);
  else $('#hud-coins').textContent=players.map((p,i)=>`P${i+1}:${p.collected}`).join('  ');
}
function win(pl){ ended=true; if(captionsOn)showCaption('🔊 Vitória! 🎆'); playVictory(); $('#hud-objective').textContent='Concluído! 🎉';
  const who = numPlayers>1 ? `Jogador ${(pl?pl.i:0)+1} venceu! ` : '';
  $('#win-msg').textContent=`${who}Coletou as ${COIN_TARGET} moedas.`;
  $('#win-overlay').hidden=false; srAlert(`${who}Coletou as ${COIN_TARGET} moedas.`); narrate(`${who}Venceu! Coletou as ${COIN_TARGET} moedas.`); $('#btn-again').focus(); }
function restartGame(){
  closeQuiz();
  coins=pickCoins(COIN_TARGET);
  rebuildCoins();
  setupExtras(); // E12: re-posiciona power-ups + chave; portão volta a fechar
  darkRegions.forEach(r=>{ r.announced=false; r.gfx.alpha=1; r.gfx.visible=true; }); // re-escurece segredos
  collected=0; ended=false;
  players.forEach(resetPlayerState);
  updateHud();
  $('#hud-objective').textContent = numPlayers>1 ? `${numPlayers} jogadores — corrida pelas ${COIN_TARGET} moedas` : MODE==='somasub' ? 'Resolva 10 contas' : MODE==='silabas' ? 'Monte 10 palavras' : 'Colete 10 moedas';
  $('#win-overlay').hidden=true;
  const tp=$('#start-tips'); if(tp){ if(numPlayers>1){ tp.classList.add('hide'); } else { tp.classList.remove('hide'); clearTimeout(tipsTimer); tipsTimer=setTimeout(hideTips,8000); } }
  srSay(numPlayers>1 ? `${numPlayers} jogadores, cada um na sua tela. Corram pelas moedas.` : MODE==='somasub' ? 'Modo Soma-Sub. Toque nas figuras e resolva as contas.' : MODE==='silabas' ? 'Modo Sílabas. Toque nas letras e monte as palavras.' : 'Nova rodada. Colete 10 moedas.');
}
$('#btn-again').addEventListener('click',()=>{ restartGame(); $('#game-region').focus(); });
const MODE_LABELS={ludico:'🪙 Lúdico',somasub:'🔷 Soma-Sub',silabas:'🔤 Sílabas'};
const MODES=['ludico','somasub','silabas'];
function setMode(m){
  MODE=m; // modos liberados em qualquer nº de telas (quiz por jogador é tarefa à parte)
  const b=$('#opt-mode'); if(b){ b.textContent=MODE_LABELS[m]; b.setAttribute('aria-label','Modo: '+MODE_LABELS[m]+'. Toque para trocar.'); }
  restartGame(); $('#game-region').focus();
}
const optModeBtn=$('#opt-mode'); // botão único: cicla os 3 modos
if(optModeBtn)optModeBtn.addEventListener('click',()=>{
  const m=MODES[(MODES.indexOf(MODE)+1)%MODES.length]; setMode(m); srSay('Modo '+MODE_LABELS[m].replace(/^\S+\s/,'')+'.');
});
/* E11: nº de jogadores (1–4 telas lado a lado, simulação compartilhada) */
function setNumPlayers(n){
  n=Math.max(1,Math.min(4,n|0));
  if(n>players.length){ for(let i=players.length;i<n;i++){ const p=makePlayer(i); loadPlayerA11y(p,i); players.push(p); } }
  else if(n<players.length){ players.length=n; }
  player=players[0]; numPlayers=n;
  assignControls(); applyPadAssign(); ensureSprites();
  const TEL=['👤 1 tela','👥 2 telas','👨‍👧 3 telas','👨‍👩‍👧‍👦 4 telas'];
  const tb=$('#opt-telas'); if(tb){ tb.textContent=TEL[n-1]; tb.setAttribute('aria-label','Telas: '+n+'. Toque para trocar.'); }
  if(n>1) hideTouchControls(); // E13: várias telas → sem controle por toque (ambíguo)
  configureRender();
  if(typeof reapplyVizAll==='function') reapplyVizAll(); // solo: filtro/overlay/bolinha global; MP: limpa global + filtros por viewport
  restartGame(); layout(); $('#game-region').focus();
}
// Lote B: cabe N telas na janela atual? (piso k=2 ⇒ cada viewport ≥640×360). Espelha a conta do layout().
function fitsN(n){ const wrap=$('#stage-wrap'); if(!wrap)return true;
  const availW=(wrap.clientWidth||320)-(librasOpen?LIBRAS_RESERVE:0), availH=wrap.clientHeight||180;
  const cols=n<=1?1:(n<=2?n:2), rows=n<=2?1:2, baseW=320*cols, baseH=180*rows;
  return availW>=2*(baseW-10) && availH>=2*(baseH-10); }
// Celular/tablet: ponteiro grosso + sem hover (não dispara em notebook com touch). No mobile o jogo é 1 tela só.
function isMobile(){ try{ return matchMedia('(pointer:coarse)').matches && matchMedia('(hover:none)').matches; }catch(e){ return 'ontouchstart' in window; } }
// Ativa dinamicamente N telas (Alt+1/2/3/4). Só cresce se couber; senão anuncia e bloqueia. Reinicia a rodada.
function activateScreens(n){ n=Math.max(1,Math.min(4,n|0));
  if(isMobile() && n>1){ srAlert('No celular o jogo roda em uma tela só.'); return; } // B2: mobile = 1 jogador
  if(n===numPlayers){ srSay(n>1?(n+' telas já ativas.'):'1 tela.'); return; }
  if(n>numPlayers && !fitsN(n)){ srAlert('Não cabem '+n+' telas nesta janela — cada tela precisa de ao menos 640×360. Aumente a janela ou use tela cheia.'); return; }
  setNumPlayers(n); srSay(n>1?(n+' telas ativas — nova rodada.'):'1 tela — nova rodada.'); }

/* ===================== B3: entrada de gamepad ===================== */
// Reatribui os controles: P1 (índice 0) = teclado (pad -1); P2.. = gamepads na ordem de entrada. Chamado em setNumPlayers.
function applyPadAssign(){ players.forEach((p,i)=>{ p.pad = (i===0) ? -1 : (joinedPads[i-1]!==undefined ? joinedPads[i-1] : -1); }); }
// Reseta UM jogador ao spawn (rodada nova só na tela dele). Compartilha os campos com o restartGame.
function resetPlayerState(p,i){ p.x=SPAWN_X+i*22; p.y=SPAWN_Y; p.vx=p.vy=0; p.hurtTimer=0; p.collected=0; p.jumpBuffer=0; p.waterStroke=0; p.onLadder=false; p.quiz=null; p.quit=false; p.runCane=false; p.activePower='off'; p.owned=[]; p.swapEdge=false; p.specialEdge=false; p.hasKey=false; if(i===0)showPower(p); p.jumpChain=0; p.groundIdle=0; p.clinging=false; p.clingN=null; p.flying=false; p.idleTime=0; p.flavor=-1; if(p.sprite){p.sprite.alpha=1;p.sprite.visible=true;} }
function respawnPlayer(k){ const p=players[k]; if(!p)return; resetPlayerState(p,k); if(typeof updateGameHud==='function')updateGameHud(); srSay('Jogador '+(k+1)+' recomeçou nesta tela.'); }
// Gamepad não-atribuído aperta 0/START → abre nova tela já com aquele controle (o teclado segue no P1).
function padTryJoin(gi){
  if(isMobile()) return;
  if(numPlayers>=4){ srAlert('Já são 4 jogadores.'); return; }
  if(!fitsN(numPlayers+1)){ srAlert('Não cabe mais uma tela nesta janela para o novo controle.'); return; }
  if(joinedPads.indexOf(gi)<0) joinedPads.push(gi);
  activateScreens(numPlayers+1); srSay('Controle entrou como Jogador '+numPlayers+'.'); }
// Mapa botão/eixo → ação (layout padrão Gamepad API: 0=pulo/sim · 1=especial/não · 3=troca-poder · D-pad 12-15 · anal.esq · RB/RT=correr).
function padActions(gp){ const b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed), ax=i=>gp.axes[i]||0;
  return { left:ax(0)<-PAD_DEAD||b(14), right:ax(0)>PAD_DEAD||b(15), up:ax(1)<-PAD_DEAD||b(12), down:ax(1)>PAD_DEAD||b(13),
    jump:b(0), run:b(5)||b(7), swap:b(3), especial:b(1), _start:b(0)||b(9) }; }
function pollPads(){ const pads=navigator.getGamepads?navigator.getGamepads():[]; if(!pads)return;
  for(const gp of pads){ if(!gp)continue; const gi=gp.index; const cur=padActions(gp); const prev=padPrevAct[gi]||{};
    const startEdge = cur._start && !padPrevStart[gi]; padPrevStart[gi]=cur._start; padCur[gi]=cur;
    if(phase==='playing'){ const owner=players.findIndex(p=>p.pad===gi);
      if(owner<0){ if(startEdge) padTryJoin(gi); }                       // livre → entra
      else if(players[owner].quit){ if(startEdge) respawnPlayer(owner); } // tela abandonada → recomeça (aviso e)
      else { const p=players[owner];                                     // ativo → alimenta o input do jogador
        if(cur.jump&&!prev.jump)p.jumpEdge=true;
        if(cur.run&&!prev.run&&!p.easy)p.runEdge=true;
        if(cur.left&&!prev.left)p.leftEdge=true;
        if(cur.right&&!prev.right)p.rightEdge=true;
        if(cur.swap&&!prev.swap)p.swapEdge=true;
        if(cur.especial&&!prev.especial)p.specialEdge=true; } }
    padPrevAct[gi]=cur; } }
addEventListener('gamepaddisconnected',(e)=>{ try{ const owner=players.findIndex(p=>p.pad===e.gamepad.index); if(owner>=0){ players[owner].quit=true; releaseKey(players[owner]); srAlert('Controle do Jogador '+(owner+1)+' desconectou — tela em espera.'); } delete padCur[e.gamepad.index]; }catch(err){} });

const optTelasBtn=$('#opt-telas'); // botão único: cicla 1→2→3→4 telas
if(optTelasBtn)optTelasBtn.addEventListener('click',()=>{ setNumPlayers((numPlayers%4)+1); srSay(numPlayers+(numPlayers>1?' telas.':' tela.')); });
// Botão único de LETRAS: ABC (padrão) → abc → Braille
const LETRA=[
  {lbl:'🔠 ABC',     caso:'upper', blind:false, say:'Letras maiúsculas.'},
  {lbl:'🔡 abc',     caso:'lower', blind:false, say:'Letras minúsculas.'},
  {lbl:'⠿ Braille',  caso:'lower', blind:true,  say:'Modo Braille: no Sílabas, o jogo dita os pontos da cela.'},
];
let letraIdx=0;
function applyLetra(announce){ const s=LETRA[letraIdx]; letterCase=s.caso; blindMode=s.blind;
  const b=$('#opt-letra'); if(b){ b.textContent=s.lbl; b.classList.toggle('is-on',letraIdx>0); b.setAttribute('aria-pressed',String(letraIdx>0)); }
  document.querySelectorAll('.pm-letra').forEach(x=>{ x.textContent=s.lbl; }); // ABC nos menus de pausa por tela
  if(typeof rebuildCoins==='function' && MODE==='silabas') rebuildCoins();
  if(player&&player.quiz) renderQuiz();
  if(announce) srSay(s.say);
}
const optLetraBtn=$('#opt-letra'); if(optLetraBtn)optLetraBtn.addEventListener('click',()=>{ letraIdx=(letraIdx+1)%LETRA.length; applyLetra(true); });
applyLetra(false); // estado inicial = ABC (maiúsculas, padrão)
// E9: toggles de Som / Legendas / Fácil
function toggleBtn(b,on){ b.classList.toggle('is-on',on); b.setAttribute('aria-pressed',String(on)); }
const soundBtn=$('#opt-sound'), capBtn=$('#opt-captions'), facilBtn=$('#opt-facil');
if(soundBtn){ soundBtn.setAttribute('aria-haspopup','dialog'); soundBtn.addEventListener('click',openAudio); } // botão de áudio agora abre o mixer
if(capBtn) capBtn.addEventListener('click',()=>{ captionsOn=!captionsOn; toggleBtn(capBtn,captionsOn); srSay('Legendas '+(captionsOn?'ligadas.':'desligadas.')); });
let selMovPlayer=0; // jogador selecionado no painel Acessibilidade motora
if(facilBtn) facilBtn.addEventListener('click',()=>{ setEasy(selMovPlayer, !players[selMovPlayer].easy); });
function reflectFacil(){ const p=players[selMovPlayer], on=!!(p&&p.easy); if(facilBtn){ toggleBtn(facilBtn,on); facilBtn.textContent=on?'❚❚ Ligado':'▶ Desligado'; } reflectMovementBtn(); }
function reflectMovementBtn(){ const b=$('#opt-movement'); if(b)b.classList.toggle('is-on',players.some(p=>p.easy||p.toggleMove)); } // barra acende se QUALQUER jogador usa Fácil/alternância
function setEasy(i,on){ const p=players[i]; if(!p)return; p.easy=on; try{localStorage.setItem('incl_easy_p'+i,on?'1':'0');}catch(e){} reflectFacil(); rebuildCoins(); srSay((numPlayers>1?'Jogador '+(i+1)+': ':'')+'Modo Fácil '+(on?'ligado: gravidade menor, pulo mais alto, coleta tolerante, moedas no chão, sem perigos e sem quedas acidentais (segure ↓ para descer).':'desligado.')); }
function renderMovPlayers(){ const tabs=$('#movement-players'); if(!tabs)return; if(selMovPlayer>=numPlayers)selMovPlayer=0; tabs.hidden=true; // E3: sem abas — cada jogador edita só o seu (escopo = pauseActor)
  tabs.innerHTML = numPlayers<=1 ? '' : Array.from({length:numPlayers},(_,p)=>`<button class="mode-btn${p===selMovPlayer?' is-on':''}" data-mp="${p}" type="button">Jogador ${p+1}</button>`).join('');
  tabs.querySelectorAll('button[data-mp]').forEach(b=>b.addEventListener('click',()=>{ selMovPlayer=+b.dataset.mp; renderMovPlayers(); reflectFacil(); reflectAltMove(); })); }

/* Modos de visualização (C): Normal → Alto contraste (forma) → Alto contraste (4.5:1) */
function parallaxTexFor(i,mode){ const m=VIZ_BY_KEY[mode]; if(!m||m.kind!=='hc')return parallaxTexNormal[i]; (_parallaxTexHC[mode]=_parallaxTexHC[mode]||[]); if(!_parallaxTexHC[mode][i])_parallaxTexHC[mode][i]=gradientMapTexture(parallaxTexNormal[i],hcPal(m).bg); return _parallaxTexHC[mode][i]; } // HC recolore o fundo
/* ===== Cor POR JOGADOR (E11): cada viewport do multiplayer renderiza no modo do seu jogador.
   - solo: filtro CSS na canvas + texturas globais + overlay DOM + bolinha (applyVizGlobal).
   - MP: filtro PIXI por viewport + troca das texturas compartilhadas antes de cada render (no draw). */
const _vpFilterCache={};
function pixiFilterFor(mode){ if(mode in _vpFilterCache)return _vpFilterCache[mode]; let f=null;
  const CM=PIXI.ColorMatrixFilter, BL=PIXI.BlurFilter;
  const cvd={'sim-deuter':[0.625,0.375,0,0,0, 0.7,0.3,0,0,0, 0,0.3,0.7,0,0, 0,0,0,1,0],
             'sim-protan':[0.567,0.433,0,0,0, 0.558,0.442,0,0,0, 0,0.242,0.758,0,0, 0,0,0,1,0],
             'sim-tritan':[0.95,0.05,0,0,0, 0,0.433,0.567,0,0, 0,0.475,0.525,0,0, 0,0,0,1,0],
             // CORREÇÃO (daltonize = I + desvio·(I−simulação)): realça matizes confundíveis. Valores = dados ajustáveis.
             'fix-protan':[1,0,0,0,0, -0.2549,1.2549,0,0,0, 0.3031,-0.5451,1.242,0,0, 0,0,0,1,0],
             'fix-deuter':[1,0,0,0,0, -0.4375,1.4375,0,0,0, 0.2625,-0.5625,1.3,0,0, 0,0,0,1,0],
             'fix-tritan':[1.05,-0.3825,0.3325,0,0, 0,1.2345,-0.2345,0,0, 0,0,1,0,0, 0,0,0,1,0]};
  if(cvd[mode]&&CM){ const c=new CM(); c.matrix=cvd[mode]; f=[c]; }
  else if(mode==='blind'&&CM){ const c=new CM(); c.brightness(0,false); f=[c]; }
  else if(mode==='lv-blur'&&BL){ f=[new BL(5)]; }
  else if(mode==='lv-haze'&&CM){ const c=new CM(); c.contrast(-0.45,false); c.brightness(1.12,true); f=[c]; }
  else if((mode==='lv-tunnel'||mode==='lv-diabetic'||mode==='lv-macular')&&BL){ f=[new BL(mode==='lv-tunnel'?1.5:2)]; }
  return _vpFilterCache[mode]=f;
}
// overlay de baixa visão como TEXTURA (renderizada no viewport por cima da cena)
function lvOverlayCanvas(lv){ const W=LOGICAL_W,H=LOGICAL_H,cv=makeCanvas(W,H),c=cv.getContext('2d'),cx=W/2,cy=H/2;
  if(lv==='haze'){ c.fillStyle='rgba(244,246,250,0.42)'; c.fillRect(0,0,W,H); }
  else if(lv==='tunnel'){ const g=c.createRadialGradient(cx,cy,H*0.12,cx,cy,H*0.6); g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,.99)'); c.fillStyle=g; c.fillRect(0,0,W,H); }
  else if(lv==='macular'){ const g=c.createRadialGradient(cx,cy,2,cx,cy,H*0.34); g.addColorStop(0,'rgba(12,12,15,.95)');g.addColorStop(.55,'rgba(12,12,15,.5)');g.addColorStop(1,'rgba(12,12,15,0)'); c.fillStyle=g; c.fillRect(0,0,W,H); }
  else if(lv==='diabetic'){ for(const[fx,fy,fr]of[[.22,.3,.1],[.64,.22,.075],[.8,.58,.11],[.4,.7,.085],[.16,.8,.07],[.54,.48,.06]]){ const x=fx*W,y=fy*H,r=fr*W,g=c.createRadialGradient(x,y,1,x,y,r); g.addColorStop(0,'rgba(10,10,14,.95)');g.addColorStop(.5,'rgba(10,10,14,.7)');g.addColorStop(1,'rgba(10,10,14,0)'); c.fillStyle=g; c.fillRect(x-r,y-r,2*r,2*r); } }
  return cv; }
const _lvOverlayTex={}; function lvOverlayTex(lv){ if(lv==='blur')return null; if(!_lvOverlayTex[lv])_lvOverlayTex[lv]=tex(lvOverlayCanvas(lv)); return _lvOverlayTex[lv]; }
const lvOverlaySpr=new PIXI.Sprite(PIXI.Texture.EMPTY), vpDot=new PIXI.Graphics();
function playerVizTex(base,mode){ if(!base)return base; const m=VIZ_BY_KEY[mode]; if(m&&m.kind==='hc'){ const mm=(_playerHC[mode]=_playerHC[mode]||new Map()); if(!mm.has(base))mm.set(base,gradientMapTexture(base,hcPal(m).player)); return mm.get(base); } return base; }
// estáticos (mundo/parallax/moedas/itens) só re-aplicam quando o modo muda (_lastSharedViz declarado no topo do render)
function applySharedTextures(mode){
  if(mode!==_lastSharedViz){ _lastSharedViz=mode;
    worldSprite.texture=worldTexFor(mode);
    parallaxLayers.forEach((ts,j)=>ts.texture=parallaxTexFor(j,mode));
    decoSprites.forEach(s=>s.texture=treeTexFor(mode));
    for(const s of coinSprites){ if(s)s.texture=coinTexFor(mode); }
    for(const pu of powerups){ if(pu.sprite)pu.sprite.texture=pupTexFor(pu.kind,mode); }
  }
  for(const pl of players){ if(pl.sprite&&pl._tx)pl.sprite.texture=playerVizTex(pl._tx,mode); } // player muda de quadro toda frame
}
function renderVpOverlay(i,mode){ const m=VIZ_BY_KEY[mode]; if(!m||m.kind!=='lowvision')return; // overlay de baixa visão DENTRO da render-texture (a bolinha fica por cima, fora do filtro)
  const t=lvOverlayTex(m.lv); if(t){ lvOverlaySpr.texture=t; app.renderer.render(lvOverlaySpr,{renderTexture:vpTex[i],clear:false}); }
}
// bolinhas indicadoras por viewport (sobre os sprites de saída → NÃO sofrem o filtro do viewport, ex. cegueira)
function updateVpDots(){ for(let i=0;i<vpDots.length;i++){ const g=vpDots[i], m=VIZ_BY_KEY[players[i]&&players[i].viz]; if(!g)continue;
  const on=m&&(m.kind==='blind'||m.kind==='lowvision'); g.visible=!!on; if(on){ g.clear(); g.lineStyle(1,0x000000,.6); g.beginFill(m.kind==='blind'?0xffffff:0x36d36a); g.drawCircle(0,0,5); g.endFill(); } } }
function applyVpFilters(){ for(let i=0;i<numPlayers;i++){ if(vpSpr[i])vpSpr[i].filters=pixiFilterFor(players[i].viz); } }
function setModoCego(on){ if(modoCego===on)return; modoCego=on; try{localStorage.setItem('incl_modocego',on?'1':'0');}catch(e){} if(typeof setupExtras==='function')setupExtras(); if(typeof reflectModoCego==='function')reflectModoCego(); srSay('Modo cego '+(on?'ligado: bengala e pistas de áudio ativas. O 1º item de poder vira a bengala de corrida.':'desligado.')); }
function setPlayerViz(i,mode){ const m=VIZ_BY_KEY[mode]||VIZ_BY_KEY.normal; players[i].viz=m.key; try{localStorage.setItem('incl_viz_p'+i,m.key);}catch(e){} _lastSharedViz=null;
  if(m.kind==='blind') setModoCego(true); // empatia cegueira total liga o modo cego (áudio) por padrão
  if(numPlayers<=1 && i===0){ applyVizGlobal(m.key); } else { applyVpFilters(); updateVpDots(); }
  reflectVizButtons(); if(typeof renderVisual==='function'){ renderVisual(); renderEmpathy(); } }
function applyVizGlobal(mode){
  const m=VIZ_BY_KEY[mode]||VIZ_BY_KEY.normal; mode=m.key;
  vizMode=mode; hcMode=(m.kind==='bordas'||m.kind==='hc'); try{localStorage.setItem('incl_viz',mode);}catch(e){}
  if(app&&app.view) app.view.style.filter=VIZ_FILTER[mode]||''; // sim. daltonismo/baixa-visão/cegueira = filtro na canvas
  worldSprite.texture=worldTexFor(mode);            // bordas=contorno · hc=recolor por paleta · resto=normal
  parallaxLayers.forEach((ts,i)=>{ ts.texture=parallaxTexFor(i,mode); });
  decoSprites.forEach(s=>{ s.texture=treeTexFor(mode); });
  rebuildExtras(); rebuildCoins();
  // baixa visão = névoa+manchas (overlay) + bolinha verde; cegueira = tela preta (filtro) + esconde controles + bolinha branca
  document.body.classList.toggle('lowvision-mode', m.kind==='lowvision');
  document.body.classList.toggle('blind-mode', m.kind==='blind');
  const ov=$('#viz-overlay'); if(ov){ ov.hidden=(m.kind!=='lowvision'); ov.className=(m.kind==='lowvision'?('lv-'+m.lv):''); }
  if(m.kind==='blind'){ hideTouchControls('cegueira'); }
  updateVizIndicator(m.kind);
  if(typeof reflectVizButtons==='function') reflectVizButtons();
  if(typeof renderVisual==='function'){ renderVisual(); renderEmpathy(); }
}
// bolinha indicadora (canto sup. dir.): branca=cegueira, verde=baixa visão; toque/clique 2× volta ao normal
function updateVizIndicator(kind){ const el=$('#viz-indicator'); if(!el)return;
  const on=(kind==='blind'||kind==='lowvision'); el.hidden=!on;
  el.classList.toggle('blind',kind==='blind'); el.classList.toggle('low',kind==='lowvision');
  el.setAttribute('aria-label',(kind==='blind'?'Modo cegueira total':'Modo baixa visão')+'. Toque duas vezes para voltar às cores normais.'); }
function reapplyVizAll(){ _lastSharedViz=null; if(numPlayers<=1){ applyVizGlobal(players[0].viz); } else { app&&app.view&&(app.view.style.filter=''); document.body.classList.remove('lowvision-mode','blind-mode'); const ov=$('#viz-overlay'); if(ov)ov.hidden=true; updateVizIndicator('normal'); applyVpFilters(); } } // MP: filtro CSS/overlay/bolinha globais OFF (por viewport agora)
// Modos que AJUDAM (A12e visual) vs SIMULAÇÕES de empatia (Modo empatia)
const isSimKind=k=>k==='filter'||k==='lowvision'||k==='blind';
const VIZ_HELP=VIZ_MODES.filter(m=>!isSimKind(m.kind)), VIZ_SIM=VIZ_MODES.filter(m=>isSimKind(m.kind));
let selVizPlayer=0;
function renderVizGroup(listSel,tabsSel,modes){ const el=$(listSel); if(!el)return; if(selVizPlayer>=numPlayers)selVizPlayer=0;
  const tabs=$(tabsSel); if(tabs){ tabs.hidden=true; // E3: sem abas — cada jogador edita só o seu
    tabs.innerHTML = '';
    tabs.querySelectorAll('button[data-vp]').forEach(b=>b.addEventListener('click',()=>{ selVizPlayer=+b.dataset.vp; renderVisual(); renderEmpathy(); })); }
  const cur=players[selVizPlayer]?players[selVizPlayer].viz:'normal';
  el.innerHTML=modes.map(m=>{ const sel=m.key===cur; return `<div class="ctrl-row"><span><strong>${m.nome}</strong><br><span class="opt-hint" style="margin:0">${m.desc}</span></span>`+
    `<button class="mode-btn${sel?' is-on':''}" role="radio" aria-checked="${sel}" data-viz="${m.key}" type="button">${sel?'✓ Selecionado':'Selecionar'}</button></div>`; }).join('');
  el.querySelectorAll('button[data-viz]').forEach(btn=>btn.addEventListener('click',()=>{ setPlayerViz(selVizPlayer,btn.dataset.viz); srSay((numPlayers>1?'Jogador '+(selVizPlayer+1)+': ':'')+VIZ_MODES.find(m=>m.key===btn.dataset.viz).nome+'.'); }));
}
function renderVisual(){ renderVizGroup('#visual-list','#visual-players',VIZ_HELP); }
function renderEmpathy(){ renderVizGroup('#empathy-list','#empathy-players',VIZ_SIM); const h=$('#opt-hearing'); if(h){ toggleBtn(h,hearingLoss); h.textContent=hearingLoss?'❚❚ Ligado':'▶ Desligado'; } if(typeof reflectMotorEmpathy==='function')reflectMotorEmpathy(); }
function reflectVizButtons(){ const help=players.some(p=>{const m=VIZ_BY_KEY[p.viz];return m&&(m.kind==='bordas'||m.kind==='hc');});
  const sim=players.some(p=>isSimKind((VIZ_BY_KEY[p.viz]||{}).kind));
  const bv=$('#opt-visual'); if(bv)bv.classList.toggle('is-on',help); const be=$('#opt-empathy'); if(be)be.classList.toggle('is-on',sim||hearingLoss||oneButton||wheelchair); }
// "tela = canvas": reparenta os diálogos de a11y para dentro do #game-region (ficam presos ao canvas)
// e empilha o último aberto por cima (z crescente). frontOverlay é chamado em cada open*.
let _ovZ=60;
// Explicações no RODAPÉ (não embaixo de cada opção): coleta a descrição de cada linha para data-explain,
// deixa só o rótulo na linha e mostra a descrição num rodapé fixo ao focar/passar o mouse. Menos cansativo.
function fillExplain(card){ if(!card)return;
  let f=card.querySelector('.opt-explain');
  if(!f){ f=document.createElement('div'); f.className='opt-explain'; f.setAttribute('aria-live','polite'); f.dataset.idle='Passe o mouse ou navegue pelas opções para ver a explicação.'; f.textContent=f.dataset.idle; card.appendChild(f); }
  card.querySelectorAll('.ctrl-row').forEach(row=>{ if(row.dataset.explainDone)return;
    const span=row.querySelector(':scope > span'); const strong=span&&span.querySelector('strong'); if(!span||!strong){ row.dataset.explainDone='1'; return; }
    const hint=span.querySelector('.opt-hint');
    let desc = hint ? hint.textContent.trim() : span.textContent.slice(strong.textContent.length).replace(/^\s*[—–-]\s*/,'').trim();
    row.dataset.explainDone='1'; if(!desc)return;
    row.dataset.explain=desc; span.innerHTML=strong.outerHTML; // deixa só o rótulo curto
    const show=()=>{ f.textContent=desc; }; const clear=()=>{ f.textContent=f.dataset.idle||''; };
    row.addEventListener('mouseenter',show); row.addEventListener('focusin',show); row.addEventListener('mouseleave',clear); });
}
function frontOverlay(el){ if(!el)return; el.style.zIndex=String(++_ovZ); const card=el.querySelector('.overlay__card'); if(card)fillExplain(card); }
(function inCanvasMenus(){ const gr=document.getElementById('game-region'); if(!gr)return;
  ['audio','movement','options','animation','visual','empathy','touchcfg','help'].forEach(id=>{ const el=document.getElementById(id); if(el)gr.appendChild(el); });
  // Botões puramente on/off viram TOGGLE (switch) — o texto "Ligado/Desligado" fica oculto (font-size:0).
  ['opt-facil','opt-altmove','opt-hearing','opt-onebtn','opt-wheelchair','opt-modocego','opt-tts','opt-eyes','audio-master','opt-captions','motion-master'].forEach(id=>{ const b=document.getElementById(id); if(b)b.classList.add('switch'); });
})();
function openVisual(){ const ov=$('#visual'); if(!ov)return; renderVisual(); ov.hidden=false; frontOverlay(ov); visualOpen=true; const f=ov.querySelector('button[data-viz]')||ov.querySelector('button'); if(f)f.focus(); }
function closeVisual(){ const ov=$('#visual'); if(!ov)return; ov.hidden=true; visualOpen=false; const b=$('#opt-visual'); if(b)b.focus(); }
function openEmpathy(){ const ov=$('#empathy'); if(!ov)return; renderEmpathy(); ov.hidden=false; frontOverlay(ov); empathyOpen=true; const f=ov.querySelector('button'); if(f)f.focus(); }
function closeEmpathy(){ const ov=$('#empathy'); if(!ov)return; ov.hidden=true; empathyOpen=false; const b=$('#opt-empathy'); if(b)b.focus(); }
const visualBtn=$('#opt-visual'); if(visualBtn)visualBtn.addEventListener('click',openVisual);
const visualClose=$('#visual-close'); if(visualClose)visualClose.addEventListener('click',closeVisual);
const empathyBtn=$('#opt-empathy'); if(empathyBtn)empathyBtn.addEventListener('click',openEmpathy);
const empathyClose=$('#empathy-close'); if(empathyClose)empathyClose.addEventListener('click',closeEmpathy);
const hearingBtn=$('#opt-hearing'); if(hearingBtn)hearingBtn.addEventListener('click',()=>{ setHearingLoss(!hearingLoss); renderEmpathy(); reflectVizButtons(); });
try{ if(localStorage.getItem('incl_hearingloss')==='1'){ hearingLoss=true; } }catch(e){}
// Empatia motora: um-botão e cadeirante
function reflectMotorEmpathy(){ const a=$('#opt-onebtn'); if(a){ a.classList.toggle('is-on',oneButton); a.setAttribute('aria-pressed',String(oneButton)); a.textContent=oneButton?'❚❚ Ligado':'▶ Desligado'; }
  const b=$('#opt-wheelchair'); if(b){ b.classList.toggle('is-on',wheelchair); b.setAttribute('aria-pressed',String(wheelchair)); b.textContent=wheelchair?'❚❚ Ligado':'▶ Desligado'; } reflectVizButtons(); }
function setOneButton(on){ oneButton=on; try{localStorage.setItem('incl_onebtn',on?'1':'0');}catch(e){} reflectMotorEmpathy(); srSay('Um botão por vez '+(on?'ligado: só uma tecla/botão de cada vez.':'desligado.')); }
function setWheelchair(on){ wheelchair=on; try{localStorage.setItem('incl_wheelchair',on?'1':'0');}catch(e){}
  players.forEach(p=>{ if(on && p.activePower!=='fly' && p.activePower!=='turbo') p.activePower='off'; if(on) p.owned=p.owned.filter(k=>k==='fly'||k==='turbo'); showPower(p); });
  setupExtras(); rebuildCoins(); buildWcGeom(); buildRamps(); buildElevators(); reflectMotorEmpathy(); // só voo/super-corrida; moedas no chão; escada/trampolim viram elevador; rampas+pontes; lava vira chão
  srSay('Modo cadeirante '+(on?'ligado: sem pulo; rampas e elevadores no lugar de degraus e escada; moedas no chão; só voo e super-corrida.':'desligado.')); }
const oneBtn=$('#opt-onebtn'); if(oneBtn)oneBtn.addEventListener('click',()=>setOneButton(!oneButton));
const wheelBtn=$('#opt-wheelchair'); if(wheelBtn)wheelBtn.addEventListener('click',()=>setWheelchair(!wheelchair));
// bolinha indicadora: duplo toque/clique → volta às cores normais (em cegueira é a única saída visível)
(function vizIndicator(){ const el=$('#viz-indicator'); if(!el)return; let last=-9999;
  el.addEventListener('pointerdown',(e)=>{ e.preventDefault(); const t=e.timeStamp||0; if(t-last<450){ setPlayerViz(0,'normal'); last=-9999; srSay('Cores normais reativadas.'); } else last=t; }); })();
loadPlayerA11y(players[0],0); // carrega viz/easy/alternância persistidos do jogador 1 (migra chaves antigas)
vizReady=true; applyVizGlobal(players[0].viz); // estado inicial (solo)

/* Fonte de leitura (canônicas EdSP): Padrão (Atkinson) | Alfabetização (Andika) | Dislexia/TDAH (Lexend + espaçamento BDA). Persistida. */
const FONT_MODES=[
  {id:'padrao',        nome:'Atkinson', uso:'legibilidade'},
  {id:'alfabetizacao', nome:'Andika',   uso:'alfabetização'},
  {id:'dislexia',      nome:'Lexend',   uso:'dislexia'},
];
const FKEY='incl_fonte'; let fonteIdx=0; const fonteBtn=$('#opt-fonte');
function applyFonte(announce){ const m=FONT_MODES[fonteIdx]; document.documentElement.dataset.fonte=m.id;
  if(fonteBtn)fonteBtn.value=m.id; // opt-fonte é uma caixa de seleção (Tipografia do jogo)
  if(announce) srSay('Tipografia '+m.nome+', para '+m.uso+'.'); }
try{ const i=FONT_MODES.findIndex(m=>m.id===localStorage.getItem(FKEY)); if(i>=0)fonteIdx=i; }catch(e){}
applyFonte(false);
if(fonteBtn) fonteBtn.addEventListener('change',()=>{ const i=FONT_MODES.findIndex(m=>m.id===fonteBtn.value); if(i>=0)fonteIdx=i; try{localStorage.setItem(FKEY,FONT_MODES[fonteIdx].id);}catch(e){} applyFonte(true); });

/* F1: menu de áudio (mixer por categoria) — o botão "Som" abre este menu */
function reflectAudioMaster(){ const b=$('#audio-master'); if(b){ b.classList.toggle('is-on',soundOn); b.setAttribute('aria-pressed',String(soundOn)); b.textContent=soundOn?'🔊 Ligado':'🔇 Desligado'; } const v=$('#audio-master-vol'); if(v)v.value=Math.round(volume*100); const sb=$('#opt-sound'); if(sb)toggleBtn(sb,soundOn); }
// Categorias divididas: NAVEGAÇÃO SONORA (sonar/guarda/guia) e GERAL do jogo. TTS fica na seção Voz.
const NAV_CATS=['sonar','guard','guide'], GEN_CATS=['music','ambient','interact','earcons','other'];
function catRowHTML(k){ const c=AUDIO_CATS.find(x=>x.k===k), a=audioCat[k]; return `<div class="ctrl-row"><span>${c.lbl}</span><span style="display:flex;gap:.5rem;align-items:center;flex-shrink:0"><input class="vol" type="range" min="0" max="100" step="5" value="${Math.round(a.vol*100)}" data-avol="${k}" aria-label="Volume de ${c.lbl}"><button class="mode-btn switch${a.on?' is-on':''}" data-acat="${k}" type="button" aria-pressed="${a.on}" aria-label="${c.lbl}"></button></span></div>`; }
function wireCatControls(el){
  el.querySelectorAll('button[data-acat]').forEach(b=>b.addEventListener('click',()=>{ const k=b.dataset.acat; audioCat[k].on=!audioCat[k].on; setCatGain(k); b.classList.toggle('is-on',audioCat[k].on); b.setAttribute('aria-pressed',String(audioCat[k].on)); }));
  el.querySelectorAll('input[data-avol]').forEach(s=>s.addEventListener('input',()=>{ const k=s.dataset.avol; audioCat[k].vol=(+s.value)/100; audioCat[k].on=true; setCatGain(k); const bb=el.querySelector('button[data-acat="'+k+'"]'); if(bb){bb.classList.add('is-on');bb.setAttribute('aria-pressed','true');} }));
}
function renderNavSound(){ const el=$('#navsound-list'); if(el){ el.innerHTML=NAV_CATS.map(catRowHTML).join(''); wireCatControls(el); }
  const m=$('#navsound-master'); if(m)m.value=Math.round(Math.max(...NAV_CATS.map(k=>audioCat[k].vol))*100); }
function renderAudio(){ reflectAudioMaster();
  const el=$('#audio-list'); if(el){ el.innerHTML=GEN_CATS.map(catRowHTML).join(''); wireCatControls(el); }
  renderNavSound();
  const tv=$('#tts-vol'); if(tv)tv.value=Math.round(audioCat.tts.vol*100);
}
function openAudio(){ const ov=$('#audio'); if(!ov)return; ensureAC(); renderAudio(); reflectModoCego(); reflectTTS(); populateTTSEngines(); populateTTSVoices(); enumerateSinks(); const cd=$('#cane-div'); if(cd)cd.value=String(caneBlockDiv); ov.hidden=false; frontOverlay(ov); audioOpen=true; const f=ov.querySelector('button'); if(f)f.focus(); }
function closeAudio(){ const ov=$('#audio'); if(!ov)return; ov.hidden=true; audioOpen=false; const b=$('#opt-sound'); if(b)b.focus(); }
// A12e auditiva: Modo cego (só áudio) + seleção de voz (Web Speech agora; neurais em breve)
function reflectModoCego(){ const b=$('#opt-modocego'); if(b){ toggleBtn(b,modoCego); b.textContent=modoCego?'❚❚ Ligado':'▶ Desligado'; } }
function reflectTTS(){ const b=$('#opt-tts'); if(b){ toggleBtn(b,audioCat.tts.on); b.textContent=audioCat.tts.on?'❚❚ Ligado':'▶ Desligado'; } const e=$('#tts-engine'); if(e)e.value=ttsEngineSel; }
function populateTTSEngines(){ const sel=$('#tts-engine'); if(!sel||sel.dataset.filled)return; sel.dataset.filled='1';
  [['webspeech','Voz do navegador (Web Speech)'],['piper','Piper (neural, offline) — baixa no 1º uso'],['kokoro','Kokoro-82M (neural) — baixa no 1º uso'],['kitten','Kitten (neural) — baixa no 1º uso'],['espeak','eSpeak NG (embutido)']]
    .forEach(([v,l])=>{ const o=document.createElement('option'); o.value=v; o.textContent=l; sel.appendChild(o); }); sel.value=ttsEngineSel; }
function populateTTSVoices(){ const sel=$('#tts-voice'); if(!sel)return; let voices=[]; try{ voices=(window.speechSynthesis&&window.speechSynthesis.getVoices())||[]; }catch(e){}
  const pt=voices.filter(v=>/^pt/i.test(v.lang)), list=pt.length?pt:voices; sel.innerHTML='';
  if(!list.length){ const o=document.createElement('option'); o.textContent='(sem vozes do sistema)'; sel.appendChild(o); _ttsVoiceObj=null; return; }
  list.forEach(v=>{ const o=document.createElement('option'); o.value=v.name; o.textContent=v.name+' ('+v.lang+')'; sel.appendChild(o); });
  const saved=(()=>{try{return localStorage.getItem('incl_tts_voice');}catch(e){return null;}})(); const pick=list.find(v=>v.name===saved)||list[0]; sel.value=pick.name; _ttsVoiceObj=pick; }
const mcBtn=$('#opt-modocego'); if(mcBtn)mcBtn.addEventListener('click',()=>{ setModoCego(!modoCego); reflectModoCego(); });
const caneDivSel=$('#cane-div'); if(caneDivSel){ caneDivSel.value=String(caneBlockDiv); caneDivSel.addEventListener('change',()=>{ caneBlockDiv=+caneDivSel.value||1; try{localStorage.setItem('incl_cane_div',String(caneBlockDiv));}catch(e){} srSay('Bengala: '+(caneBlockDiv===2?'uma batida a cada meio bloco pisado.':'uma batida por bloco pisado.')); }); }
// Botões abreviados: hover/foco DESCOMPACTA o número em letras (o "12" vira as 12 letras contando p/ baixo), suave;
// recomprime ao sair. Genérico: varre a barra (.mode-btn) E o menu de pausa (.pm-btn) casando A12e/S11e.
const ABBR_MID={ 'A12e':'cessibilidad', 'S11e':'ensibilidad' }; // token → letras ocultas (Acessibilidade / Sensibilidade)
function attachAbbr(b){ if(!b||b.dataset.abbrDone)return; const txt=b.textContent; let tok=null;
  for(const t in ABBR_MID){ if(txt.includes(t)){ tok=t; break; } } if(!tok)return;
  const i=txt.indexOf(tok), pre=txt.slice(0,i+1), suf=txt.slice(i+tok.length-1), hid=ABBR_MID[tok], N=hid.length; // pre inclui a 1ª letra; suf começa na última
  b.dataset.abbrDone='1'; let k=0,tgt=0,timer=null;
  const render=()=>{ b.textContent=pre+hid.slice(0,k)+((N-k>0)?String(N-k):'')+suf; };
  const tick=()=>{ if(k===tgt){ clearInterval(timer); timer=null; return; } k+=k<tgt?1:-1; render(); };
  const go=(t)=>{ tgt=t; if(!timer)timer=setInterval(tick,16); };
  render(); b.addEventListener('mouseenter',()=>go(N)); b.addEventListener('mouseleave',()=>go(0)); b.addEventListener('focus',()=>go(N)); b.addEventListener('blur',()=>go(0)); }
document.querySelectorAll('.mode-btn, .pm-btn').forEach(attachAbbr);
const ttsBtn=$('#opt-tts'); if(ttsBtn)ttsBtn.addEventListener('click',()=>{ audioCat.tts.on=!audioCat.tts.on; setCatGain('tts'); reflectTTS(); srSay('Narração '+(audioCat.tts.on?'ligada.':'desligada.')); if(audioCat.tts.on)narrate('Narração por voz ligada.'); });
const ttsEngSel=$('#tts-engine'); if(ttsEngSel)ttsEngSel.addEventListener('change',()=>{ ttsEngineSel=ttsEngSel.value; try{localStorage.setItem('incl_tts_engine',ttsEngineSel);}catch(e){} if(ttsEngineSel!=='webspeech')loadTTS(); narrate('Motor de voz: '+ttsEngSel.options[ttsEngSel.selectedIndex].text+'.'); });
const ttsVoiceSel=$('#tts-voice'); if(ttsVoiceSel)ttsVoiceSel.addEventListener('change',()=>{ try{ const vs=window.speechSynthesis.getVoices(); _ttsVoiceObj=vs.find(v=>v.name===ttsVoiceSel.value)||null; localStorage.setItem('incl_tts_voice',ttsVoiceSel.value); }catch(e){} narrate('Voz selecionada.'); });
const ttsTestBtn=$('#opt-tts-test'); if(ttsTestBtn)ttsTestBtn.addEventListener('click',()=>{ const txt='Olá! Esta é a voz da narração do Inclusionista. Um, dois, três, testando.';
  if(ttsEngineSel!=='webspeech' && ttsEngine && ttsEngine.speak){ try{ ttsEngine.speak(txt); }catch(e){} } // motor neural já carregado
  else { try{ const ss=window.speechSynthesis; if(ss){ ss.cancel(); const u=new SpeechSynthesisUtterance(txt); u.lang='pt-BR'; if(_ttsVoiceObj)u.voice=_ttsVoiceObj; u.rate=1; u.volume=1; ss.speak(u); } }catch(e){} if(ttsEngineSel!=='webspeech')loadTTS(); } // fallback audível (volume 1) + dispara download do neural
  srSay('Testando a voz selecionada.'); });
try{ if(window.speechSynthesis) window.speechSynthesis.onvoiceschanged=populateTTSVoices; }catch(e){}
const navMasterEl=$('#navsound-master'); if(navMasterEl)navMasterEl.addEventListener('input',()=>{ const v=(+navMasterEl.value)/100; NAV_CATS.forEach(k=>{ audioCat[k].vol=v; audioCat[k].on=true; setCatGain(k); }); renderNavSound(); }); // volume geral da navegação sonora (separado do som do jogo)
const ttsVolEl=$('#tts-vol'); if(ttsVolEl)ttsVolEl.addEventListener('input',()=>{ audioCat.tts.vol=(+ttsVolEl.value)/100; audioCat.tts.on=true; setCatGain('tts'); reflectTTS(); }); // volume da narração vive na seção Voz
// Saída de áudio POR JOGADOR (setSinkId): detecta fones/caixas e atribui 1 por jogador
let _audioDevices=[];
async function detectAudioDevices(){ try{ await navigator.mediaDevices.getUserMedia({audio:true}).then(s=>s.getTracks().forEach(t=>t.stop())).catch(()=>{}); const devs=await navigator.mediaDevices.enumerateDevices(); _audioDevices=devs.filter(d=>d.kind==='audiooutput'); }catch(e){ _audioDevices=[]; } renderAudioSinks(); }
async function enumerateSinks(){ try{ if(navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices){ const devs=await navigator.mediaDevices.enumerateDevices(); _audioDevices=devs.filter(d=>d.kind==='audiooutput'); } }catch(e){} renderAudioSinks(); } // sem pedir permissão: só lista as saídas na caixa de seleção
function renderAudioSinks(){ const el=$('#audio-sinks'); if(!el)return; el.innerHTML='';
  const supported=!!(navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices)&&(typeof (window.AudioContext||window.webkitAudioContext)!=='undefined');
  if(!_audioDevices.length){ el.innerHTML='<p class="opt-hint">'+(supported?'Clique em Detectar (pede permissão de áudio para listar os aparelhos).':'Este navegador não suporta troca de saída (ex.: Safari/iOS).')+'</p>'; return; }
  for(let i=0;i<Math.max(1,numPlayers);i++){ const p=players[i]; const row=document.createElement('div'); row.className='ctrl-row';
    const lbl=document.createElement('label'); lbl.textContent='Jogador '+(i+1); lbl.setAttribute('for','sink-p'+i);
    const sel=document.createElement('select'); sel.className='vol'; sel.id='sink-p'+i;
    const o0=document.createElement('option'); o0.value=''; o0.textContent='Padrão (compartilhado)'; sel.appendChild(o0);
    _audioDevices.forEach((d,k)=>{ const o=document.createElement('option'); o.value=d.deviceId; o.textContent=d.label||('Saída '+(k+1)); sel.appendChild(o); });
    sel.value=(p&&p.audioSink)||'';
    sel.addEventListener('change',()=>{ if(!p)return; p.audioSink=sel.value||null; try{localStorage.setItem('incl_sink_p'+i,p.audioSink||'');}catch(e){} if(p._ac){ try{p._ac.close();}catch(e){} p._ac=null; p._acOut=null; } srSay('Jogador '+(i+1)+' — saída de áudio '+(p.audioSink?'trocada.':'padrão.')); });
    row.appendChild(lbl); row.appendChild(sel); el.appendChild(row); } }
const audioDetectBtn=$('#audio-detect'); if(audioDetectBtn)audioDetectBtn.addEventListener('click',detectAudioDevices);
// DESIGN DOS BOTÕES na tela por controle (Gamepad API: 0=baixo/pulo·sim, 1=direita/especial·não, 2=esquerda/interação, 3=cima/troca-poder)
const PAD_DESIGNS={ generic:{'0':['0','#3a4a6a'],'1':['1','#3a4a6a'],'2':['2','#3a4a6a'],'3':['3','#3a4a6a']},
  microsoft:{'0':['A','#2fae4e'],'1':['B','#d23b3b'],'2':['X','#2f6fd2'],'3':['Y','#d9a400']},
  sony:{'0':['✕','#4f8fd0'],'1':['○','#d23b3b'],'2':['□','#d76fae'],'3':['△','#2fae7e']},
  nintendo:{'0':['B','#d9a400'],'1':['A','#d23b3b'],'2':['Y','#2fae4e'],'3':['X','#2f6fd2']} };
let padDesign=(()=>{try{return localStorage.getItem('incl_paddesign')||'generic';}catch(e){return 'generic';}})(); // padrão Windows = Genérico (números)
// Sim/Não nos menus: SÓ Sony e Nintendo invertem os botões 0↔1 (confirmar = ○/A à direita, cultural).
// Xbox/Genérico: sim = botão 0 (A verde / "0"), não = botão 1 (B vermelho / "1").
function simNaoGlyphs(){ const set=PAD_DESIGNS[padDesign]||PAD_DESIGNS.generic; const inv=(padDesign==='sony'||padDesign==='nintendo');
  return { sim:set[inv?'1':'0'], nao:set[inv?'0':'1'] }; }
function renderPauseLegend(){ const g=simNaoGlyphs();
  const chip=(s,word)=>`<span class="lg"><span class="lg-ico" style="background:${s[1]}">${s[0]}</span> ${word}</span>`;
  const html=chip(g.sim,'Sim')+chip(g.nao,'Não');
  document.querySelectorAll('.pause-legend').forEach(el=>{ el.innerHTML=html; }); } // todas as pausas por tela
function applyPadDesign(d){ if(d&&PAD_DESIGNS[d])padDesign=d; try{localStorage.setItem('incl_paddesign',padDesign);}catch(e){} const set=PAD_DESIGNS[padDesign]||PAD_DESIGNS.generic;
  document.querySelectorAll('#pad-diamond .pad-b').forEach(b=>{ const s=set[b.dataset.btn]; if(s){ b.textContent=s[0]; b.style.background=s[1]; } }); renderPauseLegend(); }
applyPadDesign(padDesign);
// START (pílula): função vem do touchMap (padrão pausar) — a fiação fica no touchSetup, junto do doTouch.
function padLayoutFromId(id){ id=(id||'').toLowerCase(); if(/dualshock|dualsense|playstation|054c/.test(id))return 'sony'; if(/switch|nintendo|joy-con|057e/.test(id))return 'nintendo'; if(/xbox|xinput|microsoft|045e/.test(id))return 'microsoft'; return 'generic'; }
addEventListener('gamepadconnected', (e)=>{ try{ applyPadDesign(padLayoutFromId(e.gamepad.id)); const sel=$('#pad-design'); if(sel)sel.value=padDesign; srSay('Controle conectado: layout '+padDesign+'.'); }catch(err){} }); // A2: layout pelo id do controle
const padDesignSel=$('#pad-design'); if(padDesignSel){ padDesignSel.value=padDesign; padDesignSel.addEventListener('change',()=>{ applyPadDesign(padDesignSel.value); srSay('Desenho dos botões: '+padDesignSel.value+'.'); }); } // A4: escolha manual (DirectInput/genérico)
// TAMANHO FÍSICO (mm) dos botões de toque — NÃO px. WCAG mede alvos de toque físicos, não botões
// virtuais sobre canvas. Conversão mm→px ancorada no iPhone 16 a tela cheia (aresta longa 141,1mm
// do display 1179×2556 @460ppi → ~6,04 px CSS/mm). No aparelho-alvo fica exato; noutros, proporcional.
// Defaults baseados na ciência (botões que se SEGURA + multitoque, não toque fino):
//  botão 12,5mm (piso 11mm > alvo de polegar Parhi 9,6mm; segurar cansa mais em botão pequeno),
//  folga 3mm (evita apertar 2 sem esticar o polegar), analógico 18mm (capuz físico ~18–20mm),
//  deslocamento 4,5mm. Faixa criança↔adulto estreita: crianças NÃO devem ir a alvos minúsculos.
const IPHONE16_LONG_MM=141.1;
function padPxPerMm(){ return Math.max(window.innerWidth,window.innerHeight)/IPHONE16_LONG_MM; }
const padLoad=(k,d)=>{ try{ const v=parseFloat(localStorage.getItem(k)); return isNaN(v)?d:v; }catch(e){ return d; } };
let padBtnMm=padLoad('incl_padbtnmm',12.5), padGapMm=padLoad('incl_padgapmm',3);
let padStickMm=padLoad('incl_padstickmm',18), padTravelMm=padLoad('incl_padtravelmm',4.5);
let padDpadMm=padLoad('incl_paddpadmm',12); // comprimento do braço da cruz (D-pad físico real ~10–13mm)
let padDir=(()=>{try{return localStorage.getItem('incl_paddir')||'stick';}catch(e){return 'stick';}})(); // 'stick' | 'cross'
let _stickTravelPx=42, _stickDeadPx=12; // atualizados por applyPadPhysical; lidos pelo joystick
function padHandTag(v,lo,hi){ return v<=lo?'crianca':v>=hi?'adulto':'inter'; }
function applyDirStyle(){ const st=$('#touch-stick'), cr=$('#touch-cross'); if(st)st.hidden=(padDir==='cross'); if(cr)cr.hidden=(padDir!=='cross'); const sel=$('#pad-dir'); if(sel&&sel.value!==padDir)sel.value=padDir; }
function applyPadPhysical(){ const r=padPxPerMm();
  const btn=padBtnMm*r, gap=padGapMm*r, diam=btn+Math.SQRT2*(btn+gap); // losango: folga de aresta = gap
  const knob=padStickMm*r, travel=padTravelMm*r, base=knob+2*travel+16; // base do analógico = contato + curso
  const arm=padDpadMm*r, aw=arm*0.8, span=2*arm+aw; // cruz: braço (comprimento) + largura (0,8×) → vão total
  _stickTravelPx=travel; _stickDeadPx=Math.max(6,travel*0.4); // deslocamento útil + zona-morta (~40% do curso)
  const S=document.documentElement.style;
  S.setProperty('--pad-btn',btn.toFixed(1)+'px'); S.setProperty('--pad-diam',diam.toFixed(1)+'px');
  S.setProperty('--stick-knob',knob.toFixed(1)+'px'); S.setProperty('--stick-base',base.toFixed(1)+'px');
  S.setProperty('--dpad-arm-l',arm.toFixed(1)+'px'); S.setProperty('--dpad-arm-w',aw.toFixed(1)+'px'); S.setProperty('--dpad-span',span.toFixed(1)+'px');
  const fmt=(n)=>n.toFixed(1).replace('.',','), lbl={crianca:'mão de criança',adulto:'mão de adulto',inter:'intermediário'};
  const upd=(valId,tagId,mm,lo,hi,slId)=>{ const v=$(valId); if(v)v.textContent=fmt(mm)+' mm'; const t=$(tagId); if(t){ const w=padHandTag(mm,lo,hi); t.dataset.who=w; t.textContent=lbl[w]; } const s=$(slId); if(s&&parseFloat(s.value)!==mm)s.value=mm; };
  upd('#pad-size-val','#pad-size-tag',padBtnMm,12.5,13,'#pad-size');
  upd('#pad-gap-val','#pad-gap-tag',padGapMm,3,4.5,'#pad-gap');
  upd('#pad-stick-val','#pad-stick-tag',padStickMm,17,19,'#pad-stick');
  upd('#pad-travel-val','#pad-travel-tag',padTravelMm,4,5.5,'#pad-travel');
  upd('#pad-dpad-val','#pad-dpad-tag',padDpadMm,12,14,'#pad-dpad'); }
function setPadMm(o){ if(o.btn!=null)padBtnMm=o.btn; if(o.gap!=null)padGapMm=o.gap; if(o.stick!=null)padStickMm=o.stick; if(o.travel!=null)padTravelMm=o.travel; if(o.dpad!=null)padDpadMm=o.dpad;
  try{localStorage.setItem('incl_padbtnmm',padBtnMm);localStorage.setItem('incl_padgapmm',padGapMm);localStorage.setItem('incl_padstickmm',padStickMm);localStorage.setItem('incl_padtravelmm',padTravelMm);localStorage.setItem('incl_paddpadmm',padDpadMm);}catch(e){} applyPadPhysical(); }
applyPadPhysical(); applyDirStyle();
addEventListener('resize',applyPadPhysical); // recalcula os px ao girar/redimensionar; os mm são fixos
const padSizeEl=$('#pad-size'); if(padSizeEl)padSizeEl.addEventListener('input',()=>setPadMm({btn:parseFloat(padSizeEl.value)}));
const padGapEl=$('#pad-gap'); if(padGapEl)padGapEl.addEventListener('input',()=>setPadMm({gap:parseFloat(padGapEl.value)}));
const padStickEl=$('#pad-stick'); if(padStickEl)padStickEl.addEventListener('input',()=>setPadMm({stick:parseFloat(padStickEl.value)}));
const padTravelEl=$('#pad-travel'); if(padTravelEl)padTravelEl.addEventListener('input',()=>setPadMm({travel:parseFloat(padTravelEl.value)}));
const padDpadEl=$('#pad-dpad'); if(padDpadEl)padDpadEl.addEventListener('input',()=>setPadMm({dpad:parseFloat(padDpadEl.value)}));
const padDirSel=$('#pad-dir'); if(padDirSel){ padDirSel.value=padDir; padDirSel.addEventListener('change',()=>{ padDir=padDirSel.value; try{localStorage.setItem('incl_paddir',padDir);}catch(e){} applyDirStyle(); srSay('Direcional: '+(padDir==='cross'?'cruz (D-pad)':'analógico')+'.'); }); }
const padPresetChild=$('#pad-preset-child'); if(padPresetChild)padPresetChild.addEventListener('click',()=>{ setPadMm({btn:12,gap:2.5,stick:16.5,travel:4,dpad:11.5}); srSay('Controles no tamanho de mão de criança (6 a 12 anos).'); });
const padPresetAdult=$('#pad-preset-adult'); if(padPresetAdult)padPresetAdult.addEventListener('click',()=>{ setPadMm({btn:14,gap:4.5,stick:20,travel:5.5,dpad:14}); srSay('Controles no tamanho de mão de adulto.'); });
// REMAPEAR a FUNÇÃO de cada botão de toque (9 posições → ação). Lido ao vivo pelos handlers de toque.
const TOUCH_ACT_LABELS={ left:'Andar à esquerda', right:'Andar à direita', up:'Subir / escada', down:'Descer / escada', jump:'Pular', run:'Correr / interagir', especial:'Especial', swap:'Trocar poder', pause:'Pausar (START)' };
const TOUCH_ACTS=['left','right','up','down','jump','run','especial','swap','pause'];
const TOUCH_SLOTS=[ {k:'up',lbl:'Direcional ↑ (cima)'},{k:'down',lbl:'Direcional ↓ (baixo)'},{k:'left',lbl:'Direcional ← (esquerda)'},{k:'right',lbl:'Direcional → (direita)'},{k:'start',lbl:'START (enter)'},{k:'b0',lbl:'Botão 0 (baixo)'},{k:'b1',lbl:'Botão 1 (direita)'},{k:'b2',lbl:'Botão 2 (esquerda)'},{k:'b3',lbl:'Botão 3 (cima)'} ];
const TOUCH_DEFAULT={ up:'up',down:'down',left:'left',right:'right',start:'pause',b0:'jump',b1:'especial',b2:'run',b3:'swap' };
let touchMap=(()=>{ try{ const s=JSON.parse(localStorage.getItem('incl_touchmap')); return Object.assign({},TOUCH_DEFAULT, s&&typeof s==='object'?s:{}); }catch(e){ return Object.assign({},TOUCH_DEFAULT); } })();
function renderTouchMap(){ const el=$('#touchmap-list'); if(!el)return;
  el.innerHTML=TOUCH_SLOTS.map(s=>`<div class="ctrl-row"><label for="tm-${s.k}">${s.lbl}</label><select id="tm-${s.k}" class="vol" data-slot="${s.k}">${TOUCH_ACTS.map(a=>`<option value="${a}"${touchMap[s.k]===a?' selected':''}>${TOUCH_ACT_LABELS[a]}</option>`).join('')}</select></div>`).join('');
  el.querySelectorAll('select[data-slot]').forEach(sel=>sel.addEventListener('change',()=>{ touchMap[sel.dataset.slot]=sel.value; try{localStorage.setItem('incl_touchmap',JSON.stringify(touchMap));}catch(e){} srSay((sel.previousElementSibling?sel.previousElementSibling.textContent:'Botão')+': '+TOUCH_ACT_LABELS[sel.value]+'.'); }));
}
// JOGAR COM OS OLHOS (webcam): WebGazer lazy (CDN no 1º uso; futuro: vendorizar p/ offline). Olhar esq/dir anda; olhar p/ cima pula.
let eyeMode=false, _eyeKeys={left:false,right:false,up:false};
function eyeSet(k,on,code){ if(_eyeKeys[k]===on)return; _eyeKeys[k]=on; const ev=new KeyboardEvent(on?'keydown':'keyup',{code:code,bubbles:true}); window.dispatchEvent(ev); document.dispatchEvent(ev); }
function onGaze(data){ if(!data||!eyeMode)return; const gr=$('#game-region'); if(!gr)return; const r=gr.getBoundingClientRect(); if(!r.width)return;
  const fx=(data.x-r.left)/r.width, fy=(data.y-r.top)/r.height;
  eyeSet('left', fx<0.4, 'KeyA'); eyeSet('right', fx>0.6, 'KeyD'); eyeSet('up', fy<0.28, 'Space'); } // olhar esq/dir = andar; alto = pular
function startEyeControl(){ try{ const wg=window.webgazer; if(!wg){ srAlert('WebGazer não carregou.'); return; } wg.setRegression('ridge').setGazeListener(onGaze).begin(); try{ wg.showVideoPreview(true).showPredictionPoints(true); }catch(e){} srAlert('Jogar com os olhos: olhe pela tela e clique em alguns pontos para calibrar. Olhar esquerda/direita anda; olhar para cima pula.'); }catch(e){} }
function stopEyeControl(){ try{ if(window.webgazer)window.webgazer.end(); }catch(e){} eyeSet('left',false,'KeyA'); eyeSet('right',false,'KeyD'); eyeSet('up',false,'Space'); }
function loadWebGazer(cb){ if(window.webgazer){cb&&cb();return;} const s=document.createElement('script'); s.src='https://webgazer.cs.brown.edu/webgazer.js'; s.async=true; s.onload=()=>cb&&cb(); s.onerror=()=>srAlert('Não foi possível carregar o WebGazer (precisa de internet no 1º uso).'); document.head.appendChild(s); }
const eyesBtn=$('#opt-eyes'); if(eyesBtn)eyesBtn.addEventListener('click',()=>{ eyeMode=!eyeMode; toggleBtn(eyesBtn,eyeMode); eyesBtn.textContent=eyeMode?'❚❚ Ligado':'▶ Desligado';
  if(eyeMode){ loadWebGazer(startEyeControl); srSay('Jogar com os olhos: carregando a webcam (permita o acesso).'); } else { stopEyeControl(); srSay('Jogar com os olhos desligado.'); } });
const audioMasterBtn=$('#audio-master'); if(audioMasterBtn)audioMasterBtn.addEventListener('click',()=>{ soundOn=!soundOn; reflectAudioMaster(); srSay('Som '+(soundOn?'ligado.':'desligado.')); });
const audioMasterVol=$('#audio-master-vol'); if(audioMasterVol)audioMasterVol.addEventListener('input',()=>{ volume=(+audioMasterVol.value)/100; if(volume>0&&!soundOn){ soundOn=true; reflectAudioMaster(); } });
const audioCloseBtn=$('#audio-close'); if(audioCloseBtn)audioCloseBtn.addEventListener('click',closeAudio);
reflectAudioMaster();

/* E10: remap de controles + persistência (B2) */
const ACT_LABEL={left:'Esquerda',right:'Direita',up:'Subir / escada',down:'Descer / escada',run:'Correr / interagir',jump:'Pular',swap:'Trocar poder',especial:'Especial'};
function keyName(code){ return String(code).replace('Arrow','↔').replace('Key','').replace('Space','Espaço').replace('ShiftLeft','Shift').replace('ShiftRight','Shift'); }
let selPlayer=0; // jogador selecionado no diálogo de Controles
function renderControls(){ const el=$('#ctrl-list'); if(!el)return;
  if(selPlayer>=numPlayers) selPlayer=0;
  const tabs=$('#ctrl-players'); // E3: sem abas de outros jogadores — você edita SÓ o seu controle
  if(tabs){ tabs.hidden=false; tabs.innerHTML=`<span class="opt-hint" style="width:100%;margin:0">Editando o <strong>seu</strong> controle — modo <strong>${numPlayers===1?'1 jogador':numPlayers+' jogadores'}</strong>.</span>`; }
  const map=kbFor(selPlayer);
  el.innerHTML=Object.keys(ACT_LABEL).map(a=>`<div class="ctrl-row"><span>${ACT_LABEL[a]}: ${(map[a]||[]).map(keyName).map(k=>`<kbd>${k}</kbd>`).join(' ')}</span><button class="mode-btn" data-act="${a}" type="button" aria-label="Alterar tecla de ${ACT_LABEL[a]} do Jogador ${selPlayer+1}">Alterar</button></div>`).join('');
  el.querySelectorAll('button[data-act]').forEach(b=>b.addEventListener('click',()=>{ captureAction=b.dataset.act; captureMapRef=kbFor(selPlayer); b.textContent='Pressione…'; srAlert('Pressione a nova tecla para '+ACT_LABEL[b.dataset.act]+' do Jogador '+(selPlayer+1)+', ou Esc para cancelar.'); }));
}
function openOptions(){ const ov=$('#options'); if(!ov)return; selPlayer=pauseActor; renderControls(); ov.hidden=false; frontOverlay(ov); optionsOpen=true; const f=ov.querySelector('button'); if(f)f.focus(); } // E3: edita o controle do jogador que abriu
function closeOptions(){ const ov=$('#options'); if(!ov)return; ov.hidden=true; optionsOpen=false; captureAction=null; const b=$('#opt-controls'); if(b)b.focus(); }
const ctrlBtn=$('#opt-controls'); if(ctrlBtn)ctrlBtn.addEventListener('click',openOptions);
// AJUDA (do menu de pausa): controles DO jogador que abriu (pauseActor) + notas desta build.
function openHelp(){ const ov=$('#help'); if(!ov)return; const c=$('#help-content'); const pa=pauseActor||0; const map=kbFor(pa);
  const rows=Object.keys(ACT_LABEL).map(a=>`<div class="ctrl-row"><span>${ACT_LABEL[a]}</span><span>${(map[a]||[]).map(keyName).map(k=>'<kbd>'+k+'</kbd>').join(' ')||'—'}</span></div>`).join('');
  if(c)c.innerHTML=`<h3 class="panel-sub">Seus controles${numPlayers>1?' · Jogador '+(pa+1):''} <span class="panel-sub__tag">teclado</span></h3><div class="ctrl-list">${rows}</div>`+
    `<h3 class="panel-sub">Notas desta build</h3><div class="ctrl-list">`+
    `<div class="ctrl-row"><span>Power-ups (bônus): 🟢 super-corrida · 🔵 ultra-pulo · 🔑 chave abre o 🚪 portão.</span></div>`+
    `<div class="ctrl-row"><span>2–4 jogadores: telas lado a lado, cada uma com seu menu e sua configuração.</span></div>`+
    `<div class="ctrl-row"><span>v4.0.0 — esqueleto PixiJS (WebGL, fallback Canvas) · texto/UI no DOM (acessibilidade) · offline via PWA.</span></div></div>`;
  ov.hidden=false; frontOverlay(ov); const f=ov.querySelector('button'); if(f)f.focus(); }
function closeHelp(){ const ov=$('#help'); if(!ov)return; ov.hidden=true; menuFocus(sharedDialogOpen()); }
const helpCloseBtn=$('#help-close'); if(helpCloseBtn)helpCloseBtn.addEventListener('click',closeHelp);
const ctrlClose=$('#ctrl-close'); if(ctrlClose)ctrlClose.addEventListener('click',closeOptions);

/* Movimento reduzido (WCAG 2.3.3) + Pause/Stop/Hide (2.2.2) */
const RM_LABEL={parallax:'Parallax do fundo', decor:'Decoração (nuvens, grama)', items:'Animação de itens (moedas)', walk:'Personagem em movimento (andar, escalar, nadar, pular)', breath:'Respiração (parado)', flavor:'Gracinhas (animações de descanso)', particles:'Partículas e cintilação'};
const RM_SOON=new Set(['decor','items','particles']); // ainda sem alvo no motor (chega com a Cidade)
let selAnimPlayer=0;
function renderMotion(){ const el=$('#motion-list'); if(!el)return; if(selAnimPlayer>=numPlayers)selAnimPlayer=0;
  const tabs=$('#animation-players'); if(tabs){ tabs.hidden=true; // E3: sem abas — cada jogador edita só o seu
    tabs.innerHTML='';
    tabs.querySelectorAll('button[data-ap]').forEach(b=>b.addEventListener('click',()=>{ selAnimPlayer=+b.dataset.ap; renderMotion(); })); }
  const p=players[selAnimPlayer];
  const row=(lbl,on,attr,soon)=>`<div class="ctrl-row"><span>${lbl}${soon?' <em style="opacity:.7">(em breve)</em>':''}</span><button class="mode-btn switch${on?' is-on':''}" ${attr} type="button" aria-pressed="${on}" aria-label="${on?'Congelado':'Animado'}">${on?'❄ Congelado':'▶ Animado'}</button></div>`;
  const charRows=RM_CHAR.map(c=>row(c.lbl, p&&p[c.prop], 'data-rmc="'+c.prop+'"', false)).join('');
  const sceneRows=RM_KEYS.map(k=>row(RM_LABEL[k], rm[k], 'data-rm="'+k+'"', RM_SOON.has(k))).join('');
  el.innerHTML=`<h3 class="panel-sub">Personagem${numPlayers>1?' · Jogador '+(selAnimPlayer+1):''} <span class="panel-sub__tag">por jogador</span></h3>`+charRows+`<h3 class="panel-sub">Cena <span class="panel-sub__tag">todos os jogadores</span></h3>`+sceneRows;
  el.querySelectorAll('button[data-rmc]').forEach(b=>b.addEventListener('click',()=>{ const pr=b.dataset.rmc, pl=players[selAnimPlayer]; pl[pr]=!pl[pr]; try{localStorage.setItem('incl_'+pr+'_p'+selAnimPlayer,pl[pr]?'1':'0');}catch(e){} renderMotion(); }));
  el.querySelectorAll('button[data-rm]').forEach(b=>b.addEventListener('click',()=>{ const k=b.dataset.rm; rm[k]=!rm[k]; saveRM(); renderMotion(); updateMotionMaster(); srSay(RM_LABEL[k]+(rm[k]?' congelado.':' animado.')); }));
  updateMotionMaster();
}
function updateMotionMaster(){ reflectMotionBtn(); const m=$('#motion-master'); if(!m)return; const p=players[selAnimPlayer]; const allOn=RM_KEYS.every(k=>rm[k]) && RM_CHAR.every(c=>p&&p[c.prop]);
  m.textContent=allOn?'▶ Retomar todas as animações':'⏸ Parar todas as animações'; toggleBtn(m,allOn); }
function reflectAltMove(){ const p=players[selMovPlayer], on=!!(p&&p.toggleMove); const b=$('#opt-altmove'); if(b){ b.classList.toggle('is-on',on); b.setAttribute('aria-pressed',String(on)); b.textContent=on?'❚❚ Ligado':'▶ Desligado'; }
  reflectMovementBtn(); } // botão da barra acende se QUALQUER jogador usa Fácil/alternância
const altMoveBtn=$('#opt-altmove'); if(altMoveBtn)altMoveBtn.addEventListener('click',()=>{ setToggleMove(selMovPlayer, !players[selMovPlayer].toggleMove); reflectAltMove(); });
reflectFacil(); reflectAltMove();
// MENU Movimento (GAG: alternância) — separado do menu Animação (WCAG: movimento reduzido)
function openMovement(){ const ov=$('#movement'); if(!ov)return; renderMovPlayers(); reflectFacil(); reflectAltMove(); renderMapHub(); ov.hidden=false; frontOverlay(ov); movementOpen=true; const f=ov.querySelector('button'); if(f)f.focus(); }
function closeMovement(){ const ov=$('#movement'); if(!ov)return; ov.hidden=true; movementOpen=false; const b=$('#opt-movement'); if(b)b.focus(); }
// Submenu "Configurar botões de tela touch"
function openTouchCfg(){ const ov=$('#touchcfg'); if(!ov)return; renderTouchMap(); ov.hidden=false; frontOverlay(ov); const f=ov.querySelector('select,button'); if(f)f.focus(); }
function closeTouchCfg(){ const ov=$('#touchcfg'); if(!ov)return; ov.hidden=true; const b=$('#opt-touchcfg'); if(b)b.focus(); }
const touchCfgBtn=$('#opt-touchcfg'); if(touchCfgBtn)touchCfgBtn.addEventListener('click',openTouchCfg);
const touchCfgClose=$('#touchcfg-close'); if(touchCfgClose)touchCfgClose.addEventListener('click',closeTouchCfg);
// HUB de mapeamento (por jogador): teclado funciona (abre o remap); gamepad/olhos/setores/fala = em construção.
function mapSoon(nome){ srAlert(nome+': em construção — chega junto com os subsistemas de webcam e fala.'); }
function renderMapHub(){ const el=$('#map-hub'); if(!el)return; const np=numPlayers;
  const items=[
    {lbl:'⌨ Mapear teclado para modo 1 jogador', mode:1, act:openOptions},
    {lbl:'⌨ Mapear teclado para modo 2 jogadores', mode:2, act:openOptions},
    {lbl:'⌨ Mapear teclado para modo 3 jogadores', mode:3, act:openOptions},
    {lbl:'⌨ Mapear teclado para modo 4 jogadores', mode:4, act:openOptions},
    {lbl:'🎮 Mapear gamepad', soon:true},
    {lbl:'👁 Mapear olhos e boca', soon:true},
    {lbl:'🎯 Mapear setores de olhar', soon:true},
    {lbl:'🎤 Mapear palavras (fala)', soon:true},
  ];
  el.innerHTML='<h3 class="panel-sub">Mapear controles <span class="panel-sub__tag">por jogador</span></h3>'+
    items.map((it,i)=>{ const off=it.mode&&it.mode!==np, dis=it.soon||off; // teclado: só habilita no modo com esse nº de telas (o resto fica cinza)
      const note=it.soon?' <em style="opacity:.7">(em construção)</em>':'';
      return `<div class="ctrl-row${dis?' row-off':''}"><span>${it.lbl}${note}</span><button class="mode-btn" type="button" data-map="${i}"${dis?' disabled':''}>${it.soon?'Em breve':'Abrir'}</button></div>`; }).join('');
  el.querySelectorAll('button[data-map]').forEach(b=>b.addEventListener('click',()=>{ const it=items[+b.dataset.map]; if(it.soon){ mapSoon(it.lbl.replace(/^\S+\s/,'')); return; } if(it.mode&&it.mode!==np){ srAlert('Disponível só no modo '+it.mode+' jogador'+(it.mode>1?'es':'')+'. Troque o nº de telas na barra do topo.'); return; } it.act(); }));
}
function openAnimation(){ const ov=$('#animation'); if(!ov)return; renderMotion(); ov.hidden=false; frontOverlay(ov); animationOpen=true; const f=ov.querySelector('button'); if(f)f.focus(); }
function closeAnimation(){ const ov=$('#animation'); if(!ov)return; ov.hidden=true; animationOpen=false; const b=$('#opt-animation'); if(b)b.focus(); }
const movBtn=$('#opt-movement'); if(movBtn)movBtn.addEventListener('click',openMovement);
const movClose=$('#movement-close'); if(movClose)movClose.addEventListener('click',closeMovement);
const animBtn=$('#opt-animation'); if(animBtn)animBtn.addEventListener('click',openAnimation);
const animClose=$('#animation-close'); if(animClose)animClose.addEventListener('click',closeAnimation);
const motionMaster=$('#motion-master'); if(motionMaster)motionMaster.addEventListener('click',()=>{ const p=players[selAnimPlayer]; const allOn=RM_KEYS.every(k=>rm[k])&&RM_CHAR.every(c=>p&&p[c.prop]); const v=!allOn;
  RM_KEYS.forEach(k=>rm[k]=v); saveRM(); if(p)RM_CHAR.forEach(c=>{ p[c.prop]=v; try{localStorage.setItem('incl_'+c.prop+'_p'+selAnimPlayer,v?'1':'0');}catch(e){} }); // cena (global) + personagem (jogador selecionado)
  renderMotion(); srSay(v?'Todas as animações paradas.':'Todas as animações retomadas.'); });
function reflectMotionBtn(){ const b=$('#opt-animation'); if(b)b.classList.toggle('is-on',RM_KEYS.some(k=>rm[k])); } // realça o botão Animação quando há redução ativa
reflectMotionBtn(); // estado inicial (ex.: prefers-reduced-motion liga por padrão)
const ctrlReset=$('#ctrl-reset'); if(ctrlReset)ctrlReset.addEventListener('click',()=>{ try{localStorage.removeItem(CKEY);}catch(e){} KB=JSON.parse(JSON.stringify(KB_DEFAULTS)); applyControls(); assignControls(); renderControls(); srSay('Controles restaurados ao padrão.'); });

/* ===================== FPS ===================== */
let fpsAccum=0,fpsFrames=0,fpsMin=Infinity,fpsWarm=0;
function fpsTick(){ const fps=app.ticker.FPS; fpsWarm++; fpsAccum+=fps; fpsFrames++;
  if(fpsWarm>60&&fps<fpsMin)fpsMin=fps;
  if(fpsFrames>=30){ $('#hud-fps').textContent=String(Math.round(fpsAccum/fpsFrames));
    $('#hud-fpsmin').textContent=fpsMin===Infinity?'–':String(Math.round(fpsMin)); fpsAccum=0;fpsFrames=0; }
}

/* ===================== loop ===================== */
app.ticker.add(()=>{ const dt=Math.min(app.ticker.deltaTime,2); pollPads(); update(dt); draw(); fpsTick();
  if(phase==='playing'){ updateWeather(); updateAmbient(); updateGuide(); } }); // F4: clima + ambiente + guia auditivo (só durante o jogo)
window.__incl={app,get player(){return players[0];},players,get numPlayers(){return numPlayers;},setNumPlayers,activateScreens,fitsN,isMobile,pollPads,update,get coins(){return coins;},get collected(){return players[0].collected;},get powerups(){return powerups;},get gateOpen(){return gateOpen;},get gate(){return gate;},get ended(){return ended;},restartGame,get hcMode(){return hcMode;},setHC(v){setPlayerViz(0,v?'bordas':'normal');},get vizMode(){return players[0].viz;},applyViz(v){setPlayerViz(0,v);},setPlayerViz,VIZ_MODES,PALETTES,get footCount(){return _footCount;},get sonarCount(){return _sonarCount;},get guideCount(){return _guideCount;},get narrateCount(){return _narrateCount;},sonar:()=>sonar(players[0]),setHearingLoss,darkRegions,decoLayer,minimap,parallaxLayers,PARALLAX,setCenario,get cenario(){return CENARIO;},
  get mmSeen(){let n=0;for(const r of seen)for(const v of r)n+=v;return n;},get MODE(){return MODE;},get letterCase(){return letterCase;},get blindMode(){return blindMode;},brailleText,tileAt,WORLD_W,WORLD_H,TUNE};
srSay('Jogo carregado. Colete 10 moedas. Suba escadas com W/S, nade segurando pulo na água.');

/* dicas de início: somem ao pular ou após 8s */
let tipsTimer=setTimeout(hideTips,8000);
function hideTips(){ const el=$('#start-tips'); if(el)el.classList.add('hide'); clearTimeout(tipsTimer); }

/* ===== Layout: jogo em múltiplos inteiros de 320x180, centralizado; VLibras = 5:9 ao lado =====
   Usa o BOTÃO NATIVO do VLibras (reposicionado à direita do jogo). Detecta abertura/fechamento
   por polling e, ao abrir, reserva o slot 5:9 (jogo desloca à esquerda, conjunto 21:9 centraliza)
   e encaixa+escala o painel no slot. */
let librasOpen=false;
const vwBtn=()=>document.querySelector('[vw-access-button]');
function vlibrasOpen(){ const b=vwBtn(); if(!b)return false; const r=b.getBoundingClientRect(); return r.width===0||r.height===0||b.offsetParent===null; }
const LIBRAS_RESERVE=380; // px reservados p/ o painel do VLibras quando aberto
function layout(){
  const wrap=$('#stage-wrap'); if(!wrap)return;
  // ao abrir o VLibras, reserva espaço à direita → o jogo desloca p/ a esquerda e o conjunto centraliza
  wrap.style.paddingRight = librasOpen ? LIBRAS_RESERVE+'px' : '0px';
  const availW=(wrap.clientWidth||320) - (librasOpen?LIBRAS_RESERVE:0); // clientWidth inclui padding → descontar
  const availH=wrap.clientHeight||180;
  // E11: a grade de telas define a base (1=320×180, 2=640×180, 3-4=640×360)
  const cols=numPlayers<=1?1:(numPlayers<=2?numPlayers:2), rows=numPlayers<=2?1:2;
  const baseW=320*cols, baseH=180*rows;
  // múltiplo inteiro, MAS tolerando até 5px lógicos de corte por lado (×k) se isso aumentar o k.
  // overflow/lado ≤ 5k  ⇒  baseW·k − avail ≤ 10k  ⇒  k ≤ avail/(base−10)
  // Piso k=2: CADA viewport tem no mínimo 640×360 (320×180 lógico × 2). Assim 2×2 = 1280×720 cabe num
  // Chromebook do governo (1366×768). Se nesse mínimo não couber, a Etapa 4 vai bloquear aquele nº de telas.
  const MIN_K=2;
  const k=Math.max(MIN_K,Math.floor(Math.min(availW/(baseW-10), availH/(baseH-10))));
  const gr=$('#game-region'); if(gr){ gr.style.width=(baseW*k)+'px'; gr.style.height=(baseH*k)+'px'; gr.style.setProperty('--hud-fs', Math.max(9, Math.round(180*k*0.052))+'px'); } // fonte do HUD escala com a tela (alta definição)
  document.documentElement.style.setProperty('--ui-fs', (8*k)+'px'); // fonte-base dos menus: 16px a 640×360 (k=2) e escala com o canvas (8·k)
}
function vlTick(){ const o=vlibrasOpen(); if(o!==librasOpen){ librasOpen=o; layout(); } }
addEventListener('resize', layout);
setInterval(vlTick, 250);
layout(); requestAnimationFrame(layout); setTimeout(layout, 1500);
window.__incl.layout=layout; window.__incl.get_librasOpen=()=>librasOpen;

/* ===================== E14: shell — título/splash + pausa ===================== */
function setPhase(p){
  phase=p;
  // GAG: na pausa, silencia TODO o som do jogo (loops de ambiente/chuva inclusive) — o áudio volta ao retomar.
  if(_masterGain&&audioCtx) try{ _masterGain.gain.setTargetAtTime(p==='playing'?1:0, audioCtx.currentTime, 0.04); }catch(e){}
  const t=$('#title-overlay'), pa=$('#pause-overlay');
  if(t)t.hidden = p!=='title';
  if(pa)pa.hidden = true; // pausa GLOBAL aposentada (Etapa 2): agora é uma por tela (vpPause)
  vpPause.forEach(sp=>{ sp.hidden = p!=='paused'; });
  const tc=$('#touch-controls'); // controles de toque somem na pausa (o menu por tela é clicável direto) e voltam ao retomar
  if(tc){ if(p==='paused'){ if(!tc.hidden){ tc.dataset.wasOn='1'; tc.hidden=true; } }
    else if(p==='playing'){ if(tc.dataset.wasOn==='1' && numPlayers<=1)tc.hidden=false; delete tc.dataset.wasOn; }
    else { tc.hidden=true; delete tc.dataset.wasOn; } }
  const pb=$('#btn-pause'); if(pb)pb.setAttribute('aria-pressed',String(p==='paused'));
  if(p==='playing'){ const gr=$('#game-region'); if(gr)gr.focus(); }
  else if(p==='paused'){ if(typeof pauseSelect==='function')pauseSelect(); if(typeof reflectPauseIcons==='function')reflectPauseIcons(); }
  else if(p==='title'){ const b=$('#btn-play'); if(b)b.focus(); }
}
// NAVEGAÇÃO UNIVERSAL de menus: qualquer menu aberto (pausa OU submenu) é navegável por up/down/left/right/
// sim/não — as MESMAS ações valem para teclado, controle, olhos e fala. sim = confirma/alterna/entra;
// não = volta ao menu anterior (na raiz, volta ao jogo = Continuar). left/right ajustam select/slider.
const OVERLAY_CLOSE={ audio:()=>closeAudio(), movement:()=>closeMovement(), options:()=>closeOptions(), animation:()=>closeAnimation(), visual:()=>closeVisual(), empathy:()=>closeEmpathy(), touchcfg:()=>closeTouchCfg(), help:()=>closeHelp() };
// Ações do menu de pausa (compartilhadas pelos menus por tela). Ao abrir um submenu de a11y, escopa ao
// jogador que agiu (pauseActor) — o diálogo abre na aba dele (Etapa 3 remove as abas).
const pauseActs={ resume:()=>setPhase('playing'),
  letra:()=>{ letraIdx=(letraIdx+1)%LETRA.length; applyLetra(true); },
  audio:()=>openAudio(),
  motora:()=>{ selMovPlayer=pauseActor; openMovement(); },
  anim:()=>{ selAnimPlayer=pauseActor; openAnimation(); },
  visual:()=>{ selVizPlayer=pauseActor; openVisual(); },
  empatia:()=>{ selVizPlayer=pauseActor; openEmpathy(); }, print:()=>printMode(), quit:()=>quitGame(), ajuda:()=>openHelp() };
// Roteamento de input por jogador: cada tecla é do jogador dono dela (kbFor). Genéricas → jogador 0.
function actionOf(code,pi){ const m=kbFor(pi); for(const a in m){ if(m[a]&&m[a].indexOf(code)>=0)return a; } return null; }
function whichPlayer(code){ for(let i=0;i<numPlayers;i++){ if(actionOf(code,i))return i; } return -1; }
function sharedDialogOpen(){ const ov=[...document.querySelectorAll('#game-region .overlay')].filter(o=>!o.hidden); if(!ov.length)return null; ov.sort((a,b)=>(+getComputedStyle(a).zIndex||0)-(+getComputedStyle(b).zIndex||0)); return ov[ov.length-1]; }
function menuItems(menu){ const card=menu.querySelector('.overlay__card, .pause-card')||menu; return [...card.querySelectorAll('button:not([disabled]), select:not([disabled]), input[type=range]:not([disabled])')].filter(el=>el.offsetParent!==null); }
function menuFocus(menu){ if(!menu)return; const it=menuItems(menu); if(it.length){ const cur=it.indexOf(document.activeElement); (cur>=0?it[cur]:it[0]).focus(); } }
function dialogBack(menu){ const c=OVERLAY_CLOSE[menu.id]; if(c)c(); else menu.hidden=true; menuFocus(sharedDialogOpen()); }
function navDialog(menu,k){ const items=menuItems(menu); if(!items.length)return; let idx=items.indexOf(document.activeElement); if(idx<0){ idx=0; items[0].focus(); } const cur=items[idx];
  if(k.no){ dialogBack(menu); return; }
  if(k.left||k.right){ const d=k.right?1:-1;
    if(cur.tagName==='SELECT'){ cur.selectedIndex=Math.max(0,Math.min(cur.options.length-1,cur.selectedIndex+d)); cur.dispatchEvent(new Event('change',{bubbles:true})); return; }
    if(cur.tagName==='INPUT'){ const st=+cur.step||1; cur.value=Math.max(+cur.min,Math.min(+cur.max,(+cur.value)+d*st)); cur.dispatchEvent(new Event('input',{bubbles:true})); return; }
    idx=Math.max(0,Math.min(items.length-1,idx+d)); items[idx].focus(); return; }
  if(k.up||k.down){ idx=Math.max(0,Math.min(items.length-1,idx+(k.down?1:-1))); items[idx].focus(); return; }
  if(k.yes){ if(cur.tagName==='SELECT'){ cur.selectedIndex=(cur.selectedIndex+1)%cur.options.length; cur.dispatchEvent(new Event('change',{bubbles:true})); return; } if(cur.tagName==='INPUT')return; cur.click(); return; } }
function pauseSetSel(menu,el){ if(!el)return; menu.querySelectorAll('.pm-sel,.pi-sel').forEach(b=>b.classList.remove('pm-sel','pi-sel')); el.classList.add(el.classList.contains('pi-btn')?'pi-sel':'pm-sel');
  const cap=menu.querySelector('.pause-icons-cap'); if(cap){ if(el.classList.contains('pi-btn')){ cap.textContent=el.getAttribute('aria-label')||''; } else cap.textContent=''; } }
function navPause(menu,pi,k){ const icons=[...menu.querySelectorAll('.pi-btn')], items=[...menu.querySelectorAll('.pm-btn')];
  if(k.no){ setPhase('playing'); return; } // "não" na raiz → volta ao jogo (retoma todos)
  let cur=menu.querySelector('.pi-sel')||menu.querySelector('.pm-sel'); if(!cur)cur=items[0];
  if(k.yes){ pauseActor=pi; if(cur)cur.click(); return; }
  const cols=2;
  if(cur.classList.contains('pi-btn')){ // zona dos ícones (linha horizontal)
    let idx=icons.indexOf(cur); if(idx<0)idx=0;
    if(k.left)idx=Math.max(0,idx-1); else if(k.right)idx=Math.min(icons.length-1,idx+1);
    else if(k.down){ pauseSetSel(menu, items[0]); return; } // desce da barra → menu (Continuar)
    pauseSetSel(menu, icons[idx]); return; // "cima" na barra: fica
  }
  let idx=items.indexOf(cur); if(idx<0)idx=0;
  if(k.up){ if(idx<cols && icons.length){ pauseSetSel(menu, icons[Math.min(idx,icons.length-1)]); return; } idx=Math.max(0,idx-cols); } // sobe da 1ª linha → barra de ícones
  else if(k.down)idx=Math.min(items.length-1,idx+cols);
  else if(k.left)idx=Math.max(0,idx-1); else if(k.right)idx=Math.min(items.length-1,idx+1);
  pauseSetSel(menu, items[idx]); }
function menuNavKey(e){ if(phase!=='paused'||captureAction)return; const C=e.code;
  const owner=whichPlayer(C); const pi=owner<0?0:owner; const act=owner>=0?actionOf(C,pi):null;
  const yes=C==='Space'||C==='KeyJ'||C==='Enter'||C==='NumpadEnter'||act==='jump';
  const no=C==='Escape'||act==='especial';
  const up=C==='ArrowUp'||C==='KeyW'||act==='up', down=C==='ArrowDown'||C==='KeyS'||act==='down';
  const left=C==='ArrowLeft'||C==='KeyA'||act==='left', right=C==='ArrowRight'||C==='KeyD'||act==='right';
  if(!(yes||no||up||down||left||right))return; e.preventDefault(); e.stopPropagation();
  const k={yes,no,up,down,left,right};
  const dlg=sharedDialogOpen(); if(dlg){ navDialog(dlg,k); return; } // diálogo de a11y aberto: navega ele (compartilhado nesta etapa)
  const menu=vpPause[pi]; if(menu&&!menu.hidden)navPause(menu,pi,k); } // senão: menu de pausa do próprio jogador
addEventListener('keydown', menuNavKey, true);
function pauseSelect(){ vpPause.forEach(sp=>{ const items=[...sp.querySelectorAll('.pm-btn')]; items.forEach(b=>b.classList.remove('pm-sel')); if(items[0])items[0].classList.add('pm-sel'); }); } // 1º item (Continuar) selecionado em cada tela
function printMode(){ vpPause.forEach(sp=>sp.hidden=true); // Print: esconde as pausas → vê a tela limpa; qualquer botão volta
  const back=(e)=>{ if(e&&e.preventDefault)try{e.preventDefault();}catch(_){} window.removeEventListener('keydown',back,true); window.removeEventListener('pointerdown',back,true);
    if(phase==='paused'){ vpPause.forEach(sp=>sp.hidden=false); pauseSelect(); } };
  setTimeout(()=>{ window.addEventListener('keydown',back,true); window.addEventListener('pointerdown',back,true); }, 80);
  srSay('Modo Print: veja a tela sem menus. Aperte qualquer botão para voltar.'); }
function releaseKey(pl){ // portador saiu do jogo → a chave volta para a posição inicial (fica disponível de novo)
  if(!pl||!pl.hasKey)return; pl.hasKey=false;
  const key=powerups.find(p=>p.kind==='key'); if(key){ key.taken=false; key.by=[]; if(key.sprite)key.sprite.visible=true; srAlert('A chave voltou para o lugar de origem.'); } }
function quitGame(){ // Sair: single → volta ao título; MP → a tela DO JOGADOR QUE SAIU fica preta, os outros seguem
  if(numPlayers<=1){ restartGame(); setPhase('title'); srSay('Jogo abandonado.'); }
  else { const q=pauseActor||0; releaseKey(players[q]); players[q].quit=true; setPhase('playing'); srSay('Jogador '+(q+1)+' abandonou o jogo.'); } }
function togglePause(){ if(phase==='playing')setPhase('paused'); else if(phase==='paused')setPhase('playing'); }
(function shellSetup(){
  const wire=(id,fn)=>{ const b=$('#'+id); if(b)b.addEventListener('click',fn); };
  wire('btn-play', ()=>{ // B2: no celular, força 1 jogador e entra em tela cheia (gesto do clique autoriza o fullscreen)
    if(isMobile()){ if(numPlayers>1)setNumPlayers(1);
      try{ const el=document.documentElement, rf=el.requestFullscreen||el.webkitRequestFullscreen; if(rf)rf.call(el); }catch(e){} }
    setPhase('playing'); hideTips(); srSay('Jogo iniciado. Colete 10 moedas.'); });
  wire('btn-pause', togglePause); // (o botão saiu da barra; a fiação fica guardada p/ compat)
  // Barra de topo: ferramentas da direita (modo · nº telas · debug · FPS) só com ?debug=true.
  const tools=$('#topbar-tools'); if(tools){ if(/[?&]debug=true/.test(location.search))tools.hidden=false;
    const db=$('#btn-debug'); if(db)db.addEventListener('click',()=>{ const p=$('#debug-panel'); if(p){ p.hidden=!p.hidden; db.setAttribute('aria-pressed',String(!p.hidden)); } }); } // abre/fecha o painel de afinação
  // Menu de pausa: agora é POR TELA (buildScreenPause + pauseActs no escopo do módulo). Nada aqui.
  setPhase('title'); // estado inicial: tela de título
})();

/* ===================== E13: controles de toque (mobile) ===================== */
// oculta os botões de toque (chamado quando o jogador usa teclado/controle, p/ não atrapalhar)
// minimapa: no toque vai pro canto SUPERIOR DIREITO (o direcional, embaixo à esq., não o cobre); senão, inferior esquerdo
function setMinimapCorner(touch){ if(!minimap) return;
  if(touch){ minimap.x = LOGICAL_W - mmW - MM_PAD; minimap.y = MM_PAD; }
  else { minimap.x = MM_PAD; minimap.y = LOGICAL_H - mmH - MM_PAD; } }
// teclado/controle → esconde os botões e devolve o minimapa ao canto inferior esquerdo
function hideTouchControls(){ const tc=document.querySelector('#touch-controls'); if(tc && !tc.hidden) tc.hidden=true; document.body.classList.remove('touch-mode'); setMinimapCorner(false); }
// toque/clique → mostra os botões e move o MINIMAPA p/ o canto sup. direito. Em multi-tela, NÃO ativa.
function showTouchControls(){ if(numPlayers>1 || phase==='paused') return; const tc=document.querySelector('#touch-controls'); if(tc) tc.hidden=false; document.body.classList.add('touch-mode'); setMinimapCorner(true); } // não revela na pausa (o menu é clicável direto)
(function touchSetup(){
  const tc=$('#touch-controls'); if(!tc)return;
  // alternância por modalidade: toque/clique MOSTRA; teclado/controle OCULTA (hideTouchControls).
  if(/[?&]touch=1/.test(location.search)){ showTouchControls(); }
  addEventListener('pointerdown',()=>{ showTouchControls(); }, true); // qualquer toque/clique revela
  addEventListener('touchstart',()=>{ showTouchControls(); }, {capture:true,passive:true});
  const codeFor=(act)=>(controls[act]&&controls[act][0])||null; // mapeia p/ a 1ª tecla de P1 (remapeável)
  const press=(act)=>{ const c=codeFor(act); if(!c)return; if(!keys.has(c)){ keys.add(c);
    players.forEach(p=>{ if(!p.ctrl)return;
      if(act==='jump'&&p.ctrl.jump.includes(c))p.jumpEdge=true;
      if(act==='run'&&p.ctrl.run.includes(c))p.runEdge=true;
      if(act==='left'&&p.ctrl.left.includes(c))p.leftEdge=true;   // alternância: tap na direção
      if(act==='right'&&p.ctrl.right.includes(c))p.rightEdge=true;
      if(act==='swap'&&p.ctrl.swap&&p.ctrl.swap.includes(c))p.swapEdge=true;
      if(act==='especial'&&p.ctrl.especial&&p.ctrl.especial.includes(c))p.specialEdge=true; }); }
    if(act==='jump')hideTips(); };
  const release=(act)=>{ const c=codeFor(act); if(c)keys.delete(c); };
  const doTouch=(a,on)=>{ if(a==='pause'){ if(on)togglePause(); return; } on?press(a):release(a); }; // ação mapeável (função de cada botão)
  tc.querySelectorAll('.touch-btn').forEach(b=>{ const slot='b'+b.dataset.btn;  // função vem do touchMap (remapeável)
    const down=(e)=>{ e.preventDefault(); doTouch(touchMap[slot],true); };
    const up=(e)=>{ e.preventDefault(); doTouch(touchMap[slot],false); };
    b.addEventListener('pointerdown',down); b.addEventListener('pointerup',up);
    b.addEventListener('pointerleave',up); b.addEventListener('pointercancel',up);
    b.addEventListener('contextmenu',(e)=>e.preventDefault());
  });
  // START (enter): faz a função mapeada (padrão pausar); se for ação momentânea, pressiona e solta.
  const startBtn=$('#touch-start'); if(startBtn)startBtn.addEventListener('click',()=>{ const a=touchMap.start; if(a==='pause'){ togglePause(); } else { doTouch(a,true); setTimeout(()=>doTouch(a,false),140); } });
  // joystick digital: base (círculo grande) + manopla (círculo menor) que desliza p/ a direção tocada → 8 direções
  const stick=$('#touch-stick'), knob=stick&&stick.querySelector('.touch-knob');
  if(stick&&knob){
    let pid=null; // deslocamento (R) e zona-morta (DEAD) vêm de _stickTravelPx/_stickDeadPx (mm, config em A12e motora)
    const dirState={left:false,right:false,up:false,down:false};
    const setDir=(d,on)=>{ if(dirState[d]===on)return; dirState[d]=on; doTouch(touchMap[d],on); }; // direção física → função mapeada
    const move=(px,py)=>{ const R=_stickTravelPx, DEAD=_stickDeadPx; const r=stick.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
      let dx=px-cx, dy=py-cy; const m=Math.hypot(dx,dy)||1; const f=m>R?R/m:1;
      knob.style.transform=`translate(${dx*f}px,${dy*f}px)`;
      setDir('left',dx<-DEAD); setDir('right',dx>DEAD); setDir('up',dy<-DEAD); setDir('down',dy>DEAD); };
    const reset=()=>{ knob.style.transform='translate(0,0)'; ['left','right','up','down'].forEach(d=>setDir(d,false)); pid=null; };
    stick.addEventListener('pointerdown',(e)=>{ e.preventDefault(); pid=e.pointerId; try{stick.setPointerCapture(pid);}catch(_){} move(e.clientX,e.clientY); });
    stick.addEventListener('pointermove',(e)=>{ if(pid!==e.pointerId)return; e.preventDefault(); move(e.clientX,e.clientY); });
    const end=(e)=>{ if(pid!==e.pointerId)return; e.preventDefault(); reset(); };
    stick.addEventListener('pointerup',end); stick.addEventListener('pointercancel',end);
    stick.addEventListener('lostpointercapture',reset); stick.addEventListener('contextmenu',(e)=>e.preventDefault());
  }
  // D-pad em CRUZ (estilo alternativo ao analógico): superfície tocável dividida em 8 setores por hit-test
  // (dá diagonais como um D-pad físico). Zona-morta central evita disparo por encostar no meio.
  const cross=$('#touch-cross');
  if(cross){ const arms={up:cross.querySelector('.dpad-up'),down:cross.querySelector('.dpad-down'),left:cross.querySelector('.dpad-left'),right:cross.querySelector('.dpad-right')};
    const cst={left:false,right:false,up:false,down:false}; let cpid=null;
    const cset=(d,on)=>{ if(cst[d]===on)return; cst[d]=on; doTouch(touchMap[d],on); if(arms[d])arms[d].classList.toggle('on',on); }; // direção física → função mapeada
    const at=(px,py)=>{ const r=cross.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2; const dx=px-cx, dy=py-cy; const dead=r.width*0.18; // ~18% do lado = miolo neutro
      cset('left',dx<-dead); cset('right',dx>dead); cset('up',dy<-dead); cset('down',dy>dead); };
    const crst=()=>{ ['left','right','up','down'].forEach(d=>cset(d,false)); cpid=null; };
    cross.addEventListener('pointerdown',(e)=>{ e.preventDefault(); cpid=e.pointerId; try{cross.setPointerCapture(cpid);}catch(_){} at(e.clientX,e.clientY); });
    cross.addEventListener('pointermove',(e)=>{ if(cpid!==e.pointerId)return; e.preventDefault(); at(e.clientX,e.clientY); });
    const cend=(e)=>{ if(cpid!==e.pointerId)return; e.preventDefault(); crst(); };
    cross.addEventListener('pointerup',cend); cross.addEventListener('pointercancel',cend);
    cross.addEventListener('lostpointercapture',crst); cross.addEventListener('contextmenu',(e)=>e.preventDefault());
  }
  window.__incl.showTouch=()=>{ tc.hidden=false; }; // p/ testes em desktop
})();

/* ===================== ?debug=true: painel de afinação ao vivo (cadência etc.) ===================== */
(function debugPanel(){
  if(!/[?&]debug=true/.test(location.search)) return;
  const KNOBS=[
    {h:'Movimento (valores absolutos)'},
    {label:'Velocidade de andar', get:()=>TUNE.hWalk, set:v=>TUNE.hWalk=v, min:0.5, max:5, step:0.1},
    {label:'Velocidade de correr', get:()=>TUNE.hRun, set:v=>TUNE.hRun=v, min:1, max:7, step:0.1},
    {label:'Super-corrida (turbo)', get:()=>TUNE.hTurbo, set:v=>TUNE.hTurbo=v, min:1, max:9, step:0.1},
    {label:'Pulo (impulso inicial)', get:()=>TUNE.jumpVel, set:v=>TUNE.jumpVel=v, min:1, max:8, step:0.1},
    {label:'Ultra-pulo', get:()=>TUNE.ultraJumpVel, set:v=>TUNE.ultraJumpVel=v, min:3, max:16, step:0.1},
    {label:'Trampolim (base)', get:()=>TUNE.trampBase, set:v=>TUNE.trampBase=v, min:2, max:10, step:0.1},
    {label:'Trampolim (máximo)', get:()=>TUNE.trampMax, set:v=>TUNE.trampMax=v, min:3, max:14, step:0.1},
    {label:'Nado: impulso', get:()=>TUNE.waterJump, set:v=>TUNE.waterJump=v, min:1, max:7, step:0.1},
    {label:'Nado: impulso correndo', get:()=>TUNE.waterJumpRun, set:v=>TUNE.waterJumpRun=v, min:1, max:8, step:0.1},
    {label:'Nado: quadros/braçada', get:()=>TUNE.waterStrokeFrames, set:v=>TUNE.waterStrokeFrames=v, min:10, max:60, step:1},
    {label:'Escalada (velocidade)', get:()=>TUNE.climbSpeed, set:v=>TUNE.climbSpeed=v, min:0.5, max:4, step:0.1},
    {label:'Gravidade', get:()=>TUNE.gravity, set:v=>TUNE.gravity=v, min:0.05, max:0.4, step:0.01},
    {label:'Queda máxima', get:()=>TUNE.maxFall, set:v=>TUNE.maxFall=v, min:3, max:14, step:0.5},
    {label:'Queda máxima na água', get:()=>TUNE.waterMaxFall, set:v=>TUNE.waterMaxFall=v, min:1, max:8, step:0.5},
    {h:'Animação (cadência: ticks/quadro)'},
    {label:'Andar', get:()=>ANIM.walkHold, set:v=>ANIM.walkHold=v, min:1, max:20, step:1, cad:true},
    {label:'Correr', get:()=>ANIM.runHold, set:v=>ANIM.runHold=v, min:1, max:20, step:1, cad:true},
    {label:'Parado (idle)', get:()=>ANIM.idleHold, set:v=>ANIM.idleHold=v, min:2, max:40, step:1, cad:true},
    {label:'Nado', get:()=>ANIM.swimHold, set:v=>ANIM.swimHold=v, min:2, max:24, step:1, cad:true},
  ];
  const p=document.createElement('div'); p.id='debug-panel'; p.hidden=true; p.setAttribute('role','group'); p.setAttribute('aria-label','Painel de depuração'); // começa oculto; abre pelo botão 🐞 Debug
  p.style.cssText='position:fixed;top:8px;right:8px;z-index:200;background:rgba(11,16,32,.97);color:#fff;border:2px solid #ffd23f;border-radius:8px;padding:.6rem .7rem;font:13px/1.4 system-ui,sans-serif;max-width:270px;max-height:86vh;overflow:auto;box-shadow:0 4px 16px rgba(0,0,0,.5)';
  p.innerHTML='<strong>🔧 ?debug — valores ao vivo</strong>';
  KNOBS.forEach(k=>{
    if(k.h){ const h=document.createElement('div'); h.textContent=k.h; h.style.cssText='margin:.7rem 0 .1rem;font-weight:700;color:#ffd23f;border-bottom:1px solid rgba(255,210,63,.4)'; p.appendChild(h); return; }
    const row=document.createElement('div'); row.style.cssText='margin-top:.5rem';
    const lab=document.createElement('label'); lab.style.cssText='display:block;font-size:12px;margin-bottom:2px';
    const val=document.createElement('strong'); val.style.cssText='color:#ffd23f;float:right';
    const upd=()=>{ val.textContent = k.cad ? (k.get()+' ('+Math.round(60/k.get())+'fps)') : k.get(); };
    lab.textContent=k.label; lab.appendChild(val);
    const inp=document.createElement('input'); inp.type='range'; inp.min=k.min;inp.max=k.max;inp.step=k.step;inp.value=k.get(); inp.style.cssText='width:100%';
    inp.setAttribute('aria-label',k.label);
    inp.addEventListener('input',()=>{ k.set(parseFloat(inp.value)); upd(); });
    row.appendChild(lab); row.appendChild(inp); p.appendChild(row); upd();
  });
  document.body.appendChild(p);
})();

/* ===================== PWA ===================== */
if('serviceWorker' in navigator) addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
