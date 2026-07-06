// SPDX-License-Identifier: GPL-3.0-or-later
// Testes de render/scene-sky.createSceneSky (project NODE: camadas Graphics/Sprite falsas injetadas). Contratos: seed de
// 7 nuvens no boot; stepSky move nuvens e faz wrap em WORLD_PX_W+50; rm.decor limpa pássaros; stepV3Decor SEMPRE limpa as
// 5 camadas e sai cedo em tema não-v3 / alto-contraste. Ver docs/5-Refactoring/plano-modularizacao-mapa.md (#43).
import { describe, it, expect } from 'vitest';
import { createSceneSky } from '../app/js/render/scene-sky.js';

function fakeGfx() { const rec = { clears: 0, fills: 0 };
  const g = { clear: () => { rec.clears++; }, beginFill: () => { rec.fills++; return g; }, drawRect: () => g, endFill: () => g };
  g._rec = rec; return g; }
function fakeLayer() { const rec = { added: 0, removed: 0 }; return { _rec: rec, addChild: () => { rec.added++; }, removeChild: () => { rec.removed++; } }; }

function setup(over = {}) {
  const skyLayer = fakeLayer();
  const layers = { starsG: fakeGfx(), skyDecoG: fakeGfx(), fogG: fakeGfx(), grassG: fakeGfx(), themeFxG: fakeGfx() };
  class Sprite { constructor(tex) { this.texture = tex; this.x = 0; this.y = 0; this.alpha = 1; this.scale = { x: 1 }; this._v = 0; this._destroyed = false; } destroy() { this._destroyed = true; } }
  const ctx = {
    skyLayer, ...layers, CLOUD_TEX: [{}, {}], BIRD_TEX: [{}, {}], SpriteCtor: Sprite,
    hexN: (s) => parseInt(String(s).slice(1), 16), rnd: () => 0.9, randInt: () => 0,
    WORLD_PX_W: 100, WORLD_PX_H: 100, WORLD_W: 10, WORLD_H: 10, TILE: 16, LOGICAL_W: 320, LOGICAL_H: 180, BOX: { h: 24 },
    CENARIOS: over.CENARIOS || { campo: { v3: true, decor: ['sparkles', 'nuvens'], cloud: ['#ffffff', '#dddddd'] }, cidade: { v3: false, decor: [] } },
    THEME_FLORA: {}, DIRECT_CFG: over.DIRECT_CFG || {},
    solidAt: () => false, tileAt: () => 0,
    getCenario: () => over.cenario || 'campo', getVizMode: () => over.vizMode || 'normal',
    getPlayers: () => over.players || [], getFxClock: () => over.t || 0, getRm: () => over.rm || {},
  };
  return { sky: createSceneSky(ctx), skyLayer, layers };
}

describe('render/scene-sky · createSceneSky', () => {
  it('[Boot] semeia 7 nuvens no skyLayer', () => {
    const { sky, skyLayer } = setup();
    expect(skyLayer._rec.added).toBe(7);
    expect(sky.getClouds().length).toBe(7);
  });

  it('[Interface] stepSky move as nuvens por _v·dt', () => {
    const { sky } = setup();
    const c = sky.getClouds()[0]; c.x = 10; c._v = 0.02;
    sky.stepSky(100); // +2
    expect(c.x).toBeCloseTo(12);
  });

  it('[Boundary] stepSky faz wrap da nuvem em WORLD_PX_W+50 → -50', () => {
    const { sky } = setup();
    const c = sky.getClouds()[0]; c.x = 145; c._v = 0.1; // WORLD_PX_W=100 → limiar 150
    sky.stepSky(100); // +10 → 155 > 150 → wrap
    expect(c.x).toBe(-50);
  });

  it('[Zero] stepSky com rm.decor limpa os pássaros e sai', () => {
    const { sky } = setup({ rm: { decor: true } });
    sky.stepSky(1); // rm.decor → sem pássaros criados
    expect(sky.getBirds().length).toBe(0);
  });

  it('[Interface] stepV3Decor SEMPRE limpa as 5 camadas', () => {
    const { sky, layers } = setup({ cenario: 'cidade' }); // tema não-v3
    sky.stepV3Decor();
    for (const g of Object.values(layers)) expect(g._rec.clears).toBe(1);
  });

  it('[Gate] tema não-v3 sai após limpar (sem desenhar estrelas)', () => {
    const { sky, layers } = setup({ cenario: 'cidade' });
    sky.stepV3Decor();
    expect(layers.starsG._rec.fills).toBe(0);
  });

  it('[Gate] alto contraste (DIRECT_CFG[viz]) sai após limpar', () => {
    const { sky, layers } = setup({ vizMode: 'hc-direto', DIRECT_CFG: { 'hc-direto': {} } });
    sky.stepV3Decor();
    expect(layers.starsG._rec.fills).toBe(0);
  });

  it('[Happy] tema v3 com sparkles desenha estrelas no starsG', () => {
    const { sky, layers } = setup({ cenario: 'campo', t: 0 });
    sky.stepV3Decor();
    expect(layers.starsG._rec.fills).toBeGreaterThan(0);
  });
});
