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
const isSolidType = (t) => !!(TILE_TYPES[t] && TILE_TYPES[t].solid);
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
const solidAt=(tx,ty)=>(!gateOpen && gateTiles.has(tx+','+ty)) || isSolidType(tileAt(tx,ty));
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
function spriteToCanvas(art){
  const cv=makeCanvas(16,32),c=cv.getContext('2d');
  for(let y=0;y<32;y++){const row=art[y];if(!row)continue;
    for(let x=0;x<16;x++){const ch=row[x];if(ch==='.'||!ch)continue;c.fillStyle=APP[ch]||'#f0f';c.fillRect(x,y,1,1);}}
  return cv;
}
const isGroundType=(t)=>t===2||t===6; // chão/plataforma genéricos → recebem o tileset do tema
function worldToTexture(tiles){       // tiles={fill,surface} (HTMLImageElement) ou undefined → cor chapada
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
  return tex(cv);
}
function coinTexture(){
  const cv=makeCanvas(10,10),c=cv.getContext('2d');
  c.fillStyle='#1a1400';c.beginPath();c.arc(5,5,5,0,7);c.fill();
  c.fillStyle='#ffd23f';c.beginPath();c.arc(5,5,4,0,7);c.fill();
  c.fillStyle='#fff7c8';c.fillRect(3,2,2,5);
  return tex(cv);
}
function treeTexture(){
  const cv=makeCanvas(26,46),c=cv.getContext('2d');
  c.fillStyle='#5c4033';c.fillRect(11,28,4,18);                 // tronco
  c.fillStyle='#1f7a4d';c.beginPath();c.arc(13,17,12,0,7);c.fill(); // copa
  c.fillStyle='#2fa35f';c.beginPath();c.arc(8,15,7,0,7);c.fill();
  c.fillStyle='#46b06a';c.beginPath();c.arc(18,13,6,0,7);c.fill();
  return tex(cv);
}

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
function pickCoins(n){
  const a=shuffle(findCoinCandidates());
  const shapes = MODE==='somasub' ? shuffle(SOMASUB_SHAPES.map(s=>s.id)) : [];
  const letters = MODE==='silabas' ? shuffle(WORD_INITIALS) : []; // letra = inicial da palavra
  return a.slice(0,Math.min(n,a.length)).map((p,i)=>({
    x:p.tx*TILE+3, y:p.ty*TILE+3, taken:false,
    shape: shapes.length ? shapes[i%shapes.length] : '',
    letter: letters.length ? letters[i%letters.length] : '',
  }));
}

/* ===================== estado ===================== */
const $=(s)=>document.querySelector(s);
const SPAWN_X=2*TILE, SPAWN_Y=24*TILE;
const BOX={w:10,h:30};
// E11: jogadores como array (física por jogador). P1 = players[0] (compat single-player).
function makePlayer(i){ return {i,x:SPAWN_X+i*22,y:SPAWN_Y,vx:0,vy:0,onGround:false,onLadder:false,inWater:false,
  facing:1,anim:0,walkAnim:0,jumpBuffer:0,waterStroke:0,hurtTimer:0,quiz:null,jumpEdge:false,collected:0,ctrl:null,sprite:null,
  activePower:'off',owned:[],hasKey:false,jumpChain:0,groundIdle:0,clinging:false,clingN:null,runEdge:false,swapEdge:false,specialEdge:false,airTime:99,flying:false,idleNow:false,idleTime:0,flavor:-1,flavorT:0,climbFrame:0}; }
const POWER_MSG={superjump:'Super-pulo! O pulo fica sempre na altura máxima.',ultrajump:'Ultra-pulo! Pulos de distância gigante.',turbo:'Super-corrida! Correndo você fica bem mais rápido.',fly:'Asas! No ar, aperte Pular para começar a voar; Pular de novo encerra.',wallcling:'Ventosa (aranha)! No ar, aperte Correr perto de uma parede/teto para grudar; engatinha e contorna quinas; Correr de novo solta.'};
const POWER_SHORT={off:'—',superjump:'Super-pulo',ultrajump:'Ultra-pulo',turbo:'Super-corrida',fly:'Voo',wallcling:'Ventosa'};
function showPower(pl){ if(pl===players[0]){ const el=document.getElementById('hud-power'); if(el)el.textContent=(POWER_SHORT[pl.activePower]||'—')+(pl.owned&&pl.owned.length>1?' ('+pl.owned.length+')':''); } }
function jumpVel(pl,tiles){ return -TUNE.jumpVel*Math.sqrt(tiles/5)*(easy?EASY.jump:1); } // Fácil: pulo ×8/7
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
let phase='title'; // E14: 'title' | 'playing' | 'paused' — congela o jogo fora de 'playing'

