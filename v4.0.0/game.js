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
  return world;
}
const WORLD = buildWorld();
const WORLD_W = WORLD[0].length, WORLD_H = WORLD.length;
const WORLD_PX_W = WORLD_W*TILE, WORLD_PX_H = WORLD_H*TILE;
const tileAt=(tx,ty)=>(tx<0||tx>=WORLD_W||ty<0||ty>=WORLD_H)?2:WORLD[ty][tx];
// E12: portão dinâmico — seus tiles são sólidos enquanto fechado (gateOpen=true ⇒ comporta normal)
let gateTiles=new Set(), gateOpen=true, gate=null;
const solidAt=(tx,ty)=>(!gateOpen && gateTiles.has(tx+','+ty)) || isSolidType(tileAt(tx,ty));
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
  facing:1,anim:0,jumpBuffer:0,waterStroke:0,hurtTimer:0,quiz:null,jumpEdge:false,collected:0,ctrl:null,sprite:null,
  powerRun:false,powerJump:false,hasKey:false}; }
let players=[makePlayer(0)]; let player=players[0];
let numPlayers=1;
let coins=pickCoins(COIN_TARGET), collected=0, ended=false;

/* ===================== input ===================== */
const keys=new Set(); let jumpEdge=false, captureAction=null, optionsOpen=false;
const CKEY='inclusionist.controls.v1';
const CTRL_DEFAULTS={left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],jump:['KeyL','Space'],run:['KeyP','ShiftLeft','ShiftRight'],up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown']};
function loadControls(){ try{const s=JSON.parse(localStorage.getItem(CKEY)); if(s)return Object.assign(JSON.parse(JSON.stringify(CTRL_DEFAULTS)),s);}catch(e){} return JSON.parse(JSON.stringify(CTRL_DEFAULTS)); }
function saveControls(){ try{localStorage.setItem(CKEY,JSON.stringify(controls));}catch(e){} }
let controls=loadControls();
let KJUMP=controls.jump, KLEFT=controls.left, KRIGHT=controls.right, KUP=controls.up, KDOWN=controls.down, KRUN=controls.run;
let GAME_KEYS=[...KJUMP,...KLEFT,...KRIGHT,...KUP,...KDOWN];
function applyControls(){ KJUMP=controls.jump;KLEFT=controls.left;KRIGHT=controls.right;KUP=controls.up;KDOWN=controls.down;KRUN=controls.run; GAME_KEYS=[...KJUMP,...KLEFT,...KRIGHT,...KUP,...KDOWN]; if(numPlayers<=1)players[0].ctrl=controls; }
// E11: keysets fixos para multiplayer (P1=WASD+Espaço, P2=setas+Enter, P3=FTGH+R, P4=IJKL+U) — sem conflito de teclas
const MP_CTRL=[
  {left:['KeyA'],right:['KeyD'],up:['KeyW'],down:['KeyS'],jump:['Space'],run:['ShiftLeft']},
  {left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown'],jump:['Enter','NumpadEnter'],run:['ShiftRight']},
  {left:['KeyF'],right:['KeyH'],up:['KeyT'],down:['KeyG'],jump:['KeyR'],run:['KeyY']},
  {left:['KeyJ'],right:['KeyL'],up:['KeyI'],down:['KeyK'],jump:['KeyU'],run:['KeyO']},
];
const PCOLOR=[0xffffff,0xff9a9a,0x8affc0,0xffe08a]; // tint distintivo por jogador (P1 = normal)
function assignControls(){ if(numPlayers<=1){players[0].ctrl=controls;} else players.forEach((p,i)=>p.ctrl=MP_CTRL[i]||MP_CTRL[0]); }
players[0].ctrl=controls;
addEventListener('keydown',(e)=>{
  if(captureAction){ // remap: a próxima tecla vira o novo controle
    if(e.code!=='Escape'){ controls[captureAction]=[e.code]; saveControls(); applyControls(); }
    captureAction=null; if(typeof renderControls==='function')renderControls(); e.preventDefault(); return;
  }
  if(optionsOpen){ if(e.code==='Escape')closeOptions(); return; } // diálogo aberto: não joga
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
  const isGameKey = GAME_KEYS.includes(e.code) || players.some(p=>p.ctrl && Object.values(p.ctrl).some(arr=>arr.includes(e.code)));
  if(isGameKey)e.preventDefault();
  if(!keys.has(e.code)){ for(const p of players){ if(p.ctrl && p.ctrl.jump.includes(e.code)) p.jumpEdge=true; } }
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
let audioCtx=null, soundOn=true, captionsOn=true, assist=false, volume=0.6, capTimer=null;
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
function letterTexture(ch){
  const cv=makeCanvas(16,16),c=cv.getContext('2d');
  c.fillStyle='#ffd23f';c.strokeStyle='#1a1400';c.lineWidth=1.5;
  c.beginPath(); if(c.roundRect)c.roundRect(2,2,12,12,3); else c.rect(2,2,12,12); c.fill(); c.stroke();
  c.fillStyle='#1a1400';c.font='bold 11px system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.fillText(disp(ch),8,9); return tex(cv);
}
const coinContainer=new PIXI.Container(); camera.addChild(coinContainer);
let coinSprites=[];
function rebuildCoins(){
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
/* ===================== E12: power-ups + chave/portão ===================== */
function powerupTexture(kind){
  const cv=makeCanvas(12,12),c=cv.getContext('2d');
  const col = kind==='run'?'#34e29b':kind==='jump'?'#7fdcff':'#ffd23f';
  c.fillStyle='#04121a'; c.beginPath(); if(c.roundRect)c.roundRect(0.5,0.5,11,11,3); else c.rect(0.5,0.5,11,11); c.fill();
  c.fillStyle=col;
  if(kind==='run'){ c.beginPath();c.moveTo(2,3);c.lineTo(7,6);c.lineTo(2,9);c.closePath();c.moveTo(6,3);c.lineTo(11,6);c.lineTo(6,9);c.closePath();c.fill(); } // » super-corrida
  else if(kind==='jump'){ c.beginPath();c.moveTo(6,2);c.lineTo(10,7);c.lineTo(2,7);c.closePath();c.fill();c.fillRect(4,7,4,3); }          // ▲ ultra-pulo
  else { c.beginPath();c.arc(4,6,3,0,7);c.fill();c.fillRect(6,5,5,2);c.fillRect(9,5,2,4); }                                              // ⚷ chave
  return tex(cv);
}
const PUP_TEX={run:powerupTexture('run'),jump:powerupTexture('jump'),key:powerupTexture('key')};
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
  const occ=new Set(coins.map(c=>Math.floor(c.x/TILE)+','+Math.floor(c.y/TILE)));
  const cands=shuffle(findCoinCandidates()).filter(c=>c.tx>5 && !occ.has(c.tx+','+c.ty));
  powerups=[]; const kinds=['run','jump','key'];
  for(let i=0;i<kinds.length && i<cands.length;i++){ const c=cands[i]; powerups.push({x:c.tx*TILE+2,y:c.ty*TILE+2,kind:kinds[i],taken:false,sprite:null}); }
  const gc=cands[3]; gateTiles=new Set();
  if(gc){ for(let dy=0;dy<3;dy++)gateTiles.add(gc.tx+','+(gc.ty-dy)); gate={tx:gc.tx,ty:gc.ty}; } else gate=null;
  gateOpen=false; rebuildExtras();
}
setupExtras();

const playerSprite=new PIXI.Sprite(TEX.idle); playerSprite.anchor.set(0.5,1); camera.addChild(playerSprite);
players[0].sprite=playerSprite;
/* E11: sprites por jogador + render multi-viewport (render-to-texture) */
let allPSprites=[playerSprite];
function ensureSprites(){
  for(let i=allPSprites.length;i<numPlayers;i++){ const s=new PIXI.Sprite(TEX.idle); s.anchor.set(0.5,1); camera.addChild(s); allPSprites.push(s); }
  allPSprites.forEach((s,i)=>{ s.visible=i<numPlayers; s.tint=PCOLOR[i]||0xffffff; if(i<numPlayers)players[i].sprite=s; });
}
let vpTex=[], vpSpr=[];
function configureRender(){
  vpSpr.forEach(s=>s.destroy()); vpSpr=[]; vpTex.forEach(t=>t.destroy(true)); vpTex=[];
  if(numPlayers<=1){
    if(camera.parent!==app.stage) app.stage.addChildAt(camera,0);
    minimap.visible=true; app.renderer.resize(LOGICAL_W,LOGICAL_H);
  } else {
    if(camera.parent) camera.parent.removeChild(camera); // câmera renderizada manualmente nas RTs
    minimap.visible=false;
    const cols=numPlayers<=2?numPlayers:2, rows=numPlayers<=2?1:2;
    app.renderer.resize(LOGICAL_W*cols, LOGICAL_H*rows);
    for(let i=0;i<numPlayers;i++){
      const rt=PIXI.RenderTexture.create({width:LOGICAL_W,height:LOGICAL_H}); rt.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST;
      const s=new PIXI.Sprite(rt); s.x=(i%cols)*LOGICAL_W; s.y=Math.floor(i/cols)*LOGICAL_H;
      app.stage.addChild(s); vpTex.push(rt); vpSpr.push(s);
    }
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
      if(type===5){ pl.vy=-(held(pl,'jump')?TUNE.trampMax:TUNE.trampBase); }
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
  const run=held(pl,'run'), dir=(held(pl,'right')?1:0)-(held(pl,'left')?1:0);
  pl.vx=dir*(run?(pl.powerRun?TUNE.hTurbo:TUNE.hRun):TUNE.hWalk); if(dir!==0)pl.facing=dir; // E12: super-corrida
  const feat=sampleFeatures(pl); pl.inWater=feat.water; pl.onLadder=feat.ladder;
  if(pl.hurtTimer>0)pl.hurtTimer-=dt;
  if(feat.lava && !assist) triggerLava(pl);
  if(pl.jumpEdge)pl.jumpBuffer=7; else if(pl.jumpBuffer>0)pl.jumpBuffer--;
  pl.jumpEdge=false;
  if(pl.onLadder){
    pl.vy=0;
    if(held(pl,'up'))pl.vy=-TUNE.climbSpeed; else if(held(pl,'down'))pl.vy=TUNE.climbSpeed;
    if(pl.jumpBuffer>0){ pl.vy=-(pl.powerJump?TUNE.ultraJumpVel:JUMP_BASE); pl.onLadder=false; pl.jumpBuffer=0; sfx('jump'); hideTips(); }
  } else {
    const g = pl.inWater?0.10:TUNE.gravity;
    if(!(pl.onGround&&pl.vy>=0)) pl.vy += g*dt;
    if(pl.inWater){
      if(held(pl,'jump')){ if(pl.waterStroke<=0){ pl.vy-=run?TUNE.waterJumpRun:TUNE.waterJump; pl.waterStroke=TUNE.waterStrokeFrames; } }
      else pl.waterStroke=0;
      if(pl.waterStroke>0)pl.waterStroke-=dt;
      pl.vy=Math.min(pl.vy,TUNE.waterMaxFall);
    } else {
      pl.waterStroke=0;
      if(pl.onGround&&pl.jumpBuffer>0){ pl.vy=-(pl.powerJump?TUNE.ultraJumpVel:JUMP_BASE); pl.onGround=false; pl.jumpBuffer=0; sfx('jump'); hideTips(); }
      pl.vy=Math.min(pl.vy,TUNE.maxFall);
    }
  }
  pl.x+=pl.vx*dt; resolveX(pl);
  pl.onGround=false; pl.y+=pl.vy*dt; resolveY(pl);
  if(pl.y-BOX.h>WORLD_PX_H+40){ pl.x=SPAWN_X; pl.y=SPAWN_Y; pl.vx=pl.vy=0; }
  // coletar (P1 abre quiz nos modos didáticos; MP é Lúdico)
  const box={x:pl.x-BOX.w/2,y:pl.y-BOX.h,w:BOX.w,h:BOX.h};
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
      if(pu.kind==='run'){ pl.powerRun=true; sfx('power'); srSay(who+'super-corrida ativada! Segure correr para ir mais rápido.'); }
      else if(pu.kind==='jump'){ pl.powerJump=true; sfx('power'); srSay(who+'ultra-pulo ativado!'); }
      else { pl.hasKey=true; sfx('key'); srAlert(who+'pegou a chave. Toque no portão para abri-lo.'); }
    }});
  if(gate && !gateOpen && pl.hasKey){
    const gx=gate.tx*TILE, gtop=(gate.ty-2)*TILE, gbot=gate.ty*TILE+TILE;
    if(box.x<gx+TILE && box.x+box.w>gx && box.y<gbot && box.y+box.h>gtop){ gateOpen=true; rebuildExtras(); sfx('gate'); srAlert('Portão aberto!'); }
  }
  // áreas secretas (qualquer jogador revela)
  const rtx0=Math.floor((pl.x-BOX.w/2)/TILE),rtx1=Math.floor((pl.x+BOX.w/2-0.01)/TILE);
  const rty0=Math.floor((pl.y-BOX.h)/TILE),rty1=Math.floor((pl.y-0.01)/TILE);
  for(const reg of darkRegions){ if(reg.revealed)continue;
    for(let ty=rty0;ty<=rty1&&!reg.revealed;ty++)for(let tx=rtx0;tx<=rtx1;tx++) if(reg.set.has(tx+','+ty)){reg.revealed=true;break;}
  }
  // animação
  const moving=Math.abs(pl.vx)>0.1;
  pl.anim += (moving&&pl.onGround)||(pl.onLadder&&pl.vy!==0) ? dt : 0;
  let tx=TEX.idle;
  if(pl.hurtTimer>0) tx=TEX.hurt; else if(pl.onLadder) tx=TEX.climb;
  else if(moving&&pl.onGround&&Math.floor(pl.anim/8)%2===0) tx=TEX.walk;
  if(pl.sprite) pl.sprite.texture=tx;
}
function update(dt){
  if(ended)return;
  for(const pl of players) stepPlayer(pl,dt);
  for(const reg of darkRegions){ if(reg.revealed&&reg.gfx.alpha>0){ reg.gfx.alpha=Math.max(0,reg.gfx.alpha-0.08*dt); if(reg.gfx.alpha<=0)reg.gfx.visible=false; } }
}
function placeCam(pl){
  let camX=pl.x-LOGICAL_W/2, camY=(pl.y-BOX.h/2)-LOGICAL_H/2;
  camX=Math.max(0,Math.min(camX,WORLD_PX_W-LOGICAL_W)); camY=Math.max(0,Math.min(camY,WORLD_PX_H-LOGICAL_H));
  camera.x=-Math.round(camX); camera.y=-Math.round(camY); return {camX,camY};
}
function draw(){
  for(const pl of players){ if(!pl.sprite)continue;
    pl.sprite.x=pl.x; pl.sprite.y=pl.y+1; pl.sprite.scale.x=(pl.facing<0?-1:1)*Math.abs(pl.sprite.scale.x||1);
    pl.sprite.alpha = pl.hurtTimer>0 ? (Math.floor(pl.hurtTimer/4)%2?0.4:1) : 1;
  }
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
  return `<div class="quiz-box" role="dialog" aria-modal="true" aria-label="Conta de Soma-Sub"><div class="quiz-shape">${somaSubName(q.shape)}</div><div class="quiz-prob">${q.a} ${opTxt} ${q.b} = ?</div><div class="quiz-grid">${choices}</div><div class="quiz-hint">${hint}</div></div>`;
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
function win(pl){ ended=true; sfx('win'); $('#hud-objective').textContent='Concluído! 🎉';
  const who = numPlayers>1 ? `Jogador ${(pl?pl.i:0)+1} venceu! ` : '';
  $('#win-msg').textContent=`${who}Coletou as ${COIN_TARGET} moedas.`;
  $('#win-overlay').hidden=false; srAlert(`${who}Coletou as ${COIN_TARGET} moedas.`); $('#btn-again').focus(); }
function restartGame(){
  closeQuiz();
  coins=pickCoins(COIN_TARGET);
  rebuildCoins();
  setupExtras(); // E12: re-posiciona power-ups + chave; portão volta a fechar
  darkRegions.forEach(r=>{ r.revealed=false; r.gfx.alpha=1; r.gfx.visible=true; }); // re-escurece segredos
  collected=0; ended=false;
  players.forEach((p,i)=>{ p.x=SPAWN_X+i*22; p.y=SPAWN_Y; p.vx=p.vy=0; p.hurtTimer=0; p.collected=0; p.jumpBuffer=0; p.waterStroke=0; p.onLadder=false; p.quiz=null; p.powerRun=false; p.powerJump=false; p.hasKey=false; if(p.sprite)p.sprite.alpha=1; });
  updateHud();
  $('#hud-objective').textContent = numPlayers>1 ? `${numPlayers} jogadores — corrida pelas ${COIN_TARGET} moedas` : MODE==='somasub' ? 'Resolva 10 contas' : MODE==='silabas' ? 'Monte 10 palavras' : 'Colete 10 moedas';
  $('#win-overlay').hidden=true;
  const tp=$('#start-tips'); if(tp){ if(numPlayers>1){ tp.classList.add('hide'); } else { tp.classList.remove('hide'); clearTimeout(tipsTimer); tipsTimer=setTimeout(hideTips,8000); } }
  srSay(numPlayers>1 ? `${numPlayers} jogadores, cada um na sua tela. Corram pelas moedas.` : MODE==='somasub' ? 'Modo Soma-Sub. Toque nas figuras e resolva as contas.' : MODE==='silabas' ? 'Modo Sílabas. Toque nas letras e monte as palavras.' : 'Nova rodada. Colete 10 moedas.');
}
$('#btn-again').addEventListener('click',()=>{ restartGame(); $('#game-region').focus(); });
function setMode(m){
  if(numPlayers>1)m='ludico'; // multiplayer só no Lúdico
  MODE=m;
  document.querySelectorAll('.mode-btn[id^="mode-"]').forEach(b=>{ const on=b.id==='mode-'+m; b.classList.toggle('is-on',on); b.setAttribute('aria-pressed',String(on)); });
  restartGame(); $('#game-region').focus();
}
const mb1=$('#mode-ludico'), mb2=$('#mode-somasub'), mb3=$('#mode-silabas');
if(mb1)mb1.addEventListener('click',()=>setMode('ludico'));
if(mb2)mb2.addEventListener('click',()=>setMode('somasub'));
if(mb3)mb3.addEventListener('click',()=>setMode('silabas'));
/* E11: nº de jogadores (1–4 telas lado a lado, simulação compartilhada) */
function setNumPlayers(n){
  n=Math.max(1,Math.min(4,n|0));
  if(n>players.length){ for(let i=players.length;i<n;i++)players.push(makePlayer(i)); }
  else if(n<players.length){ players.length=n; }
  player=players[0]; numPlayers=n;
  assignControls(); ensureSprites();
  if(n>1){ MODE='ludico'; document.querySelectorAll('.mode-btn[id^="mode-"]').forEach(b=>{ const on=b.id==='mode-ludico'; b.classList.toggle('is-on',on); b.setAttribute('aria-pressed',String(on)); }); }
  ['mode-somasub','mode-silabas','opt-case','opt-blind'].forEach(id=>{ const b=$('#'+id); if(b){ b.disabled=n>1; b.style.opacity=n>1?0.45:1; } });
  document.querySelectorAll('.mp-btn').forEach(b=>{ const on=b.id==='mp-'+n; b.classList.toggle('is-on',on); b.setAttribute('aria-pressed',String(on)); });
  configureRender(); restartGame(); layout(); $('#game-region').focus();
}
document.querySelectorAll('.mp-btn').forEach(b=>b.addEventListener('click',()=>setNumPlayers(parseInt(b.id.split('-')[1],10))));
const caseBtn=$('#opt-case');
if(caseBtn)caseBtn.addEventListener('click',()=>{
  letterCase = letterCase==='upper'?'lower':'upper';
  caseBtn.textContent = letterCase==='upper'?'ABC':'abc';
  caseBtn.setAttribute('aria-pressed', String(letterCase==='upper'));
  if(MODE==='silabas') rebuildCoins();
  if(player.quiz) renderQuiz();
  srSay('Letras em '+(letterCase==='upper'?'maiúsculas':'minúsculas')+'.');
});
const blindBtn=$('#opt-blind');
if(blindBtn)blindBtn.addEventListener('click',()=>{
  blindMode=!blindMode;
  blindBtn.setAttribute('aria-pressed',String(blindMode)); blindBtn.classList.toggle('is-on',blindMode);
  srSay('Modo Braille '+(blindMode?'ligado. No modo Sílabas, o jogo dita os pontos da cela.':'desligado.'));
});
// E9: toggles de Som / Legendas / Assistência
function toggleBtn(b,on){ b.classList.toggle('is-on',on); b.setAttribute('aria-pressed',String(on)); }
const soundBtn=$('#opt-sound'), capBtn=$('#opt-captions'), assistBtn=$('#opt-assist');
if(soundBtn) soundBtn.addEventListener('click',()=>{ soundOn=!soundOn; toggleBtn(soundBtn,soundOn); srSay('Som '+(soundOn?'ligado.':'desligado.')); });
if(capBtn) capBtn.addEventListener('click',()=>{ captionsOn=!captionsOn; toggleBtn(capBtn,captionsOn); srSay('Legendas '+(captionsOn?'ligadas.':'desligadas.')); });
if(assistBtn) assistBtn.addEventListener('click',()=>{ assist=!assist; toggleBtn(assistBtn,assist); srSay('Modo assistência '+(assist?'ligado: velocidade reduzida e sem perigos.':'desligado.')); });

/* E10: remap de controles + persistência (B2) */
const ACT_LABEL={left:'Esquerda',right:'Direita',jump:'Pular',run:'Correr',up:'Subir / escada',down:'Descer / escada'};
function keyName(code){ return String(code).replace('Arrow','↔').replace('Key','').replace('Space','Espaço').replace('ShiftLeft','Shift').replace('ShiftRight','Shift'); }
function renderControls(){ const el=$('#ctrl-list'); if(!el)return;
  el.innerHTML=Object.keys(ACT_LABEL).map(a=>`<div class="ctrl-row"><span>${ACT_LABEL[a]}: ${(controls[a]||[]).map(keyName).map(k=>`<kbd>${k}</kbd>`).join(' ')}</span><button class="mode-btn" data-act="${a}" type="button" aria-label="Alterar tecla de ${ACT_LABEL[a]}">Alterar</button></div>`).join('');
  el.querySelectorAll('button[data-act]').forEach(b=>b.addEventListener('click',()=>{ captureAction=b.dataset.act; b.textContent='Pressione…'; srAlert('Pressione a nova tecla para '+ACT_LABEL[b.dataset.act]+', ou Esc para cancelar.'); }));
}
function openOptions(){ const ov=$('#options'); if(!ov)return; renderControls(); ov.hidden=false; optionsOpen=true; const f=ov.querySelector('button'); if(f)f.focus(); }
function closeOptions(){ const ov=$('#options'); if(!ov)return; ov.hidden=true; optionsOpen=false; captureAction=null; const b=$('#opt-controls'); if(b)b.focus(); }
const ctrlBtn=$('#opt-controls'); if(ctrlBtn)ctrlBtn.addEventListener('click',openOptions);
const ctrlClose=$('#ctrl-close'); if(ctrlClose)ctrlClose.addEventListener('click',closeOptions);
const ctrlReset=$('#ctrl-reset'); if(ctrlReset)ctrlReset.addEventListener('click',()=>{ try{localStorage.removeItem(CKEY);}catch(e){} controls=JSON.parse(JSON.stringify(CTRL_DEFAULTS)); applyControls(); renderControls(); srSay('Controles restaurados ao padrão.'); });

/* ===================== FPS ===================== */
let fpsAccum=0,fpsFrames=0,fpsMin=Infinity,fpsWarm=0;
function fpsTick(){ const fps=app.ticker.FPS; fpsWarm++; fpsAccum+=fps; fpsFrames++;
  if(fpsWarm>60&&fps<fpsMin)fpsMin=fps;
  if(fpsFrames>=30){ $('#hud-fps').textContent=String(Math.round(fpsAccum/fpsFrames));
    $('#hud-fpsmin').textContent=fpsMin===Infinity?'–':String(Math.round(fpsMin)); fpsAccum=0;fpsFrames=0; }
}

/* ===================== loop ===================== */
app.ticker.add(()=>{ const dt=Math.min(app.ticker.deltaTime,2)*(assist?0.6:1); update(dt); draw(); fpsTick(); });
window.__incl={app,get player(){return players[0];},players,get numPlayers(){return numPlayers;},setNumPlayers,get coins(){return coins;},get collected(){return players[0].collected;},get powerups(){return powerups;},get gateOpen(){return gateOpen;},get gate(){return gate;},get ended(){return ended;},restartGame,darkRegions,decoLayer,minimap,
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
  const k=Math.max(1,Math.floor(Math.min(availW/baseW, availH/baseH)));  // múltiplo inteiro da base
  const gr=$('#game-region'); if(gr){ gr.style.width=(baseW*k)+'px'; gr.style.height=(baseH*k)+'px'; }
}
function vlTick(){ const o=vlibrasOpen(); if(o!==librasOpen){ librasOpen=o; layout(); } }
addEventListener('resize', layout);
setInterval(vlTick, 250);
layout(); requestAnimationFrame(layout); setTimeout(layout, 1500);
window.__incl.layout=layout; window.__incl.get_librasOpen=()=>librasOpen;

/* ===================== PWA ===================== */
if('serviceWorker' in navigator) addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
