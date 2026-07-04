// SPDX-License-Identifier: GPL-3.0-or-later
// tests/suite.js — testes de unidade dos módulos-folha, RODAM NO NAVEGADOR (ambiente real: PIXI/canvas/
// localStorage). Sem Node/bundler. Dev-only: NÃO entra no SHELL do sw.js nem é linkado pelo jogo. runAll()
// devolve {total,pass,fail,results} — chamado pelo index.html e dirigível via preview (window.__testResults).
// Convenção: cada extração de módulo (Fase 2.x) acrescenta aqui os testes do seu contrato. (Fase 2.23)
import * as C from '../js/core/constants.js';
import * as T from '../js/core/tiles.js';
import * as W from '../js/core/world.js';
import * as S from '../js/input/state.js';
import * as CV from '../js/render/canvas.js';
import * as P from '../js/render/props.js';
import * as SP from '../js/render/sprites.js';
import * as FX from '../js/render/sprite-fx.js';
import * as ST from '../js/platform/storage.js';
import * as AUDIO from '../js/platform/audio.js';
import * as RNG from '../js/core/rng.js';

const TESTS = [];
const it = (name, fn) => TESTS.push({ name, fn });
function assert(c, m) { if (!c) throw new Error(m || 'assert falhou'); }
function eq(a, b, m) { if (a !== b) throw new Error(`${m || ''} esperado ${JSON.stringify(b)}, obteve ${JSON.stringify(a)}`); }

// ---- core/constants ----
it('constants: ANIM.walkHold=6', () => eq(C.ANIM.walkHold, 6));
it('constants: TUNE.jumpVel=3.5', () => eq(C.TUNE.jumpVel, 3.5));
it('constants: JUMP_BASE = jumpVel*sqrt(8/5)', () => assert(Math.abs(C.JUMP_BASE - 3.5 * Math.sqrt(8 / 5)) < 1e-9));
it('constants: TILE=16, LOGICAL 320x180', () => { eq(C.TILE, 16); eq(C.LOGICAL_W, 320); eq(C.LOGICAL_H, 180); });

// ---- core/tiles ----
it('tiles: legend é bijeção (selfTest.ok)', () => assert(T.selfTest().ok, JSON.stringify(T.selfTest())));
it('tiles: parseLevel/gridToGlyphs ida-e-volta', () => {
  const txt = [T.TYPE_GLYPH[0] + T.TYPE_GLYPH[2], T.TYPE_GLYPH[3] + T.TYPE_GLYPH[4]].join('\n');
  const grid = T.parseLevel(txt); eq(grid.length, 2); eq(grid[0].length, 2);
  eq(T.gridToGlyphs(grid), txt, 'roundtrip');
});
it('tiles: glifo desconhecido → AIR (= tipo do ".", ar iluminado)', () => { const g = T.parseLevel('.?.'); eq(g[0][1], g[0][0], 'desconhecido = "."'); eq(g[0][1], T.GLYPH_TYPE['.']); });

// ---- core/world ----
it('world: dims preservadas', () => { const w = W.buildWorldFromText('...\n...'); eq(w.length, 2); eq(w[0].length, 3); });
it('world: pedra (2) preservada', () => { const g = T.TYPE_GLYPH[2]; const w = W.buildWorldFromText(g + '\n' + g); eq(w[0][0], 2); });
it('world: passagem de 1 tile ALARGADA (teto pedra→ar, a11y)', () => { eq(JSON.stringify(W.buildWorldFromText('#\n.\n#')), JSON.stringify([[1], [1], [2]])); });
it('world: passagem de 2 tiles NÃO alargada', () => { eq(W.buildWorldFromText('#\n.\n.\n#')[0][0], 2); });
it('world: power-up injetado (super-corrida=12 em x13,y8)', () => { const big = Array.from({ length: 9 }, () => '.'.repeat(14)).join('\n'); eq(W.buildWorldFromText(big)[8][13], 12); });
it('tiles: registro 0..14 consistente (TILE_TYPES/TILE_COLOR/TYPE_GLYPH/TILE_NAME)', () => { for (let t = 0; t <= 14; t++) assert(C.TILE_TYPES[t] !== undefined && C.TILE_COLOR[t] !== undefined && T.TYPE_GLYPH[t] !== undefined && T.TILE_NAME[t] !== undefined, 'tipo ' + t); });

// ---- input/state ----
it('input/state: held por teclado', () => {
  const pl = { ctrl: { jump: ['KeyL'], left: ['KeyA'] }, pad: -1 };
  assert(!S.held(pl, 'jump'), 'antes'); S.keys.add('KeyL');
  assert(S.held(pl, 'jump'), 'depois'); assert(!S.held(pl, 'left'), 'outra ação'); S.keys.delete('KeyL');
  assert(!S.held(pl, 'jump'), 'após soltar');
});
it('input/state: held por gamepad (pl.pad)', () => {
  const pl = { ctrl: { jump: ['KeyL'] }, pad: 0 };
  S.padCur[0] = { jump: true }; assert(S.held(pl, 'jump'), 'pad jump');
  S.padCur[0] = { jump: false }; assert(!S.held(pl, 'jump'), 'pad solto'); delete S.padCur[0];
});

