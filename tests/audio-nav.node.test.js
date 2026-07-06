// SPDX-License-Identifier: GPL-3.0-or-later
// Testes de platform/audio-nav (project NODE: tiles/colisão/moedas/jogadores + tonePan/noiseHit/srSay/narrate falsos).
// Contratos: caneProbe classifica o material À FRENTE; sonar/updateGuide miram a moeda + dona (owner) mais próxima;
// updateGuide é gated por audioCat.guide.on + needsAudioCues; contadores incrementam. Ver docs/5-Refactoring/plano-modularizacao-mapa.md.
import { describe, it, expect } from 'vitest';
import { createAudioNav } from '../app/js/platform/audio-nav.js';

const TILE = 16;
// Tipos de tile: 0/1 ar · 3 água · 4 escada · 2/6 sólido. tileAt/solidAt lidos de um mapa esparso "x,y"->tipo.
function makeWorld(cells = {}) {
  const tileAt = (x, y) => cells[x + ',' + y] ?? 0;
  const solidAt = (x, y) => { const t = tileAt(x, y); return t === 2 || t === 6 || t === 4; };
  return { tileAt, solidAt };
}

function setup(over = {}) {
  const tone = [], hits = [], said = [], narrated = [];
  const world = over.world || makeWorld();
  const ctx = {
    tileAt: world.tileAt, solidAt: world.solidAt,
    held: () => false,
    tonePan: (freq, dur, cat, pan) => tone.push({ freq, cat, pan }),
    noiseHit: (mat, pan) => hits.push({ mat, pan }),
    srSay: (t) => said.push(t), narrate: (t) => narrated.push(t),
    BOX: { w: 12, h: 24 }, TILE, LOGICAL_W: 320,
    VIZ_BY_KEY: { normal: { kind: 'normal' }, cego: { kind: 'blind' }, baixa: { kind: 'lowvision' } },
    getCoins: () => over.coins || [], getPlayers: () => over.players || [],
    getNumPlayers: () => over.numPlayers || 1, getCenario: () => over.cenario || 'cidade',
    getModoCego: () => over.modoCego || false,
    getAudioCtx: () => over.audioCtx === undefined ? {} : over.audioCtx,
    getSoundOn: () => over.soundOn === undefined ? true : over.soundOn,
    getAudioCat: () => over.audioCat === undefined ? { guide: { on: true } } : over.audioCat,
  };
  return { nav: createAudioNav({ ...ctx, ...(over.ctx || {}) }), tone, hits, said, narrated };
}

// Jogador em x=32 (tile 2), y=32 (tile 2), virado p/ direita. À frente (dir=+1) o probe olha ~tile 3.
const pl = (o = {}) => ({ x: 32, y: 32, facing: 1, viz: 'cego', i: 0, ...o });

describe('platform/audio-nav', () => {
  it('[Zero/One] caneProbe: água à frente = "agua"', () => {
    const { nav } = setup({ world: makeWorld({ '3,2': 3 }) }); // tile (3, footTy=2) é água
    expect(nav.caneProbe(pl())).toBe('agua');
  });

  it('[Boundary] caneProbe: sem chão à frente = "vazio"', () => {
    const { nav } = setup({ world: makeWorld({}) }); // nada sólido → fosso
    expect(nav.caneProbe(pl())).toBe('vazio');
  });

  it('[One] caneProbe: escada (tile 4) à frente = "madeira"', () => {
    const { nav } = setup({ world: makeWorld({ '3,2': 4 }) });
    expect(nav.caneProbe(pl())).toBe('madeira');
  });

  it('[Simple] caneProbe: chão sólido = material do tema (cidade → "piso")', () => {
    const { nav } = setup({ world: makeWorld({ '3,2': 2 }), cenario: 'cidade' });
    expect(nav.caneProbe(pl())).toBe('piso');
  });

  it('[Interface] caneTap no vazio = tom "guard"; em material = noiseHit; conta as batidas', () => {
    const { nav, tone, hits } = setup({ world: makeWorld({}) });
    nav.caneTap(pl());
    expect(tone.some((t) => t.cat === 'guard')).toBe(true);
    expect(nav.caneCount).toBe(1);
    const s2 = setup({ world: makeWorld({ '3,2': 2 }), cenario: 'cidade' });
    s2.nav.caneTap(pl());
    expect(s2.hits).toEqual([{ mat: 'piso', pan: 0.5 }]);
  });

  it('[Boundary] needsAudioCues: modoCego=true sempre; blind/lowvision sim; normal não', () => {
    expect(setup({ modoCego: true }).nav.needsAudioCues(pl({ viz: 'normal' }))).toBe(true);
    expect(setup().nav.needsAudioCues(pl({ viz: 'cego' }))).toBe(true);
    expect(setup().nav.needsAudioCues(pl({ viz: 'baixa' }))).toBe(true);
    expect(setup().nav.needsAudioCues(pl({ viz: 'normal' }))).toBe(false);
  });

  it('[Simple] panFor: à direita > 0, à esquerda < 0, centrado ~0', () => {
    const { nav } = setup();
    expect(nav.panFor(320, pl({ x: 0 }))).toBeGreaterThan(0);
    expect(nav.panFor(0, pl({ x: 320 }))).toBeLessThan(0);
    expect(nav.panFor(32, pl({ x: 32 }))).toBe(0);
  });

  it('[Many] sonar: escolhe a moeda mais próxima do dono e fala; conta', () => {
    const coins = [
      { x: 300, y: 32, owner: 0 }, // longe
      { x: 48, y: 32, owner: 0 },  // perto
      { x: 40, y: 32, owner: 1 },  // pertíssimo, mas de OUTRO dono → ignorada
    ];
    const { nav, said, narrated } = setup({ coins });
    nav.sonar(pl());
    expect(nav.sonarCount).toBe(1);
    expect(said[0]).toContain('à direita'); // a moeda (48) está à direita do jogador (32)
    expect(narrated.length).toBe(1);
  });

  it('[Zero] sonar sem moedas do dono: avisa "Nenhuma moeda por perto."', () => {
    const { nav, said } = setup({ coins: [{ x: 48, y: 32, owner: 5 }] });
    nav.sonar(pl());
    expect(said).toEqual(['Nenhuma moeda por perto.']);
  });

  it('[Zero] updateGuide não faz nada se a categoria guide está OFF', () => {
    const { nav, tone } = setup({ audioCat: { guide: { on: false } }, players: [pl()], coins: [{ x: 48, y: 32, owner: 0 }] });
    for (let i = 0; i < 60; i++) nav.updateGuide();
    expect(tone.length).toBe(0);
    expect(nav.guideCount).toBe(0);
  });

  it('[Interface] updateGuide pinga (~0,8s) p/ jogador que precisa de pistas', () => {
    const { nav, tone } = setup({ players: [pl({ viz: 'cego' })], coins: [{ x: 60, y: 32, owner: 0 }] });
    for (let i = 0; i < 48; i++) nav.updateGuide(); // 48º frame → pinga
    expect(nav.guideCount).toBe(1);
    expect(tone.some((t) => t.cat === 'guide')).toBe(true);
  });
});
