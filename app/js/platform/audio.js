// SPDX-License-Identifier: GPL-3.0-or-later
// platform/audio.js — base do áudio: ciclo do AudioContext (ensureAC) + definições de SFX (dados). Módulo-folha.
// O grafo (master/mixer), soundOn/volume e as sínteses (tone/noiseHit/tonePan/sfx) ainda ficam no game.js —
// migram numa rodada dedicada (injeção de dependência). audioCtx é binding vivo; só ensureAC o (re)cria. (Fase 2)
// Som mestre: liga/desliga + volume (0..1). Sessão-only (sem persistência). Bindings vivos: as sínteses
// (tone/noiseHit/…) e a narração leem soundOn/volume; o botão/slider mestre do game.js escreve pelos setters.
export let soundOn = true;
export function setSoundOn(v) { soundOn = v; }
export let volume = 0.6;
export function setVolume(v) { volume = v; }

export let audioCtx = null;
export function ensureAC() {
  if (!audioCtx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) audioCtx = new AC(); }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Efeitos sonoros básicos: frequência (f), duração (d), timbre (t) e legenda (cap, para captions/aria-live).
export const SFX = {
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