/* ===================== input ===================== */
const keys=new Set(); let jumpEdge=false, captureAction=null, captureMapRef=null, optionsOpen=false, motionOpen=false;
const CKEY='inclusionist.kbcontrols.v3'; // esquemas de teclado por contagem de jogadores, editáveis + persistidos
// 8 ações: up,left,down,right,run(=corre/interage),jump,swap(troca poder),especial
const KB_DEFAULTS={
  // 1 jogador: WASD + setas; pulo J/Espaço; UJIK como na mão pequena do DOS. Sem Alt/AltGr/Ctrl/Shift (uso do SO; e Ctrl/Shift ficam pro modo Fácil).
  solo:{ left:['KeyA','ArrowLeft'], right:['KeyD','ArrowRight'], up:['KeyW','ArrowUp'], down:['KeyS','ArrowDown'],
         run:['KeyU'], jump:['KeyJ','Space'], swap:['KeyI'], especial:['KeyK'] },
  p2:[ { left:['KeyA'],right:['KeyD'],up:['KeyW'],down:['KeyS'], run:['KeyU'],jump:['KeyJ'],swap:['KeyI'],especial:['KeyK'] },
       { left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown'], run:['Numpad8'],jump:['Numpad5'],swap:['Numpad9'],especial:['Numpad6'] } ],
  p34:[ { left:['KeyA'],right:['KeyD'],up:['KeyW'],down:['KeyS'], run:['KeyZ'],jump:['KeyX'],swap:['KeyC'],especial:['KeyV'] },
        { left:['KeyJ'],right:['KeyL'],up:['KeyI'],down:['KeyK'], run:['KeyM'],jump:['Comma'],swap:['Period'],especial:['Semicolon','Slash'] },
        { left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown'], run:['Home'],jump:['End'],swap:['PageUp'],especial:['PageDown'] },
        { left:['Numpad4'],right:['Numpad6'],up:['Numpad8'],down:['Numpad5'], run:['Numpad2'],jump:['Numpad0'],swap:['Numpad3'],especial:['NumpadDecimal'] } ],
};
function loadKB(){ try{ const s=JSON.parse(localStorage.getItem(CKEY)); if(s){ const d=JSON.parse(JSON.stringify(KB_DEFAULTS));
  if(s.solo)Object.assign(d.solo,s.solo); ['p2','p34'].forEach(g=>{ if(Array.isArray(s[g]))s[g].forEach((m,i)=>{ if(d[g][i]&&m)Object.assign(d[g][i],m); }); }); return d; } }catch(e){}
  return JSON.parse(JSON.stringify(KB_DEFAULTS)); }
let KB=loadKB();
function saveKB(){ try{localStorage.setItem(CKEY,JSON.stringify(KB));}catch(e){} }
function kbFor(i){ return numPlayers<=1 ? KB.solo : (numPlayers<=2 ? (KB.p2[i]||KB.p2[0]) : (KB.p34[i]||KB.p34[0])); } // esquema do jogador i p/ a contagem atual
let controls=KB.solo; // alias do P1 (navegação do quiz + GAME_KEYS)
let KJUMP=controls.jump, KLEFT=controls.left, KRIGHT=controls.right, KUP=controls.up, KDOWN=controls.down, KRUN=controls.run;
let GAME_KEYS=[...KJUMP,...KLEFT,...KRIGHT,...KUP,...KDOWN];
function applyControls(){ controls=KB.solo; KJUMP=controls.jump;KLEFT=controls.left;KRIGHT=controls.right;KUP=controls.up;KDOWN=controls.down;KRUN=controls.run;
  const all=[]; players.forEach((p,i)=>{ const m=kbFor(i); for(const a in m) all.push(...m[a]); }); GAME_KEYS=all.length?all:[...KJUMP,...KLEFT,...KRIGHT,...KUP,...KDOWN]; }
const PCOLOR=[0xffffff,0xff9a9a,0x8affc0,0xffe08a]; // tint distintivo por jogador (P1 = normal)
function assignControls(){ players.forEach((p,i)=>p.ctrl=kbFor(i)); }
assignControls();
addEventListener('keydown',(e)=>{
  if(captureAction){ // remap: a próxima tecla vira o novo controle (do jogador selecionado)
    if(e.code!=='Escape'){ const m=captureMapRef||controls; m[captureAction]=[e.code]; saveKB(); applyControls(); assignControls(); }
    captureAction=null; captureMapRef=null; if(typeof renderControls==='function')renderControls(); e.preventDefault(); return;
  }
  if(optionsOpen){ if(e.code==='Escape')closeOptions(); return; } // diálogo aberto: não joga
  if(motionOpen){ if(e.code==='Escape')closeMotion(); return; }
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
  const easyKey = easy && numPlayers<=1 && (e.code==='ControlLeft'||e.code==='ControlRight'||e.code==='ShiftLeft'||e.code==='ShiftRight');
  const isGameKey = easyKey || GAME_KEYS.includes(e.code) || players.some(p=>p.ctrl && Object.values(p.ctrl).some(arr=>arr.includes(e.code)));
  if(isGameKey){ e.preventDefault(); hideTouchControls('teclado'); } // E13: jogar no teclado oculta os botões de toque
  if(!keys.has(e.code)){ for(const p of players){ if(!p.ctrl)continue;
    if(p.ctrl.jump.includes(e.code)) p.jumpEdge=true;
    if(p.ctrl.run.includes(e.code) && !easy) p.runEdge=true; // Fácil: sem correr
    if(p.ctrl.swap&&p.ctrl.swap.includes(e.code)) p.swapEdge=true;
    if(p.ctrl.especial&&p.ctrl.especial.includes(e.code)) p.specialEdge=true; }
    if(easyKey){ if(e.code.startsWith('Control')) player.specialEdge=true; else player.swapEdge=true; } }
  keys.add(e.code); });
addEventListener('keyup',(e)=>keys.delete(e.code));
addEventListener('blur',()=>keys.clear());
const anyOf=(arr)=>arr.some(k=>keys.has(k));
const held=(pl,act)=>pl.ctrl[act].some(k=>keys.has(k));

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
let audioCtx=null, soundOn=true, captionsOn=true, easy=false, volume=0.6, capTimer=null;
// Modo Fácil (deficiência motora): gravidade ×2/3, pulo ×8/7, andar ×0.7, sem perigos, sem correr,
// hitbox de coleta +4px, moedas no chão, proteção de borda, pula-pula suave (segurar = flutuar descendo).
const EASY={grav:2/3, jump:8/7, speed:0.7, pad:4, slowFall:1.4, tramp:3.4};
// Movimento reduzido (WCAG 2.3.3 AA). 5 alvos; padrão herda prefers-reduced-motion; persistido.
// Hoje agem 'parallax' e 'walk'; 'decor/items/particles' ficam prontos e ligam quando a Cidade animar.
const RM_KEYS=['parallax','decor','items','walk','particles'];
const RM_DEFAULT=!!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const rm=(()=>{ try{ const s=JSON.parse(localStorage.getItem('inclusionist.reducedmotion.v1')); if(s&&typeof s==='object'){ const o={}; RM_KEYS.forEach(k=>o[k]=!!s[k]); return o; } }catch(e){}
  const o={}; RM_KEYS.forEach(k=>o[k]=RM_DEFAULT); return o; })();
function saveRM(){ try{ localStorage.setItem('inclusionist.reducedmotion.v1',JSON.stringify(rm)); }catch(e){} }
function showCaption(txt){ const el=$('#caption'); if(!el||!txt)return; el.textContent=txt; el.classList.add('show'); clearTimeout(capTimer); capTimer=setTimeout(()=>{el.classList.remove('show'); el.textContent='';},1300); }
function sfx(name){
  const c=SFX[name]; if(!c)return;
  if(captionsOn && c.cap) showCaption(c.cap);   // legenda (visual + aria-live via role=status)
  if(!soundOn || volume<=0) return;
  try{
    if(!audioCtx){ const AC=window.AudioContext||window.webkitAudioContext; if(AC)audioCtx=new AC(); }
    if(!audioCtx) return; if(audioCtx.state==='suspended') audioCtx.resume();
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.type=c.t; o.frequency.value=c.f; g.gain.value=0.0001; o.connect(g).connect(audioCtx.destination);
    const t=audioCtx.currentTime;
    g.gain.exponentialRampToValueAtTime(Math.max(0.02,0.25*volume), t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t+c.d);
    o.start(t); o.stop(t+c.d+0.02);
  }catch(e){}
}
// ===== Vitória: jingle 8-bit ascendente + fogos de artifício (assobio subindo → estouro/crepitar) =====
function ensureAC(){ if(!audioCtx){ const AC=window.AudioContext||window.webkitAudioContext; if(AC)audioCtx=new AC(); } if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume(); return audioCtx; }
function tone(freq,dur,type,when,vol){ if(!soundOn||volume<=0)return; try{ const ac=ensureAC(); if(!ac)return; const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+(when||0);
  o.type=type||'square'; o.frequency.setValueAtTime(freq,t); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(0.02,(vol||0.22)*volume),t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t+dur+0.02); }catch(e){} }
function firework(when){ if(!soundOn||volume<=0)return; try{ const ac=ensureAC(); if(!ac)return; const t=ac.currentTime+(when||0);
  const o=ac.createOscillator(),g=ac.createGain(); o.type='sine'; o.frequency.setValueAtTime(300,t); o.frequency.exponentialRampToValueAtTime(1200,t+0.35); // assobio subindo
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.12*volume,t+0.05); g.gain.exponentialRampToValueAtTime(0.0001,t+0.36); o.connect(g).connect(ac.destination); o.start(t); o.stop(t+0.4);
  [0,0.04,0.09,0.15,0.22].forEach((dt,i)=>{ const po=ac.createOscillator(),pg=ac.createGain(),tt=t+0.36+dt; po.type='square'; po.frequency.setValueAtTime(180+((i*131)%520),tt); // estouro/crepitar
    pg.gain.setValueAtTime(0.18*volume,tt); pg.gain.exponentialRampToValueAtTime(0.0001,tt+0.09); po.connect(pg).connect(ac.destination); po.start(tt); po.stop(tt+0.11); }); }catch(e){} }
function playVictory(){ [[523,0],[659,0.12],[784,0.24],[1047,0.36],[988,0.52],[1319,0.64]].forEach(([f,w])=>tone(f,0.16,'square',w,0.22)); [0.2,0.8,1.35,1.9].forEach(w=>firework(w)); }

/* ===================== Pixi ===================== */
PIXI.settings.ROUND_PIXELS=true;
const app=new PIXI.Application({width:LOGICAL_W,height:LOGICAL_H,backgroundColor:0x05070f,
  antialias:false,resolution:1,powerPreference:'low-power'});
$('#pixi-mount').appendChild(app.view);
app.view.setAttribute('aria-hidden','true');
const camera=new PIXI.Container(); app.stage.addChild(camera);

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
    t.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST; ts.texture=t; });
  loadTileImages(theme).then(tiles=>{ if(tiles && worldSprite) worldSprite.texture=worldToTexture(tiles); }); // reconstrói o chão com o tileset do tema
  try{ localStorage.setItem('incl_cenario',theme); }catch(e){}
}
const worldSprite=new PIXI.Sprite(worldToTexture()); camera.addChild(worldSprite);
try{ setCenario(localStorage.getItem('incl_cenario')||'cidade'); }catch(e){ setCenario('cidade'); }
const coinTex=coinTexture();
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
    if(easy){ const tx=Math.floor((cn.x+5)/TILE); let fy=null;
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
    else { s=new PIXI.Sprite(coinTex); s.x=cn.x;s.y=cn.y; }
    s.visible=!cn.taken; coinContainer.addChild(s); return s;
  });
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
// Fonte única dos sprites: assets/sprites/menino/<animação>/<i>.png (cor, editado no Aseprite)
// + <i>_hc.png (silhueta alto-contraste, GERADA por tools/build-hc.py). Não existe mais a pasta achatada pip/.
const SPR='assets/sprites/menino/';
const pngTex=(f)=>{ const t=PIXI.Texture.from(SPR+f); t.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST; return t; };
const A=(anim,n)=>Array.from({length:n},(_,i)=>pngTex(anim+'/'+i+'.png'));        // frames de cor
const H=(anim,n)=>Array.from({length:n},(_,i)=>pngTex(anim+'/'+i+'_hc.png'));     // silhuetas _hc
const TEX_IDLE=A('idle',4);          // idle = RESPIRAÇÃO por frames (cabeça congelada → sem 'mastigar'; só o tronco respira)
const TEX_WALK=A('andar',8);         // ANDAR = running-8 (postura ereta/leve) — José pediu manter estes como andar
const TEX_RUN=A('correr',4);         // CORRER = sprint AGRESSIVA (inclinada, braços grandes) — 4 quadros
const TEX_HC_IDLE=[pngTex('idle/0_hc.png')];
const TEX_HC_WALK=H('andar',8);
const TEX_HC_RUN=H('correr',4);
// E20: idles ocasionais ("gracinhas") — parado um tempo, toca uma e volta a respirar
const TEX_JOINHA=A('gracinha-joinha',2), TEX_HC_JOINHA=H('gracinha-joinha',2);
const TEX_ESPREG=A('gracinha-espreguicar',2), TEX_HC_ESPREG=H('gracinha-espreguicar',2);
const TEX_AQUECER=A('gracinha-aquecer',1), TEX_HC_AQUECER=H('gracinha-aquecer',1);
const FLAVORS=[
  {tex:TEX_JOINHA, hc:TEX_HC_JOINHA, seq:[0,1,0,1,0,1], hold:12}, // joínha (bounce do polegar)
  {tex:TEX_ESPREG, hc:TEX_HC_ESPREG, seq:[0,1,1,1,1,0], hold:16}, // espreguiçar (sobe, segura, desce)
  {tex:TEX_AQUECER, hc:TEX_HC_AQUECER, seq:[0,0,0], hold:40},     // aquecer (segura a pose)
];
// E16: pulo — pose aérea estática (sobe=pernas recolhidas / cai=pernas estendidas), recortadas do jumping-1 SE
const TEX_JUMP_UP=pngTex('pulo/0.png'), TEX_JUMP_DOWN=pngTex('pulo/1.png');
const TEX_HC_JUMP_UP=pngTex('pulo/0_hc.png'), TEX_HC_JUMP_DOWN=pngTex('pulo/1_hc.png');
// E17: poses de estado — escada, água, voo, ventosa
const TEX_CLIMB=A('escada',2), TEX_FLY=pngTex('voo/0.png'); // ESCADA: vista de COSTAS (rotação norte), 2 quadros alternados
const TEX_HC_CLIMB=H('escada',2), TEX_HC_FLY=pngTex('voo/0_hc.png');
// E18f: aranha — ANDAR NA PAREDE e ANDAR NO TETO são ciclos distintos (4 quadros cada)
const TEX_CLING_WALL=A('parede',4), TEX_HC_CLING_WALL=H('parede',4);
const TEX_CLING_CEIL=A('teto',4), TEX_HC_CLING_CEIL=H('teto',4);
const TEX_SWIM=A('nadar',2), TEX_HC_SWIM=H('nadar',2); // nado MOVENDO: braçada + pernas
const TEX_SWIMIDLE=A('nadar-parado',2), TEX_HC_SWIMIDLE=H('nadar-parado',2); // nado PARADO: só pernas batendo
let hcMode = !!(window.matchMedia && matchMedia('(prefers-contrast: more)').matches);
// E4: decoração de fundo (árvores) ATRÁS do jogador — sempre visível, NÃO some ao pular
const decoLayer=new PIXI.Container(); camera.addChild(decoLayer);
(function placeTrees(){
  const tt=treeTexture(); let last=-99;
  for(let tx=2;tx<WORLD_W-2;tx++){
    for(let ty=3;ty<WORLD_H-1;ty++){
      if(tileAt(tx,ty)===1 && solidAt(tx,ty+1) && tileAt(tx,ty-1)===1){
        if(tx-last>=5){ const s=new PIXI.Sprite(tt); s.anchor.set(0.5,1); s.x=tx*TILE+TILE/2; s.y=(ty+1)*TILE; decoLayer.addChild(s); last=tx; }
        break;
      }
    }
  }
})();
/* ===================== E12: power-ups + chave/portão ===================== */
function powerupTexture(kind){
  const cv=makeCanvas(12,12),c=cv.getContext('2d');
  const COL={superjump:'#7fdcff',ultrajump:'#b388ff',turbo:'#34e29b',fly:'#c8a2ff',wallcling:'#ff9a4d',key:'#ffd23f'};
  c.fillStyle='#04121a'; c.beginPath(); if(c.roundRect)c.roundRect(0.5,0.5,11,11,3); else c.rect(0.5,0.5,11,11); c.fill();
  c.fillStyle=COL[kind]||'#7fdcff';
  if(kind==='superjump'){ c.beginPath();c.moveTo(6,1.5);c.lineTo(10,5);c.lineTo(2,5);c.closePath();c.moveTo(6,6);c.lineTo(10,9.5);c.lineTo(2,9.5);c.closePath();c.fill(); }      // ▲▲ super-pulo
  else if(kind==='ultrajump'){ c.beginPath();c.moveTo(6,1);c.lineTo(10,6);c.lineTo(7.5,6);c.lineTo(7.5,11);c.lineTo(4.5,11);c.lineTo(4.5,6);c.lineTo(2,6);c.closePath();c.fill(); } // ↑ ultra-pulo
  else if(kind==='turbo'){ c.beginPath();c.moveTo(2,3);c.lineTo(7,6);c.lineTo(2,9);c.closePath();c.moveTo(6,3);c.lineTo(11,6);c.lineTo(6,9);c.closePath();c.fill(); }              // » super-corrida
  else if(kind==='fly'){ c.beginPath();c.moveTo(6,3);c.lineTo(11,9);c.lineTo(6,7);c.lineTo(1,9);c.closePath();c.fill(); }                                                          // asa = voo
  else if(kind==='wallcling'){ c.beginPath();c.arc(6,7,3.5,0,7);c.fill(); c.fillStyle='#04121a'; c.beginPath();c.arc(6,7,1.4,0,7);c.fill(); }                                       // ventosa
  else { c.beginPath();c.arc(4,6,3,0,7);c.fill();c.fillRect(6,5,5,2);c.fillRect(9,5,2,4); }                                                                                        // ⚷ chave
  return tex(cv);
}
const PUP_TEX={superjump:powerupTexture('superjump'),ultrajump:powerupTexture('ultrajump'),turbo:powerupTexture('turbo'),fly:powerupTexture('fly'),wallcling:powerupTexture('wallcling'),key:powerupTexture('key')};
const extraLayer=new PIXI.Container(); camera.addChild(extraLayer); // power-ups + portão (atrás do player)
let powerups=[];
function rebuildExtras(){
  extraLayer.removeChildren().forEach(s=>s.destroy());
  powerups.forEach(pu=>{ const s=new PIXI.Sprite(PUP_TEX[pu.kind]); s.x=pu.x; s.y=pu.y; s.visible=!pu.taken; extraLayer.addChild(s); pu.sprite=s; });
  if(gate && !gateOpen){ const g=new PIXI.Graphics();
    for(const k of gateTiles){ const [tx,ty]=k.split(',').map(Number); const X=tx*TILE,Y=ty*TILE;
      g.beginFill(0x8a5a2b).drawRect(X,Y,TILE,TILE).endFill();
      g.beginFill(0x5a3a1b); for(let i=2;i<TILE;i+=5)g.drawRect(X+i,Y+1,2,TILE-2); g.endFill();
    }
    extraLayer.addChild(g);
  }
}
function setupExtras(){
  // itens e portão vêm das posições REAIS do mapa Clarity (não mais aleatórios)
  powerups = MAP_ITEMS.map(it=>({ x:it.tx*TILE+2, y:it.ty*TILE+2, kind:it.kind, taken:false, sprite:null }));
  gateTiles = new Set(MAP_GATE.map(g=>g.tx+','+g.ty));
  gate = MAP_GATE.length ? MAP_GATE : null;
  gateOpen = MAP_GATE.length===0; // havendo portão, começa FECHADO (abre com a chave)
  rebuildExtras();
}
setupExtras();

