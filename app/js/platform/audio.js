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
// audioCat é a fonte viva do estado do mixer (mutada pela UI/calmMode no game.js — objeto, nunca reatribuído
// APÓS init). NULL até initAudioMixer(): o import fica PURO (não lê localStorage). initAudioMixer é chamado no
// boot do game.js — todos os leitores de audioCat (mixer/ambiente/narração) rodam depois. (Fase 2.25)
export let audioCat = null;
// Carrega o estado do mixer (defaults do audio-mixer.js + o que estiver salvo). I/O EXPLÍCITO, idempotente.
export function initAudioMixer() { if (!audioCat) audioCat = loadAudioCat(); }
const _catNodes = {};
export function catNode(cat) { const ac = ensureAC(); if (!ac) return null; const out = audioOut(); if (!_catNodes[cat]) { const g = ac.createGain(); g.gain.value = audioCat[cat].on ? audioCat[cat].vol : 0; g.connect(out); _catNodes[cat] = g; } return _catNodes[cat]; }
export function setCatGain(cat) { const g = _catNodes[cat]; if (g && audioCtx) g.gain.setTargetAtTime(audioCat[cat].on ? audioCat[cat].vol : 0, audioCtx.currentTime, 0.02); saveAudioCat(cat, audioCat[cat]); }

// ===== Sínteses de oscilador (earcons/melodias). Leem soundOn/volume; roteiam pelo mixer→mestre. =====
// pc = contexto de áudio por-jogador (opcional; o game.js o passa p/ rotear a pista ao dispositivo do jogador).
export function tone(freq, dur, type, when, vol) { if (!soundOn || volume <= 0) return; try { const ac = ensureAC(); if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + (when || 0);
  o.type = type || 'square'; o.frequency.setValueAtTime(freq, t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.02, (vol || 0.22) * volume), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(catNode('earcons') || audioOut() || ac.destination); o.start(t); o.stop(t + dur + 0.02); } catch (e) {} }
export function tonePan(freq, dur, cat, pan, vol, type, pc) { if (!soundOn || volume <= 0) return; const ac = pc ? pc.ac : ensureAC(); if (!ac) return; try {
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.02, (vol || 0.2) * volume), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = g; if (pan != null && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); node = p; }
  o.connect(g); node.connect(pc ? pc.out : (catNode(cat) || audioOut() || ac.destination)); o.start(t); o.stop(t + dur + 0.02); } catch (e) {} }

// ===== Synth de RUÍDO (passos por material, bengala). noiseBuffer cacheia por-contexto (suporta AC por jogador). =====
export let _footCount = 0; // contador de passos/pancadas (estatística de a11y; o __incl do game.js lê via getter)
export function noiseBuffer(ac) { if (ac._noiseBuf && ac._noiseBuf.length === ((ac.sampleRate * 0.2) | 0)) return ac._noiseBuf; const n = (ac.sampleRate * 0.2) | 0, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return ac._noiseBuf = b; }
// timbre por material: filtro (f) + frequência (hz) + duração (d) + volume (v)
const FOOT = { grama:{f:'highpass',hz:2000,d:0.09,v:0.10}, piso:{f:'bandpass',hz:1200,d:0.06,v:0.15}, pedra:{f:'highpass',hz:1600,d:0.05,v:0.19},
  areia:{f:'lowpass',hz:650,d:0.13,v:0.10}, madeira:{f:'bandpass',hz:480,d:0.08,v:0.15}, ferro:{f:'bandpass',hz:2600,d:0.12,v:0.16}, parede:{f:'highpass',hz:3200,d:0.10,v:0.08},
  terra:{f:'lowpass',hz:520,d:0.11,v:0.12}, agua:{f:'lowpass',hz:330,d:0.15,v:0.13} };
export function noiseHit(mat, pan, pc) { if (!soundOn || volume <= 0) return; const ac = pc ? pc.ac : ensureAC(); if (!ac) return; const f = FOOT[mat] || FOOT.piso; try {
  const src = ac.createBufferSource(); src.buffer = noiseBuffer(ac); const bq = ac.createBiquadFilter(); bq.type = f.f; bq.frequency.value = f.hz; bq.Q.value = 1.2;
  const g = ac.createGain(), t = ac.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.02, f.v * volume), t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + f.d);
  let node = g; if (pan != null && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); node = p; }
  src.connect(bq).connect(g); node.connect(pc ? pc.out : (catNode('interact') || audioOut() || ac.destination)); src.start(t); src.stop(t + f.d + 0.03); _footCount++;
} catch (e) {} }

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
