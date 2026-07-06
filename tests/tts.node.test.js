// SPDX-License-Identifier: GPL-3.0-or-later
// Testes de platform/tts (project NODE: window.speechSynthesis + SpeechSynthesisUtterance stubados; NÃO exercito o
// caminho Piper, que faz import() de CDN). Contratos: narrate é gated por soundOn + audioCat.tts.on + texto não-vazio;
// o fallback Web Speech fala; loadTTS avisa em motor sem pt-BR. Ver docs/5-Refactoring/plano-modularizacao-mapa.md (#38).
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTts } from '../app/js/platform/tts.js';

let spoke, cancels;
beforeEach(() => {
  spoke = []; cancels = 0;
  globalThis.window = { speechSynthesis: { cancel: () => { cancels++; }, speak: (u) => spoke.push(u) } };
  globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; this.lang = ''; this.rate = 0; this.volume = 0; this.voice = null; } };
});
afterEach(() => { delete globalThis.window; delete globalThis.SpeechSynthesisUtterance; });

function setup(over = {}) {
  const said = [], alerted = [];
  const ctx = {
    srSay: (t) => said.push(t), srAlert: (t) => alerted.push(t),
    ensureAC: () => null, catNode: () => null, audioOut: () => null,
    getSoundOn: () => over.soundOn === undefined ? true : over.soundOn,
    getVolume: () => over.volume === undefined ? 0.6 : over.volume,
    getAudioCat: () => over.audioCat === undefined ? { tts: { on: true } } : over.audioCat,
  };
  return { tts: createTts(ctx), said, alerted };
}

describe('platform/tts', () => {
  it('[Gate] narrate não fala com soundOn=false', () => {
    const { tts } = setup({ soundOn: false });
    tts.narrate('oi');
    expect(spoke.length).toBe(0);
    expect(tts.narrateCount).toBe(0);
  });

  it('[Gate] narrate não fala com o toggle TTS (audioCat.tts.on) desligado', () => {
    const { tts } = setup({ audioCat: { tts: { on: false } } });
    tts.narrate('oi');
    expect(spoke.length).toBe(0);
  });

  it('[Zero] narrate ignora texto vazio', () => {
    const { tts } = setup();
    tts.narrate('');
    expect(spoke.length).toBe(0);
    expect(tts.narrateCount).toBe(0);
  });

  it('[Happy] narrate (webspeech, tudo ligado) fala e conta', () => {
    const { tts } = setup();
    tts.narrate('bom dia');
    expect(spoke.length).toBe(1);
    expect(spoke[0].text).toBe('bom dia');
    expect(spoke[0].lang).toBe('pt-BR');
    expect(tts.narrateCount).toBe(1);
  });

  it('[Interface] volume do Web Speech = min(1, volume×1.4)', () => {
    const { tts } = setup({ volume: 0.5 });
    tts.narrate('x');
    expect(spoke[0].volume).toBeCloseTo(0.7); // 0.5 × 1.4
  });

  it('[Boundary] speakWebSpeech sem speechSynthesis retorna false', () => {
    globalThis.window = {}; // sem speechSynthesis
    const { tts } = setup();
    expect(tts.speakWebSpeech('x')).toBe(false);
  });

  it('[State] getEngineSel default webspeech; setEngineSel reflete', () => {
    const { tts } = setup();
    expect(tts.getEngineSel()).toBe('webspeech');
    tts.setEngineSel('piper');
    expect(tts.getEngineSel()).toBe('piper');
  });

  it('[State] set/getVoiceObj roundtrip', () => {
    const { tts } = setup();
    const v = { name: 'Luciana', lang: 'pt-BR' };
    tts.setVoiceObj(v);
    expect(tts.getVoiceObj()).toBe(v);
  });

  it('[Interface] loadTTS em motor sem pt-BR (kokoro) avisa e não carrega', () => {
    const { tts, alerted } = setup();
    tts.setEngineSel('kokoro');
    tts.loadTTS();
    expect(alerted.some((a) => /ainda não fala português/.test(a))).toBe(true);
    expect(tts.loading).toBe(false);
  });
});