// Fácil: retângulo translúcido mostrando a hitbox de coleta tolerante (sob o player)
const easyHitbox=new PIXI.Graphics(); camera.addChild(easyHitbox);

const playerSprite=new PIXI.Sprite(TEX_IDLE[0]); playerSprite.anchor.set(0.5,1); camera.addChild(playerSprite);
players[0].sprite=playerSprite;
/* E11: sprites por jogador + render multi-viewport (render-to-texture) */
let allPSprites=[playerSprite];
function ensureSprites(){
  for(let i=allPSprites.length;i<numPlayers;i++){ const s=new PIXI.Sprite(TEX_IDLE[0]); s.anchor.set(0.5,1); camera.addChild(s); allPSprites.push(s); }
  allPSprites.forEach((s,i)=>{ s.visible=i<numPlayers; s.tint=PCOLOR[i]||0xffffff; if(i<numPlayers)players[i].sprite=s; });
}
let vpTex=[], vpSpr=[], vpFrames=null;
function configureRender(){
  vpSpr.forEach(s=>s.destroy()); vpSpr=[]; vpTex.forEach(t=>t.destroy(true)); vpTex=[];
  if(vpFrames){ vpFrames.destroy(); vpFrames=null; }
  if(numPlayers<=1){
    if(camera.parent!==app.stage) app.stage.addChildAt(camera,0);
    minimap.visible=true; app.renderer.resize(LOGICAL_W,LOGICAL_H);
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
  }
}