// ---- render/canvas ----
it('canvas: makeCanvas dimensiona', () => { const c = CV.makeCanvas(7, 5); eq(c.width, 7); eq(c.height, 5); });
it('canvas: pixDisc pinta o centro', () => { const c = CV.makeCanvas(9, 9), x = c.getContext('2d'); CV.pixDisc(x, 4, 4, 3, '#ff0000'); const p = x.getImageData(4, 4, 1, 1).data; assert(p[0] === 255 && p[3] === 255, `rgba=${[...p]}`); });
it('canvas: tex usa NEAREST', () => { const t = CV.tex(CV.makeCanvas(2, 2)); eq(t.baseTexture.scaleMode, PIXI.SCALE_MODES.NEAREST); });

// ---- render/props ----
it('props: coinCanvas 11x11', () => { const c = P.coinCanvas(); eq(c.width, 11); eq(c.height, 11); });
it('props: treeCanvas 30x52', () => { const c = P.treeCanvas(); eq(c.width, 30); eq(c.height, 52); });
it('props: powerupCanvas — 7 tipos, 12x12', () => { ['superjump', 'ultrajump', 'turbo', 'fly', 'wallcling', 'key', 'runcane'].forEach((k) => { const c = P.powerupCanvas(k); eq(c.width, 12, k); eq(c.height, 12, k); }); });

// ---- render/sprites (contrato PURO: import não faz I/O; texturas só em initCharacterSprites) ----
it('sprites: SPRITE_MANIFEST contagens (andar 8, correr 4, idle 4)', () => { eq(SP.SPRITE_MANIFEST.andar, 8); eq(SP.SPRITE_MANIFEST.correr, 4); eq(SP.SPRITE_MANIFEST.idle, 4); });
it('sprites: FLAVORS = 3 gracinhas c/ seq (puro) + import puro (TEX_WALK vazio)', () => { eq(SP.FLAVORS.length, 3); assert(SP.FLAVORS.every((f) => Array.isArray(f.seq))); eq(SP.TEX_WALK.length, 0); });

// ---- render/sprite-fx ----
it('sprite-fx: spriteToCanvas 16x32', () => { const c = FX.spriteToCanvas(['SS']); eq(c.width, 16); eq(c.height, 32); });
it('sprite-fx: outlineCanvas mantém a largura', () => { const s = FX.spriteToCanvas(['SS']); const o = FX.outlineCanvas(s, 1); eq(o.width, s.width); });

// ---- platform/storage ----
it('storage: set/get/remove', () => { ST.set('__t_a', 'abc'); eq(ST.get('__t_a'), 'abc'); ST.remove('__t_a'); eq(ST.get('__t_a', null), null); });
it('storage: bool e num', () => { ST.setBool('__t_b', true); assert(ST.getBool('__t_b') === true); ST.set('__t_n', '3.5'); eq(ST.getNum('__t_n'), 3.5); ST.remove('__t_b'); ST.remove('__t_n'); });

// ---- platform/audio (mixer: import PURO, init explícito — dívida paga Fase 2.25) ----
it('audio: import puro — audioCat null até initAudioMixer()', () => { eq(AUDIO.audioCat, null); assert(typeof AUDIO.initAudioMixer === 'function'); });
it('audio: após init, audioCat tem as 9 categorias', () => { AUDIO.initAudioMixer(); eq(Object.keys(AUDIO.audioCat).length, 9); });

// ---- core/rng (LCG semeado, determinístico) ----
it('rng: mesma semente → mesma sequência', () => { RNG.reseed(20260601); const a = JSON.stringify([RNG.rnd(), RNG.rnd()]); RNG.reseed(20260601); eq(JSON.stringify([RNG.rnd(), RNG.rnd()]), a); });
it('rng: randInt(1,6) em [1,6] e shuffle preserva multiset', () => { RNG.reseed(9); for (let i = 0; i < 50; i++) { const v = RNG.randInt(1, 6); assert(v >= 1 && v <= 6, 'randInt'); } eq(JSON.stringify(RNG.shuffle([1, 2, 3]).slice().sort()), JSON.stringify([1, 2, 3])); });

export function runAll() {
  const results = TESTS.map((t) => { try { t.fn(); return { name: t.name, ok: true }; } catch (e) { return { name: t.name, ok: false, err: e.message }; } });
  const fail = results.filter((r) => !r.ok).length;
  return { total: results.length, pass: results.length - fail, fail, results };
}
