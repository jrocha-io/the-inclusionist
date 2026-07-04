// SPDX-License-Identifier: GPL-3.0-or-later
// platform/audio-mixer.js — categorias do mixer de áudio (dados) + carga/persistência. Módulo-folha (storage).
// O grafo de áudio (catNode/setCatGain/_catNodes/audioCtx) e o objeto audioCat VIVO ficam no game.js — aqui só
// a lista das categorias, o estado inicial (com o default TTS-off) e o save por categoria. (Fase 2, áudio)
import * as store from './storage.js';

export const AUDIO_CATS = [
  {k:'music',   lbl:'Música'}, {k:'ambient', lbl:'Sons ambiente (água, rua, trânsito, folhas, chuva)'},
  {k:'interact',lbl:'Efeitos de interação (passos, portas, escada)'}, {k:'earcons', lbl:'Earcons (pulo, moeda, dano…)'},
  {k:'other',   lbl:'Outros efeitos'}, {k:'tts', lbl:'Narração (TTS)'}, {k:'sonar', lbl:'Sonar'},
  {k:'guard',   lbl:'Guarda de beirada'}, {k:'guide', lbl:'Pista / guia auditivo'},
];

// Estado inicial por categoria. O TTS geral nasce DESLIGADO: útil p/ cegos e alguns em alfabetização, mas voz
// (robótica) irrita/sobrecarrega pessoas com TEA — quem precisa liga no menu. As demais nascem ligadas. (O TTS
// do letramento é o gameSay(), independente disto e sempre ativo.) O que estiver salvo sobrepõe o default.
export function loadAudioCat() {
  const cat = {};
  AUDIO_CATS.forEach((c) => {
    let on = (c.k !== 'tts'), vol = 0.8;
    const o = store.getJSON('incl_audiocat_' + c.k, null);
    if (o) { on = !!o.on; vol = +o.vol; }
    cat[c.k] = { on, vol };
  });
  return cat;
}
export function saveAudioCat(k, obj) { store.setJSON('incl_audiocat_' + k, obj); }
