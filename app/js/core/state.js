// SPDX-License-Identifier: GPL-3.0-or-later
// core/state.js — estado/cena do jogo (FONTE ÚNICA). Módulo-folha. As 8 mega-variáveis migram do game.js
// UMA A UMA (plano-mestre Fase 2 / plano-engine §3), lidas como binding vivo (import) e escritas por setter.
// Bus mínimo (Map<evento, Set<fn>>) para os poucos leitores "de longe" que virão com os outros subsistemas.
import * as store from '../platform/storage.js'; // persistência (as mega-vars com chave leem/gravam aqui)

const _subs = new Map();
export function on(evt, fn) { if (!_subs.has(evt)) _subs.set(evt, new Set()); _subs.get(evt).add(fn); return () => off(evt, fn); }
export function off(evt, fn) { const s = _subs.get(evt); if (s) s.delete(fn); }
function emit(evt, val) { const s = _subs.get(evt); if (s) for (const fn of s) { try { fn(val); } catch (e) {} } }

// --- phase: 'title' | 'playing' | 'paused' (congela o jogo fora de 'playing') ---
// Leitura: importe `phase` (binding vivo) — as checagens `phase==='playing'` no game.js não mudam.
// Escrita: só via setPhaseValue() — aqui fica apenas o VALOR + evento; a reação de UI segue no setPhase() do game.js.
export let phase = 'title';
export function setPhaseValue(p) { phase = p; emit('phase', p); }

// --- quizLevel: 1..5 (nível do quiz de alfabetização; persistido em incl_quizlevel) ---
export let quizLevel = (() => { const v = store.getNum('incl_quizlevel', 2); return v >= 1 && v <= 5 ? v : 2; })();
export function setQuizLevelValue(n) { quizLevel = Math.max(1, Math.min(5, n | 0)); store.set('incl_quizlevel', String(quizLevel)); emit('quizLevel', quizLevel); }

// --- numPlayers: 1..4 (nº de telas/jogadores; não persistido) ---
export let numPlayers = 1;
export function setNumPlayersValue(n) { numPlayers = n; emit('numPlayers', n); }

// --- cenario: tema visual ativo (cidade/campo/…; persistido em incl_cenario). A validação contra CENARIOS e
//     o trabalho de textura ficam no setCenario() do game.js — aqui só o valor + persistência + evento. ---
export let cenario = null;
export function setCenarioValue(theme) { cenario = theme; store.set('incl_cenario', theme); emit('cenario', theme); }