// E5: minimapa estilo Metroid (canto inferior esquerdo, fixo na tela, fog-of-war)
const MM_SCALE=0.8, MM_PAD=4, mmW=WORLD_W*MM_SCALE, mmH=WORLD_H*MM_SCALE;
const minimap=new PIXI.Container(); minimap.x=MM_PAD; minimap.y=LOGICAL_H-mmH-MM_PAD; minimap.alpha=0.92;
app.stage.addChild(minimap);
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
      const tt=tileAt(tx,ty); if(tt===3)water=true; if(tt===4)ladder=true; if(tt===9)lava=true;
    }
  return {water,ladder,lava};
}
function resolveX(pl){
  const l=pl.x-BOX.w/2,r=pl.x+BOX.w/2,t=pl.y-BOX.h,b=pl.y;
  const c0=Math.floor(l/TILE),c1=Math.floor((r-0.01)/TILE),r0=Math.floor(t/TILE),r1=Math.floor((b-0.01)/TILE);
  for(let row=r0;row<=r1;row++)for(let col=c0;col<=c1;col++){ if(!solidAt(col,row))continue;
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
      if(type===5){ pl.vy = easy ? -EASY.tramp : -(held(pl,'jump')?TUNE.trampMax:TUNE.trampBase); } // Fácil: quique fixo suave (sem cadeia de carga)
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
  if(pl.quiz)return; // P1 em desafio (Soma-Sub/Sílabas; MP é Lúdico)
  const run=held(pl,'run') && !easy, dir=(held(pl,'right')?1:0)-(held(pl,'left')?1:0); // Fácil: sem correr
  const turbo=pl.activePower==='turbo';
  pl.vx=dir*(easy?TUNE.hWalk*EASY.speed:(run?(turbo?TUNE.hTurbo:TUNE.hRun):TUNE.hWalk)); if(dir!==0)pl.facing=dir; // E18: super-corrida (turbo); Fácil: andar ×0.7
  const feat=sampleFeatures(pl); pl.inWater=feat.water; pl.onLadder=feat.ladder;
  if(pl.hurtTimer>0)pl.hurtTimer-=dt;
  if(feat.lava && !easy) triggerLava(pl);
  if(pl.jumpEdge)pl.jumpBuffer=7; else if(pl.jumpBuffer>0)pl.jumpBuffer--;
  // E18: ventosa (homem-aranha) — gruda na parede ao apertar Correr no ar; solta com Pular
  if(pl.clinging && (pl.onLadder||pl.inWater||pl.activePower!=='wallcling' || pl.onGround || clingSides(pl).D)) pl.clinging=false; // E18d: pés numa superfície estável (sólido logo abaixo) ENCERRAM; pendurado no teto (pés p/ cima) ou na parede alta continua
  if(pl.activePower==='wallcling' && !pl.clinging && pl.runEdge && !pl.onGround && !pl.onLadder && !pl.inWater && firstClingSide(pl)){ pl.clinging=true; pl.clingN=firstClingSide(pl); pl.vy=0; pl.vx=0; pl.jumpBuffer=0; sfx('power'); srSay('Modo aranha! Engatinha em paredes e teto; contorna quinas. Correr solta.'); }
  else if(pl.clinging && pl.runEdge){ pl.clinging=false; sfx('power'); srSay('Soltou da superfície.'); } // E18b: CANCELA só com Correr (não com Pular); a caixa não larga a superfície antes disso
  if(!pl.clinging) pl.clingN=null;
  // TROCAR PODER: cicla o poder ativo entre os coletados (inventário). HUD mostra o atual.
  if(pl.swapEdge && pl.owned.length){ const seq=['off',...pl.owned]; let idx=seq.indexOf(pl.activePower); pl.activePower=seq[(idx+1)%seq.length];
    pl.clinging=false; pl.flying=false; sfx('power'); showPower(pl); srSay(pl.activePower==='off'?'Sem poder ativo.':(POWER_MSG[pl.activePower]||'Poder ativado!')); }
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
    if(held(pl,'up'))pl.vy=-TUNE.climbSpeed; else if(held(pl,'down'))pl.vy=TUNE.climbSpeed;
    if(pl.jumpBuffer>0){ pl.vy=(pl.activePower==='ultrajump')?-TUNE.ultraJumpVel:jumpVel(pl,pl.activePower==='superjump'?9:5); pl.onLadder=false; pl.jumpBuffer=0; sfx('jump'); hideTips(); }
  } else if(pl.flying){ // voo ATIVO: Cima sobe / Baixo desce / plana parado. Pular alterna (tratado acima)
    pl.waterStroke=0; const fs=turbo?3.9:2.6;
    if(held(pl,'up')) pl.vy=-fs; else if(held(pl,'down')) pl.vy=fs; else pl.vy*=0.7;
    pl.vy=Math.max(-fs,Math.min(fs,pl.vy));
  } else {
    const g = (pl.inWater?0.10:TUNE.gravity)*(easy?EASY.grav:1); // Fácil: gravidade ×2/3
    if(!(pl.onGround&&pl.vy>=0)) pl.vy += g*dt;
    if(easy && held(pl,'jump') && pl.vy>EASY.slowFall && !pl.inWater) pl.vy=EASY.slowFall; // Fácil: segurar pulo = flutua descendo
    if(pl.inWater){
      if(held(pl,'jump')){ if(pl.waterStroke<=0){ pl.vy-=run?TUNE.waterJumpRun:TUNE.waterJump; pl.waterStroke=TUNE.waterStrokeFrames; } }
      else pl.waterStroke=0;
      if(pl.waterStroke>0)pl.waterStroke-=dt;
      pl.vy=Math.min(pl.vy,TUNE.waterMaxFall);
    } else {
      pl.waterStroke=0;
      if(pl.onGround&&pl.jumpBuffer>0){ // E18: pulo encadeado (bunny-hop 5→8→9 correndo) + super(9)/ultra(22)
        if(run && isBouncyGroundBelow(pl) && pl.jumpChain>0) pl.jumpChain=Math.min(pl.jumpChain+1,3); else pl.jumpChain=1;
        pl.vy = (pl.activePower==='ultrajump') ? -TUNE.ultraJumpVel : jumpVel(pl, pl.activePower==='superjump'?9:[0,5,8,9][pl.jumpChain]);
        pl.onGround=false; pl.jumpBuffer=0; fired=true; sfx('jump'); hideTips();
      }
      pl.vy=Math.min(pl.vy,TUNE.maxFall);
    }
  }
  // Fácil: proteção de borda — andar não derruba em fosso; só cai segurando ↓ (não vale na água/escada/voo/aranha)
  if(easy && pl.onGround && pl.vx!==0 && !held(pl,'down') && !pl.inWater && !pl.onLadder && !pl.flying && !pl.clinging){
    const dirX=pl.vx>0?1:-1, leadX=pl.x+dirX*(BOX.w/2)+pl.vx*dt;
    if(!solidAt(Math.floor(leadX/TILE), Math.floor((pl.y+1)/TILE))) pl.vx=0;
  }
  const _preX=pl.x, _preY=pl.y;
  pl.x+=pl.vx*dt; resolveX(pl);
  pl.onGround=false; pl.y+=pl.vy*dt; resolveY(pl);
  if(pl.clinging) spiderReattach(pl,_preX,_preY); // E18c: mantém contato e contorna quinas (parede↔teto↔topo)
  if(pl.onGround && !fired){ if(++pl.groundIdle>10)pl.jumpChain=0; } else pl.groundIdle=0; // zera cadeia parado
  if(pl.onGround) pl.airTime=0; else pl.airTime+=dt; // E16: tempo no ar (estabiliza anim — onGround pisca ao repousar)
  if(pl.y-BOX.h>WORLD_PX_H+40){ pl.x=SPAWN_X; pl.y=SPAWN_Y; pl.vx=pl.vy=0; }
  // coletar (P1 abre quiz nos modos didáticos; MP é Lúdico). Fácil: hitbox de coleta +4px por lado.
  const pad=easy?EASY.pad:0;
  const box={x:pl.x-BOX.w/2-pad,y:pl.y-BOX.h-pad,w:BOX.w+2*pad,h:BOX.h+2*pad};
  coins.forEach((cn,i)=>{ if(cn.taken)return;
    const big=(MODE!=='ludico'); const sz=big?15:9, ox=big?3:0;
    if(box.x<cn.x+sz-ox&&box.x+box.w>cn.x-ox&&box.y<cn.y+sz-ox&&box.y+box.h>cn.y-ox){
      if(MODE==='somasub'&&cn.shape){ if(pl===player&&!player.quiz) openQuiz(i,cn.shape); }
      else if(MODE==='silabas'&&cn.letter){ if(pl===player&&!player.quiz) openSilabas(i,cn.letter); }
      else { cn.taken=true; coinSprites[i].visible=false; pl.collected++; if(pl===player)collected=pl.collected; sfx('coin');
        updateHud(); srSay((numPlayers>1?`Jogador ${pl.i+1}: `:'')+`Moeda ${pl.collected} de ${COIN_TARGET}.`);
        if(pl.collected>=COIN_TARGET)win(pl); }
    }});
  // E12: power-ups + chave (por jogador) e portão (compartilhado)
  powerups.forEach(pu=>{ if(pu.taken)return;
    if(box.x<pu.x+12 && box.x+box.w>pu.x && box.y<pu.y+12 && box.y+box.h>pu.y){
      pu.taken=true; if(pu.sprite)pu.sprite.visible=false; const who=numPlayers>1?`Jogador ${pl.i+1}: `:'';
      if(pu.kind==='key'){ pl.hasKey=true; sfx('key'); srAlert(who+'pegou a chave. Toque no portão para abri-lo.'); }
      else { if(!pl.owned.includes(pu.kind))pl.owned.push(pu.kind); pl.activePower=pu.kind; pl.clinging=false; pl.flying=false; sfx('power'); showPower(pl); srSay(who+(POWER_MSG[pu.kind]||'Poder ativado!')+' (Trocar poder cicla entre os coletados.)'); } // entra no inventário; ativo = o último pego
    }});
  if(gate && !gateOpen && pl.hasKey){ // portão (vários tiles) abre se o portador da chave o toca (margem: vale por cima/ao lado)
    const m=4; for(const gt of gate){ const X=gt.tx*TILE, Y=gt.ty*TILE;
      if(box.x<X+TILE+m && box.x+box.w>X-m && box.y<Y+TILE+m && box.y+box.h>Y-m){ gateOpen=true; rebuildExtras(); sfx('gate'); srAlert('Portão aberto!'); break; } }
  }
  // animação por frames (E15). 'moving' baseado no INPUT (direção segurada), NÃO em vx — a colisão
  // zera vx por frames e isso resetava o ciclo (só apareciam 2 quadros). Assim os 8 quadros tocam contínuos.
  // E16: estado aéreo ESTÁVEL — subindo (vy<0) entra na hora; cair/sair de borda só após coyote-time.
  // Evita o flicker walk↔jump no pouso (onGround pisca 1 frame ao repousar). 'grounded' p/ anim.
  const COYOTE=5, grounded = pl.airTime<=COYOTE;
  const airborne = !pl.clinging && ((pl.vy<0 && !pl.onGround) || !grounded);
  const moving=(dir!==0) && grounded && !pl.clinging;
  pl.anim += dt;                                   // idle (1 quadro; clock contínuo)
  pl.walkAnim += dt;                               // clock do passo NUNCA reseta → ciclo de 8 sem reinício
  const II=hcMode?TEX_HC_IDLE:TEX_IDLE;
  let tx; pl.idleNow=false;
  // E17: prioridade ventosa → escada → água → voo → aéreo(pulo) → andando → idle
  if(pl.clinging){ const ceil=(pl.clingN==='U'); // E18f: teto e parede usam ciclos distintos
    const CL = ceil ? (hcMode?TEX_HC_CLING_CEIL:TEX_CLING_CEIL) : (hcMode?TEX_HC_CLING_WALL:TEX_CLING_WALL);
    if(pl.vx!==0||pl.vy!==0) pl.climbFrame=(Math.floor(pl.walkAnim/ANIM.clingHold))%CL.length; // só avança ao mover; parado MANTÉM o quadro
    tx = CL[(pl.climbFrame||0)%CL.length]; }
  else if(pl.onLadder){ const CB=hcMode?TEX_HC_CLIMB:TEX_CLIMB; const climbing=(pl.vy!==0); // sobe/desce = passos alternados; parado na escada = agarrado (quadro 0)
    tx = climbing ? CB[Math.floor(pl.walkAnim/ANIM.climbHold)%CB.length] : CB[0]; }
  else if(pl.inWater){ const stroking=(dir!==0)||held(pl,'jump'); // movendo = braçada+pernas; parado = só pernas (sempre batendo)
    const SW = stroking ? (hcMode?TEX_HC_SWIM:TEX_SWIM) : (hcMode?TEX_HC_SWIMIDLE:TEX_SWIMIDLE);
    tx = SW[Math.floor(pl.walkAnim/ANIM.swimHold)%SW.length]; }
  else if(pl.flying)              tx = hcMode?TEX_HC_FLY:TEX_FLY;
  else if(airborne) tx = pl.vy<0 ? (hcMode?TEX_HC_JUMP_UP:TEX_JUMP_UP)     // subindo: pernas recolhidas
                                 : (hcMode?TEX_HC_JUMP_DOWN:TEX_JUMP_DOWN); // caindo: pernas estendidas
  else if(moving){
    if(rm.walk){ tx = II[0]; }                                   // movimento reduzido: anda sem ciclo de passos (pose neutra)
    else { const running=held(pl,'run');                         // E19: correr (Correr segurado) ≠ andar — passada/cadência distintas
      const M = running ? (hcMode?TEX_HC_RUN:TEX_RUN) : (hcMode?TEX_HC_WALK:TEX_WALK);
      const hold = running ? ANIM.runHold : ANIM.walkHold;
      tx = M[Math.floor(pl.walkAnim/hold)%M.length]; } }
  else { pl.idleNow=true; pl.idleTime+=dt;                       // E20: parado → respira; após flavorDelay, toca uma gracinha
    if(pl.flavor<0 && pl.idleTime>ANIM.flavorDelay){ pl.flavor=Math.floor(rnd()*FLAVORS.length); pl.flavorT=0; }
    if(pl.flavor>=0){ const F=FLAVORS[pl.flavor]; const step=Math.floor(pl.flavorT/F.hold); pl.flavorT+=dt;
      if(step>=F.seq.length){ pl.flavor=-1; pl.idleTime=0; } else { const arr=hcMode?F.hc:F.tex; tx=arr[F.seq[step]]; } }
    if(pl.flavor<0) tx=II[Math.floor(pl.anim/ANIM.idleHold)%II.length]; } // respiração por frames
  if(!pl.idleNow){ pl.idleTime=0; pl.flavor=-1; }                 // saiu do idle → zera gracinha
  if(pl.sprite) pl.sprite.texture=tx;
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
  easyHitbox.clear(); // Fácil: hitbox de coleta tolerante (retângulo translúcido)
  if(easy){ const pad=EASY.pad; for(const pl of players){
    easyHitbox.lineStyle(1,0xffffff,0.45); easyHitbox.beginFill(0xffffff,0.10);
    easyHitbox.drawRect(pl.x-BOX.w/2-pad, pl.y-BOX.h-pad, BOX.w+2*pad, BOX.h+2*pad); easyHitbox.endFill(); } }
  if(numPlayers<=1){
    const {camX,camY}=placeCam(players[0]);
    markSeen(camX,camY); if(mmDirty) redrawMinimap();
    mmPlayer.clear(); mmPlayer.beginFill(0xffd23f,1);
    mmPlayer.drawRect((players[0].x/TILE)*MM_SCALE-1,((players[0].y-BOX.h/2)/TILE)*MM_SCALE-1,2.6,2.6); mmPlayer.endFill();
  } else {
    for(let i=0;i<numPlayers;i++){ placeCam(players[i]); app.renderer.render(camera,{renderTexture:vpTex[i]}); }
  }
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
  if(q.kind==='braille'){ coins[q.coinIndex].taken=true; coinSprites[q.coinIndex].visible=false; collected++;
    $('#hud-coins').textContent=String(collected); sfx('coin'); srSay('Coletado!'); closeQuiz(); if(collected>=COIN_TARGET)win(); return; }
  if(q.kind==='silabas'){
    const N=q.options.length;
    if(q.sel<N){ placeSilaba(q.options[q.sel]); return; }
    if(q.sel===N){ eraseLastSilaba(); return; }
    if(q.boxes[0]===q.correct[0] && q.boxes[1]===q.correct[1]){
      coins[q.coinIndex].taken=true; coinSprites[q.coinIndex].visible=false; collected++;
      $('#hud-coins').textContent=String(collected); sfx('correct'); srSay('Acertou!'); closeQuiz(); if(collected>=COIN_TARGET)win();
    } else { q.tries++;
      if(q.tries>=2){ q.revealed=true; q.boxes=q.correct.slice(); srAlert(`A palavra é ${disp(q.word)}. Pule para seguir.`); }
      else { q.boxes=[null,null]; sfx('wrong'); srSay('Tente de novo.'); }
      renderQuiz();
    }
    return;
  }
  if(q.choices[q.sel]===q.answer){
    coins[q.coinIndex].taken=true; coinSprites[q.coinIndex].visible=false; collected++;
    $('#hud-coins').textContent=String(collected); sfx('correct'); srSay('Acertou!'); closeQuiz();
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
    if(!occ.has(x+','+y)){ coins[i].x=x;coins[i].y=y;coins[i].taken=false;
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
  $('#win-overlay').hidden=false; srAlert(`${who}Coletou as ${COIN_TARGET} moedas.`); $('#btn-again').focus(); }
function restartGame(){
  closeQuiz();
  coins=pickCoins(COIN_TARGET);
  rebuildCoins();
  setupExtras(); // E12: re-posiciona power-ups + chave; portão volta a fechar
  darkRegions.forEach(r=>{ r.announced=false; r.gfx.alpha=1; r.gfx.visible=true; }); // re-escurece segredos
  collected=0; ended=false;
  players.forEach((p,i)=>{ p.x=SPAWN_X+i*22; p.y=SPAWN_Y; p.vx=p.vy=0; p.hurtTimer=0; p.collected=0; p.jumpBuffer=0; p.waterStroke=0; p.onLadder=false; p.quiz=null; p.activePower='off'; p.owned=[]; p.swapEdge=false; p.specialEdge=false; p.hasKey=false; if(i===0)showPower(p); p.jumpChain=0; p.groundIdle=0; p.clinging=false; p.clingN=null; p.flying=false; p.idleTime=0; p.flavor=-1; if(p.sprite)p.sprite.alpha=1; });
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
  if(n>players.length){ for(let i=players.length;i<n;i++)players.push(makePlayer(i)); }
  else if(n<players.length){ players.length=n; }
  player=players[0]; numPlayers=n;
  assignControls(); ensureSprites();
  const TEL=['👤 1 tela','👥 2 telas','👨‍👧 3 telas','👨‍👩‍👧‍👦 4 telas'];
  const tb=$('#opt-telas'); if(tb){ tb.textContent=TEL[n-1]; tb.setAttribute('aria-label','Telas: '+n+'. Toque para trocar.'); }
  if(n>1) hideTouchControls(); // E13: várias telas → sem controle por toque (ambíguo)
  configureRender(); restartGame(); layout(); $('#game-region').focus();
}
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
  if(typeof rebuildCoins==='function' && MODE==='silabas') rebuildCoins();
  if(player&&player.quiz) renderQuiz();
  if(announce) srSay(s.say);
}
const optLetraBtn=$('#opt-letra'); if(optLetraBtn)optLetraBtn.addEventListener('click',()=>{ letraIdx=(letraIdx+1)%LETRA.length; applyLetra(true); });
applyLetra(false); // estado inicial = ABC (maiúsculas, padrão)
// E9: toggles de Som / Legendas / Fácil
function toggleBtn(b,on){ b.classList.toggle('is-on',on); b.setAttribute('aria-pressed',String(on)); }
const soundBtn=$('#opt-sound'), capBtn=$('#opt-captions'), facilBtn=$('#opt-facil');
if(soundBtn) soundBtn.addEventListener('click',()=>{ soundOn=!soundOn; toggleBtn(soundBtn,soundOn); srSay('Som '+(soundOn?'ligado.':'desligado.')); });
if(capBtn) capBtn.addEventListener('click',()=>{ captionsOn=!captionsOn; toggleBtn(capBtn,captionsOn); srSay('Legendas '+(captionsOn?'ligadas.':'desligadas.')); });
if(facilBtn) facilBtn.addEventListener('click',()=>{ setEasy(!easy); });
function setEasy(on){ easy=on; if(facilBtn)toggleBtn(facilBtn,easy); rebuildCoins(); srSay('Modo Fácil '+(easy?'ligado: gravidade menor, pulo mais alto, coleta tolerante, moedas no chão, sem perigos e sem quedas acidentais (segure ↓ para descer).':'desligado.')); }

/* Fonte de leitura (canônicas EdSP): Padrão (Atkinson) | Alfabetização (Andika) | Dislexia/TDAH (Lexend + espaçamento BDA). Persistida. */
const FONT_MODES=[
  {id:'padrao',        nome:'Atkinson', uso:'legibilidade'},
  {id:'alfabetizacao', nome:'Andika',   uso:'alfabetização'},
  {id:'dislexia',      nome:'Lexend',   uso:'dislexia'},
];
const FKEY='incl_fonte'; let fonteIdx=0; const fonteBtn=$('#opt-fonte');
function applyFonte(announce){ const m=FONT_MODES[fonteIdx]; document.documentElement.dataset.fonte=m.id;
  if(fonteBtn){ fonteBtn.textContent='🔤 '+m.nome+' ('+m.uso+')'; fonteBtn.setAttribute('aria-label','Fonte de leitura: '+m.nome+', para '+m.uso+'. Toque para alternar.'); }
  if(announce) srSay('Fonte '+m.nome+', para '+m.uso+'.'); }
try{ const i=FONT_MODES.findIndex(m=>m.id===localStorage.getItem(FKEY)); if(i>=0)fonteIdx=i; }catch(e){}
applyFonte(false);
if(fonteBtn) fonteBtn.addEventListener('click',()=>{ fonteIdx=(fonteIdx+1)%FONT_MODES.length; try{localStorage.setItem(FKEY,FONT_MODES[fonteIdx].id);}catch(e){} applyFonte(true); });

/* E10: remap de controles + persistência (B2) */
const ACT_LABEL={left:'Esquerda',right:'Direita',up:'Subir / escada',down:'Descer / escada',run:'Correr / interagir',jump:'Pular',swap:'Trocar poder',especial:'Especial'};
function keyName(code){ return String(code).replace('Arrow','↔').replace('Key','').replace('Space','Espaço').replace('ShiftLeft','Shift').replace('ShiftRight','Shift'); }
let selPlayer=0; // jogador selecionado no diálogo de Controles
function renderControls(){ const el=$('#ctrl-list'); if(!el)return;
  if(selPlayer>=numPlayers) selPlayer=0;
  const tabs=$('#ctrl-players');
  if(tabs){ tabs.innerHTML=Array.from({length:numPlayers},(_,i)=>`<button class="mode-btn${i===selPlayer?' is-on':''}" data-pl="${i}" type="button" aria-pressed="${i===selPlayer}">Jogador ${i+1}</button>`).join('')
      + `<span class="opt-hint" style="width:100%;margin:.2rem 0 0">Editando o esquema de <strong>${numPlayers===1?'1 tela':numPlayers+' telas'}</strong> (mude o nº de telas para configurar outros).</span>`;
    tabs.querySelectorAll('button[data-pl]').forEach(b=>b.addEventListener('click',()=>{ selPlayer=+b.dataset.pl; captureAction=null; captureMapRef=null; renderControls(); })); }
  const map=kbFor(selPlayer);
  el.innerHTML=Object.keys(ACT_LABEL).map(a=>`<div class="ctrl-row"><span>${ACT_LABEL[a]}: ${(map[a]||[]).map(keyName).map(k=>`<kbd>${k}</kbd>`).join(' ')}</span><button class="mode-btn" data-act="${a}" type="button" aria-label="Alterar tecla de ${ACT_LABEL[a]} do Jogador ${selPlayer+1}">Alterar</button></div>`).join('');
  el.querySelectorAll('button[data-act]').forEach(b=>b.addEventListener('click',()=>{ captureAction=b.dataset.act; captureMapRef=kbFor(selPlayer); b.textContent='Pressione…'; srAlert('Pressione a nova tecla para '+ACT_LABEL[b.dataset.act]+' do Jogador '+(selPlayer+1)+', ou Esc para cancelar.'); }));
}
function openOptions(){ const ov=$('#options'); if(!ov)return; renderControls(); ov.hidden=false; optionsOpen=true; const f=ov.querySelector('button'); if(f)f.focus(); }
function closeOptions(){ const ov=$('#options'); if(!ov)return; ov.hidden=true; optionsOpen=false; captureAction=null; const b=$('#opt-controls'); if(b)b.focus(); }
const ctrlBtn=$('#opt-controls'); if(ctrlBtn)ctrlBtn.addEventListener('click',openOptions);
const ctrlClose=$('#ctrl-close'); if(ctrlClose)ctrlClose.addEventListener('click',closeOptions);

/* Movimento reduzido (WCAG 2.3.3) + Pause/Stop/Hide (2.2.2) */
const RM_LABEL={parallax:'Parallax do fundo', decor:'Decoração (nuvens, grama)', items:'Animação de itens (moedas)', walk:'Ciclo de caminhada', particles:'Partículas e cintilação'};
const RM_SOON=new Set(['decor','items','particles']); // ainda sem alvo no motor (chega com a Cidade)
function renderMotion(){ const el=$('#motion-list'); if(!el)return;
  el.innerHTML=RM_KEYS.map(k=>`<div class="ctrl-row"><span>${RM_LABEL[k]}${RM_SOON.has(k)?' <em style="opacity:.7">(em breve)</em>':''}</span><button class="mode-btn${rm[k]?' is-on':''}" data-rm="${k}" type="button" aria-pressed="${rm[k]}" aria-label="${RM_LABEL[k]}: ${rm[k]?'congelado':'animado'}">${rm[k]?'❄ Congelado':'▶ Animado'}</button></div>`).join('');
  el.querySelectorAll('button[data-rm]').forEach(b=>b.addEventListener('click',()=>{ const k=b.dataset.rm; rm[k]=!rm[k]; saveRM(); renderMotion(); updateMotionMaster(); srSay(RM_LABEL[k]+(rm[k]?' congelado.':' animado.')); }));
  updateMotionMaster();
}
function updateMotionMaster(){ reflectMotionBtn(); const m=$('#motion-master'); if(!m)return; const allOn=RM_KEYS.every(k=>rm[k]);
  m.textContent=allOn?'▶ Retomar todas as animações':'⏸ Parar todas as animações'; toggleBtn(m,allOn); }
function openMotion(){ const ov=$('#motion'); if(!ov)return; renderMotion(); ov.hidden=false; motionOpen=true; const f=ov.querySelector('button'); if(f)f.focus(); }
function closeMotion(){ const ov=$('#motion'); if(!ov)return; ov.hidden=true; motionOpen=false; const b=$('#opt-motion'); if(b)b.focus(); }
const motionBtn=$('#opt-motion'); if(motionBtn)motionBtn.addEventListener('click',openMotion);
const motionClose=$('#motion-close'); if(motionClose)motionClose.addEventListener('click',closeMotion);
const motionMaster=$('#motion-master'); if(motionMaster)motionMaster.addEventListener('click',()=>{ const allOn=RM_KEYS.every(k=>rm[k]); const v=!allOn; RM_KEYS.forEach(k=>rm[k]=v); saveRM(); renderMotion(); srSay(v?'Todas as animações paradas.':'Todas as animações retomadas.'); });
function reflectMotionBtn(){ const b=$('#opt-motion'); if(b)b.classList.toggle('is-on',RM_KEYS.some(k=>rm[k])); } // realça quando há animação reduzida
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
app.ticker.add(()=>{ const dt=Math.min(app.ticker.deltaTime,2); update(dt); draw(); fpsTick(); }); // Fácil agora ajusta física por eixo (gravidade/pulo/velocidade), não o tempo global
window.__incl={app,get player(){return players[0];},players,get numPlayers(){return numPlayers;},setNumPlayers,get coins(){return coins;},get collected(){return players[0].collected;},get powerups(){return powerups;},get gateOpen(){return gateOpen;},get gate(){return gate;},get ended(){return ended;},restartGame,get hcMode(){return hcMode;},setHC(v){hcMode=v;},darkRegions,decoLayer,minimap,parallaxLayers,PARALLAX,setCenario,get cenario(){return CENARIO;},
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
  const k=Math.max(1,Math.floor(Math.min(availW/(baseW-10), availH/(baseH-10))));
  const gr=$('#game-region'); if(gr){ gr.style.width=(baseW*k)+'px'; gr.style.height=(baseH*k)+'px'; }
}
function vlTick(){ const o=vlibrasOpen(); if(o!==librasOpen){ librasOpen=o; layout(); } }
addEventListener('resize', layout);
setInterval(vlTick, 250);
layout(); requestAnimationFrame(layout); setTimeout(layout, 1500);
window.__incl.layout=layout; window.__incl.get_librasOpen=()=>librasOpen;

/* ===================== E14: shell — título/splash + pausa ===================== */
function setPhase(p){
  phase=p;
  const t=$('#title-overlay'), pa=$('#pause-overlay');
  if(t)t.hidden = p!=='title';
  if(pa)pa.hidden = p!=='paused';
  const pb=$('#btn-pause'); if(pb)pb.setAttribute('aria-pressed',String(p==='paused'));
  if(p==='playing'){ const gr=$('#game-region'); if(gr)gr.focus(); }
  else if(p==='paused'){ const r=$('#btn-resume'); if(r)r.focus(); }
  else if(p==='title'){ const b=$('#btn-play'); if(b)b.focus(); }
}
function togglePause(){ if(phase==='playing')setPhase('paused'); else if(phase==='paused')setPhase('playing'); }
(function shellSetup(){
  const wire=(id,fn)=>{ const b=$('#'+id); if(b)b.addEventListener('click',fn); };
  wire('btn-play', ()=>{ setPhase('playing'); hideTips(); srSay('Jogo iniciado. Colete 10 moedas.'); });
  wire('btn-pause', togglePause);
  wire('btn-resume', ()=>setPhase('playing'));
  wire('btn-pause-restart', ()=>{ restartGame(); setPhase('playing'); });
  wire('btn-menu', ()=>{ restartGame(); setPhase('title'); });
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
function showTouchControls(){ if(numPlayers>1) return; const tc=document.querySelector('#touch-controls'); if(tc) tc.hidden=false; document.body.classList.add('touch-mode'); setMinimapCorner(true); }
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
      if(act==='swap'&&p.ctrl.swap&&p.ctrl.swap.includes(c))p.swapEdge=true;
      if(act==='especial'&&p.ctrl.especial&&p.ctrl.especial.includes(c))p.specialEdge=true; }); }
    if(act==='jump')hideTips(); };
  const release=(act)=>{ const c=codeFor(act); if(c)keys.delete(c); };
  tc.querySelectorAll('.touch-btn').forEach(b=>{ const act=b.dataset.act;       // correr / pular
    const down=(e)=>{ e.preventDefault(); press(act); };
    const up=(e)=>{ e.preventDefault(); release(act); };
    b.addEventListener('pointerdown',down); b.addEventListener('pointerup',up);
    b.addEventListener('pointerleave',up); b.addEventListener('pointercancel',up);
    b.addEventListener('contextmenu',(e)=>e.preventDefault());
  });
  // joystick digital: base (círculo grande) + manopla (círculo menor) que desliza p/ a direção tocada → 8 direções
  const stick=$('#touch-stick'), knob=stick&&stick.querySelector('.touch-knob');
  if(stick&&knob){
    const R=42, DEAD=12; let pid=null;
    const dirState={left:false,right:false,up:false,down:false};
    const setDir=(d,on)=>{ if(dirState[d]===on)return; dirState[d]=on; on?press(d):release(d); };
    const move=(px,py)=>{ const r=stick.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
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
  window.__incl.showTouch=()=>{ tc.hidden=false; }; // p/ testes em desktop
})();

