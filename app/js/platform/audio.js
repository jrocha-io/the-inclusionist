// SPDX-License-Identifier: GPL-3.0-or-later
// platform/audio.js — base do áudio: ciclo do AudioContext (ensureAC) + definições de SFX (dados). Módulo-folha.
// O grafo (master/mixer), soundOn/volume e as sínteses (tone/noiseHit/tonePan/sfx) ainda ficam no game.js —
// migram numa rodada dedicada (injeção de dependência). audioCtx é binding vivo; só ensureAC o (re)cria. (Fase 2)
import { loadAudioCat, saveAudioCat } from './audio-mixer.js'; // mixer por categoria (dados + persistência)

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

// ===== Nó MESTRE: master gain → (filtro de perda auditiva opcional) → destino. =====
export let hearingLoss = false;
let _masterGain = null, _hlChain = null;
export function audioOut() { const ac = ensureAC(); if (!ac) return null; if (!_masterGain) { _masterGain = ac.createGain(); wireMaster(); } return _masterGain; }
function buildHearingChain(ac) {
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.Q.value = 0.7; // agudos primeiro
  const sp = ac.createScriptProcessor(512, 1, 1); const TH = 0.06, RED = 0.12; // frame < limiar → ×0.12 (contrário de aparelho auditivo)
  sp.onaudioprocess = (e) => { const inp = e.inputBuffer.getChannelData(0), out = e.outputBuffer.getChannelData(0); let s = 0; for (let i = 0; i < inp.length; i++) s += inp[i] * inp[i]; const g = Math.sqrt(s / inp.length) < TH ? RED : 1; for (let i = 0; i < inp.length; i++) out[i] = inp[i] * g; };
  lp.connect(sp); sp.connect(ac.destination); return { input: lp };
}
function wireMaster() { const ac = audioCtx; if (!ac || !_masterGain) return; try { _masterGain.disconnect(); } catch (e) {}
  if (hearingLoss) { if (!_hlChain) _hlChain = buildHearingChain(ac); _masterGain.connect(_hlChain.input); } else _masterGain.connect(ac.destination); }
// Empatia de perda auditiva: liga/desliga o filtro no nó mestre. A persistência + srSay ficam no game.js.
export function setHearingLossGraph(on) { hearingLoss = on; if (audioCtx) { audioOut(); wireMaster(); } }
// Mute mestre (pausa/título silenciam tudo; volta ao jogar). Só age se o nó mestre já existe (não o cria à toa).
export function setMasterMuted(muted) { if (!_masterGain || !audioCtx) return; try { _masterGain.gain.setTargetAtTime(muted ? 0 : 1, audioCtx.currentTime, 0.04); } catch (e) {} }

// ===== Mixer por categoria: cada categoria tem seu gain (liga/desliga + volume), pendurado no nó mestre. =====
// audioCat é a fonte viva do estado do mixer (mutada pela UI/calmMode no game.js — objeto, nunca reatribuído).
export const audioCat = loadAudioCat();
const _catNodes = {};
export function catNode(cat) { const ac = ensureAC(); if (!ac) return null; const out = audioOut(); if (!_catNodes[cat]) { const g = ac.createGain(); g.gain.value = audioCat[cat].on ? audioCat[cat].vol : 0; g.connect(out); _catNodes[cat] = g; } return _catNodes[cat]; }
export function setCatGain(cat) { const g = _catNodes[cat]; if (g && audioCtx) g.gain.setTargetAtTime(audioCat[cat].on ? audioCat[cat].vol : 0, audioCtx.currentTime, 0.02); saveAudioCat(cat, audioCat[cat]); }

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
