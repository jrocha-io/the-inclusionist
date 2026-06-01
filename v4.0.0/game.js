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
  maxFall: 7, waterMaxFall: 3,
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
  return world;
}
const WORLD = buildWorld();
const WORLD_W = WORLD[0].length, WORLD_H = WORLD.length;
const WORLD_PX_W = WORLD_W*TILE, WORLD_PX_H = WORLD_H*TILE;
const tileAt=(tx,ty)=>(tx<0||tx>=WORLD_W||ty<0||ty>=WORLD_H)?2:WORLD[ty][tx];
const solidAt=(tx,ty)=>isSolidType(tileAt(tx,ty));
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
const PLAYER_CLIMB = [
  '................','................','.....HHHHHH.....','....HHHHHHHH....',
  '....HHHHHHHH....','....HHHHHHHH....','....HHHHHHHH....','....HHHHHHHH....',
  '....HHHHHHHH....','.....HHHHHH.....','..S..RRRRRR..S..','..SRRRRRRRRRRS..',
  '...RRRRRRRRRR...','...RRRRRRRRRR...','....RRRRRRRR....','....BBBBBBBB....',
  '....BBB..BBB....','....BBB..BBB....','....BBB..BBB....','....BBB..BBB....',
  '...KKKK..KKKK...','................','................','................',
  '................','................','................','................',
  '................','................','................','................',
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
const APP = { H:'#6b4423', S:'#f1c27d', K:'#101018', W:'#ffffff', R:'#3a86ff', B:'#2b2d42' };

/* ===================== canvas → textura ===================== */
const makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const tex=(cv)=>{const t=PIXI.Texture.from(cv);t.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST;return t;};
function spriteToCanvas(art){
  const cv=makeCanvas(16,32),c=cv.getContext('2d');
  for(let y=0;y<32;y++){const row=art[y];if(!row)continue;
    for(let x=0;x<16;x++){const ch=row[x];if(ch==='.'||!ch)continue;c.fillStyle=APP[ch]||'#f0f';c.fillRect(x,y,1,1);}}
  return cv;
}
function worldToTexture(){
  const cv=makeCanvas(WORLD_PX_W,WORLD_PX_H),c=cv.getContext('2d');
  for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){
    const t=WORLD[y][x]; c.fillStyle=TILE_COLOR[t]||'#202'; c.fillRect(x*TILE,y*TILE,TILE,TILE);
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
function pickCoins(n){
  const a=shuffle(findCoinCandidates());
  const shapes = MODE==='somasub' ? shuffle(SOMASUB_SHAPES.map(s=>s.id)) : [];
  return a.slice(0,Math.min(n,a.length)).map((p,i)=>({
    x:p.tx*TILE+3, y:p.ty*TILE+3, taken:false,
    shape: shapes.length ? shapes[i%shapes.length] : '',
  }));
}

/* ===================== estado ===================== */
const $=(s)=>document.querySelector(s);
const SPAWN_X=2*TILE, SPAWN_Y=24*TILE;
const player={x:SPAWN_X,y:SPAWN_Y,vx:0,vy:0,onGround:false,onLadder:false,inWater:false,
  facing:1,anim:0,jumpBuffer:0,waterStroke:0,hurtTimer:0,quiz:null};
const BOX={w:10,h:30};
let coins=pickCoins(COIN_TARGET), collected=0, ended=false;

/* ===================== input ===================== */
const keys=new Set(); let jumpEdge=false;
const KJUMP=['KeyL','Space'], KLEFT=['KeyA','ArrowLeft'], KRIGHT=['KeyD','ArrowRight'],
      KUP=['KeyW','ArrowUp'], KDOWN=['KeyS','ArrowDown'], KRUN=['KeyP','ShiftLeft','ShiftRight'];
const GAME_KEYS=[...KJUMP,...KLEFT,...KRIGHT,...KUP,...KDOWN];
addEventListener('keydown',(e)=>{
  if(player.quiz){ // navegação do quiz por teclado
    if(KLEFT.includes(e.code))quizMove(-1); else if(KRIGHT.includes(e.code))quizMove(1);
    else if(KUP.includes(e.code))quizMove(-3); else if(KDOWN.includes(e.code))quizMove(3);
    else if(KJUMP.includes(e.code))quizConfirm();
    if(GAME_KEYS.includes(e.code))e.preventDefault(); return;
  }
  if(GAME_KEYS.includes(e.code))e.preventDefault();
  if(!keys.has(e.code)&&KJUMP.includes(e.code))jumpEdge=true; keys.add(e.code); });
addEventListener('keyup',(e)=>keys.delete(e.code));
addEventListener('blur',()=>keys.clear());
const anyOf=(arr)=>arr.some(k=>keys.has(k));

/* ===================== a11y ===================== */
const srSay=(t)=>{const el=$('#sr-status');el.textContent='';requestAnimationFrame(()=>el.textContent=t);};
const srAlert=(t)=>{const el=$('#sr-alert');el.textContent='';requestAnimationFrame(()=>el.textContent=t);};

/* ===================== Pixi ===================== */
PIXI.settings.ROUND_PIXELS=true;
const app=new PIXI.Application({width:LOGICAL_W,height:LOGICAL_H,backgroundColor:0x05070f,
  antialias:false,resolution:1,powerPreference:'low-power'});
$('#pixi-mount').appendChild(app.view);
app.view.setAttribute('aria-hidden','true');
const camera=new PIXI.Container(); app.stage.addChild(camera);
camera.addChild(new PIXI.Sprite(worldToTexture()));
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
const coinContainer=new PIXI.Container(); camera.addChild(coinContainer);
let coinSprites=[];
function rebuildCoins(){
  coinContainer.removeChildren().forEach(s=>s.destroy());
  coinSprites=coins.map(cn=>{
    let s;
    if(MODE==='somasub'&&cn.shape){ s=new PIXI.Sprite(SHAPE_TEX[cn.shape]); s.width=15;s.height=15; s.x=cn.x-3;s.y=cn.y-3; }
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
  return { set:new Set(tiles.map(([tx,ty])=>tx+','+ty)), gfx, revealed:false };
});
const TEX={idle:tex(spriteToCanvas(PLAYER_IDLE)),walk:tex(spriteToCanvas(PLAYER_WALK)),climb:tex(spriteToCanvas(PLAYER_CLIMB)),hurt:tex(spriteToCanvas(PLAYER_HURT))};
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
const playerSprite=new PIXI.Sprite(TEX.idle); playerSprite.anchor.set(0.5,1); camera.addChild(playerSprite);

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

/* ===================== física ===================== */
// amostra tiles sob a caixa do player → água/escada
function sampleFeatures(){
  const l=player.x-BOX.w/2,r=player.x+BOX.w/2,t=player.y-BOX.h,b=player.y;
  let water=false,ladder=false,lava=false;
  for(let ty=Math.floor(t/TILE);ty<=Math.floor((b-0.01)/TILE);ty++)
    for(let tx=Math.floor(l/TILE);tx<=Math.floor((r-0.01)/TILE);tx++){
      const tt=tileAt(tx,ty); if(tt===3)water=true; if(tt===4)ladder=true; if(tt===9)lava=true;
    }
  return {water,ladder,lava};
}
function resolveX(){
  const l=player.x-BOX.w/2,r=player.x+BOX.w/2,t=player.y-BOX.h,b=player.y;
  const c0=Math.floor(l/TILE),c1=Math.floor((r-0.01)/TILE),r0=Math.floor(t/TILE),r1=Math.floor((b-0.01)/TILE);
  for(let row=r0;row<=r1;row++)for(let col=c0;col<=c1;col++){ if(!solidAt(col,row))continue;
    const tl=col*TILE;
    if(player.vx>0)player.x=tl-BOX.w/2-0.01; else if(player.vx<0)player.x=tl+TILE+BOX.w/2+0.01;
    player.vx=0; return;
  }
}
function resolveY(){
  const l=player.x-BOX.w/2,r=player.x+BOX.w/2,t=player.y-BOX.h,b=player.y;
  const c0=Math.floor(l/TILE),c1=Math.floor((r-0.01)/TILE),r0=Math.floor(t/TILE),r1=Math.floor((b-0.01)/TILE);
  for(let row=r0;row<=r1;row++)for(let col=c0;col<=c1;col++){ if(!solidAt(col,row))continue;
    const tt=row*TILE,type=tileAt(col,row);
    if(player.vy>0){ player.y=tt-0.01;
      if(type===5){ player.vy=-(anyOf(KJUMP)?TUNE.trampMax:TUNE.trampBase); } // trampolim
      else { player.vy=0; player.onGround=true; }
    } else if(player.vy<0){ player.y=tt+TILE+BOX.h+0.01; player.vy=0; }
    return;
  }
}
// lava: perde todas as moedas (reposiciona), atordoa 1s, lança pra cima + lateral (fiel ao original)
function triggerLava(){
  if(player.hurtTimer>0)return;
  coins=pickCoins(COIN_TARGET);
  coinSprites.forEach((s,i)=>{ const c=coins[i]; if(c){s.x=c.x;s.y=c.y;s.visible=true;} else s.visible=false; });
  collected=0; $('#hud-coins').textContent='0';
  player.hurtTimer=60; player.vy=-10; player.vx=(rnd()<0.5?-1:1)*5;
  srAlert('Cuidado! Você tocou na lava. As moedas voltaram para posições aleatórias.');
}
function update(dt){
  if(ended||player.quiz)return; // congelado durante o desafio
  const run=anyOf(KRUN), dir=(anyOf(KRIGHT)?1:0)-(anyOf(KLEFT)?1:0);
  player.vx=dir*(run?TUNE.hRun:TUNE.hWalk); if(dir!==0)player.facing=dir;

  const feat=sampleFeatures(); player.inWater=feat.water; player.onLadder=feat.ladder;
  if(player.hurtTimer>0)player.hurtTimer-=dt;
  if(feat.lava) triggerLava();

  if(jumpEdge)player.jumpBuffer=7; else if(player.jumpBuffer>0)player.jumpBuffer--;
  jumpEdge=false;

  if(player.onLadder){
    player.vy=0;
    if(anyOf(KUP))player.vy=-TUNE.climbSpeed; else if(anyOf(KDOWN))player.vy=TUNE.climbSpeed;
    if(player.jumpBuffer>0){ player.vy=-JUMP_BASE; player.onLadder=false; player.jumpBuffer=0; hideTips(); }
  } else {
    const g = player.inWater?0.10:TUNE.gravity;
    if(!(player.onGround&&player.vy>=0)) player.vy += g*dt;
    if(player.inWater){
      if(anyOf(KJUMP)){ if(player.waterStroke<=0){ player.vy-=run?TUNE.waterJumpRun:TUNE.waterJump; player.waterStroke=TUNE.waterStrokeFrames; } }
      else player.waterStroke=0;
      if(player.waterStroke>0)player.waterStroke-=dt;
      player.vy=Math.min(player.vy,TUNE.waterMaxFall);
    } else {
      player.waterStroke=0;
      if(player.onGround&&player.jumpBuffer>0){ player.vy=-JUMP_BASE; player.onGround=false; player.jumpBuffer=0; hideTips(); }
      player.vy=Math.min(player.vy,TUNE.maxFall);
    }
  }

  player.x+=player.vx*dt; resolveX();
  player.onGround=false; player.y+=player.vy*dt; resolveY();

  if(player.y-BOX.h>WORLD_PX_H+40){ player.x=SPAWN_X; player.y=SPAWN_Y; player.vx=player.vy=0; }

  // coletar
  const pl={x:player.x-BOX.w/2,y:player.y-BOX.h,w:BOX.w,h:BOX.h};
  coins.forEach((cn,i)=>{ if(cn.taken)return;
    const sz=(MODE==='somasub'&&cn.shape)?15:9, ox=(MODE==='somasub'&&cn.shape)?3:0;
    if(pl.x<cn.x+sz-ox&&pl.x+pl.w>cn.x-ox&&pl.y<cn.y+sz-ox&&pl.y+pl.h>cn.y-ox){
      if(MODE==='somasub'&&cn.shape){ if(!player.quiz) openQuiz(i,cn.shape); }
      else { cn.taken=true; coinSprites[i].visible=false; collected++;
        $('#hud-coins').textContent=String(collected); srSay(`Moeda ${collected} de ${COIN_TARGET}.`);
        if(collected>=COIN_TARGET)win(); }
    }});

  // áreas secretas: revela a região quando o player a toca (não escurece o resto)
  const rtx0=Math.floor((player.x-BOX.w/2)/TILE),rtx1=Math.floor((player.x+BOX.w/2-0.01)/TILE);
  const rty0=Math.floor((player.y-BOX.h)/TILE),rty1=Math.floor((player.y-0.01)/TILE);
  for(const reg of darkRegions){
    if(!reg.revealed){ for(let ty=rty0;ty<=rty1&&!reg.revealed;ty++)for(let tx=rtx0;tx<=rtx1;tx++) if(reg.set.has(tx+','+ty)){reg.revealed=true;srSay('Área secreta revelada.');break;} }
    if(reg.revealed&&reg.gfx.alpha>0){ reg.gfx.alpha=Math.max(0,reg.gfx.alpha-0.08*dt); if(reg.gfx.alpha<=0)reg.gfx.visible=false; }
  }

  // animação
  const moving=Math.abs(player.vx)>0.1;
  player.anim += (moving&&player.onGround)||(player.onLadder&&player.vy!==0) ? dt : 0;
  let t=TEX.idle;
  if(player.hurtTimer>0) t=TEX.hurt;
  else if(player.onLadder) t=TEX.climb;
  else if(moving&&player.onGround&&Math.floor(player.anim/8)%2===0) t=TEX.walk;
  playerSprite.texture=t;
}
function draw(){
  playerSprite.x=player.x; playerSprite.y=player.y+1;
  playerSprite.scale.x=player.facing<0?-1:1;
  playerSprite.alpha = player.hurtTimer>0 ? (Math.floor(player.hurtTimer/4)%2?0.4:1) : 1; // pisca nos i-frames
  let camX=player.x-LOGICAL_W/2, camY=(player.y-BOX.h/2)-LOGICAL_H/2;
  camX=Math.max(0,Math.min(camX,WORLD_PX_W-LOGICAL_W));
  camY=Math.max(0,Math.min(camY,WORLD_PX_H-LOGICAL_H));
  camera.x=-Math.round(camX); camera.y=-Math.round(camY);
  // E5: minimapa — marca tiles vistos (fog) e a posição do jogador
  markSeen(camX,camY);
  if(mmDirty) redrawMinimap();
  mmPlayer.clear(); mmPlayer.beginFill(0xffd23f,1);
  mmPlayer.drawRect((player.x/TILE)*MM_SCALE-1,((player.y-BOX.h/2)/TILE)*MM_SCALE-1,2.6,2.6); mmPlayer.endFill();
}

/* ===================== Soma-Sub: quiz (DOM, acessível) ===================== */
function openQuiz(coinIndex,shapeId){
  const op=rnd()<0.5?'+':'-'; let a,b,answer;
  if(op==='+'){a=randInt(0,9);b=randInt(0,10-a);answer=a+b;} else {a=randInt(0,10);b=randInt(0,a);answer=a-b;}
  const pool=[answer]; while(pool.length<9){const n=randInt(0,10); if(!pool.includes(n))pool.push(n);}
  player.quiz={coinIndex,shape:shapeId,a,b,op,answer,choices:shuffle(pool),sel:0,tries:0,revealed:false};
  player.vx=0;player.vy=0;
  srSay(`${somaSubName(shapeId)}. Quanto é ${a} ${op==='+'?'mais':'menos'} ${b}?`);
  renderQuiz();
}
function renderQuiz(){
  const q=player.quiz, ov=$('#quiz'); if(!ov)return; if(!q){ov.hidden=true;return;}
  const opTxt=q.op==='+'?'+':'−';
  const choices=q.choices.map((n,i)=>`<button class="quiz-choice${i===q.sel?' sel':''}${q.revealed&&n===q.answer?' reveal':''}" data-i="${i}" type="button">${n}</button>`).join('');
  const hint=q.revealed?'Resposta certa em destaque. Pule (L) para seguir.':(q.tries>0?'Quase! Tente de novo.':'Escolha e pule (L) para confirmar.');
  ov.innerHTML=`<div class="quiz-box" role="dialog" aria-modal="true" aria-label="Conta de Soma-Sub"><div class="quiz-shape">${somaSubName(q.shape)}</div><div class="quiz-prob">${q.a} ${opTxt} ${q.b} = ?</div><div class="quiz-grid">${choices}</div><div class="quiz-hint">${hint}</div></div>`;
  ov.querySelectorAll('.quiz-choice').forEach(b=>b.addEventListener('click',()=>{ if(player.quiz){player.quiz.sel=+b.dataset.i; quizConfirm();} }));
  ov.hidden=false;
}
function quizMove(d){ const q=player.quiz; if(!q)return; q.sel=Math.max(0,Math.min(q.choices.length-1,q.sel+d)); renderQuiz(); srSay(String(q.choices[q.sel])); }
function quizConfirm(){
  const q=player.quiz; if(!q)return;
  if(q.revealed){ respawnFigure(q.coinIndex); closeQuiz(); return; }
  if(q.choices[q.sel]===q.answer){
    coins[q.coinIndex].taken=true; coinSprites[q.coinIndex].visible=false; collected++;
    $('#hud-coins').textContent=String(collected); srSay('Acertou!'); closeQuiz();
    if(collected>=COIN_TARGET)win();
  } else { q.tries++;
    if(q.tries>=2){q.revealed=true; srAlert(`A resposta é ${q.answer}. Pule para seguir.`);} else srSay('Tente de novo.');
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
function win(){ ended=true; $('#hud-objective').textContent='Concluído! 🎉';
  $('#win-msg').textContent=`Parabéns! Você coletou as ${COIN_TARGET} moedas.`;
  $('#win-overlay').hidden=false; srAlert(`Você venceu! Coletou as ${COIN_TARGET} moedas.`); $('#btn-again').focus(); }
function restartGame(){
  closeQuiz();
  coins=pickCoins(COIN_TARGET);
  rebuildCoins();
  darkRegions.forEach(r=>{ r.revealed=false; r.gfx.alpha=1; r.gfx.visible=true; }); // re-escurece segredos
  collected=0; ended=false; player.x=SPAWN_X; player.y=SPAWN_Y; player.vx=player.vy=0; player.hurtTimer=0; playerSprite.alpha=1;
  $('#hud-coins').textContent='0';
  $('#hud-objective').textContent = MODE==='somasub' ? 'Resolva 10 contas' : 'Colete 10 moedas';
  $('#win-overlay').hidden=true;
  const tp=$('#start-tips'); if(tp){ tp.classList.remove('hide'); clearTimeout(tipsTimer); tipsTimer=setTimeout(hideTips,8000); }
  srSay(MODE==='somasub' ? 'Modo Soma-Sub. Toque nas figuras e resolva as contas.' : 'Nova rodada. Colete 10 moedas.');
}
$('#btn-again').addEventListener('click',()=>{ restartGame(); $('#game-region').focus(); });
function setMode(m){
  MODE=m;
  document.querySelectorAll('.mode-btn').forEach(b=>{ const on=b.id==='mode-'+m; b.classList.toggle('is-on',on); b.setAttribute('aria-pressed',String(on)); });
  restartGame(); $('#game-region').focus();
}
const mb1=$('#mode-ludico'), mb2=$('#mode-somasub');
if(mb1)mb1.addEventListener('click',()=>setMode('ludico'));
if(mb2)mb2.addEventListener('click',()=>setMode('somasub'));

/* ===================== FPS ===================== */
let fpsAccum=0,fpsFrames=0,fpsMin=Infinity,fpsWarm=0;
function fpsTick(){ const fps=app.ticker.FPS; fpsWarm++; fpsAccum+=fps; fpsFrames++;
  if(fpsWarm>60&&fps<fpsMin)fpsMin=fps;
  if(fpsFrames>=30){ $('#hud-fps').textContent=String(Math.round(fpsAccum/fpsFrames));
    $('#hud-fpsmin').textContent=fpsMin===Infinity?'–':String(Math.round(fpsMin)); fpsAccum=0;fpsFrames=0; }
}

/* ===================== loop ===================== */
app.ticker.add(()=>{ const dt=Math.min(app.ticker.deltaTime,2); update(dt); draw(); fpsTick(); });
window.__incl={app,player,get coins(){return coins;},get collected(){return collected;},darkRegions,decoLayer,minimap,
  get mmSeen(){let n=0;for(const r of seen)for(const v of r)n+=v;return n;},get MODE(){return MODE;},tileAt,WORLD_W,WORLD_H,TUNE};
srSay('Jogo carregado. Colete 10 moedas. Suba escadas com W/S, nade segurando pulo na água.');

/* dicas de início: somem ao pular ou após 8s */
let tipsTimer=setTimeout(hideTips,8000);
function hideTips(){ const el=$('#start-tips'); if(el)el.classList.add('hide'); clearTimeout(tipsTimer); }

/* ===================== PWA ===================== */
if('serviceWorker' in navigator) addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