/* ===================== ?debug=true: painel de afinação ao vivo (cadência etc.) ===================== */
(function debugPanel(){
  if(!/[?&]debug=true/.test(location.search)) return;
  const KNOBS=[
    {label:'Cadência do andar (ticks/quadro — menor = mais rápido)', get:()=>ANIM.walkHold, set:v=>ANIM.walkHold=v, min:1, max:20, step:1},
    {label:'Cadência do correr (ticks/quadro)', get:()=>ANIM.runHold, set:v=>ANIM.runHold=v, min:1, max:20, step:1},
    {label:'Cadência do idle (ticks/quadro)', get:()=>ANIM.idleHold, set:v=>ANIM.idleHold=v, min:2, max:40, step:1},
    {label:'Cadência do nado (ticks/quadro)', get:()=>ANIM.swimHold, set:v=>ANIM.swimHold=v, min:2, max:24, step:1},
  ];
  const p=document.createElement('div'); p.id='debug-panel'; p.setAttribute('role','group'); p.setAttribute('aria-label','Painel de depuração');
  p.style.cssText='position:fixed;top:8px;right:8px;z-index:200;background:rgba(11,16,32,.96);color:#fff;border:2px solid #ffd23f;border-radius:8px;padding:.6rem .7rem;font:13px/1.45 system-ui,sans-serif;max-width:250px;box-shadow:0 4px 16px rgba(0,0,0,.5)';
  p.innerHTML='<strong>🔧 ?debug — afinação</strong>';
  KNOBS.forEach(k=>{
    const row=document.createElement('div'); row.style.cssText='margin-top:.55rem';
    const lab=document.createElement('label'); lab.style.cssText='display:block;font-size:12px;margin-bottom:2px';
    const val=document.createElement('strong'); val.style.cssText='color:#ffd23f;float:right';
    const fps=()=>Math.round(60/k.get())+'fps'; // ciclo aprox. (1 tick ≈ 1/60s)
    const upd=()=>{ val.textContent=k.get()+' ('+fps()+')'; };
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
