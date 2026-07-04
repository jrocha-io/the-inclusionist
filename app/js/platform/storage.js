// SPDX-License-Identifier: GPL-3.0-or-later
// Camada única de persistência (localStorage) — módulo-folha. À prova de exceção: localStorage LANÇA em
// file:// e no modo privado de alguns navegadores, e isso derrubava o boot inteiro (por isso todo acesso é
// try/catch). Centralizar aqui: um lugar para trocar a estratégia (namespacing, IndexedDB…) sem caçar ~60
// pontos. Migração em LOTES (plano-mestre Fase 2) — nem todo game.js usa isto ainda.

export function get(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v == null ? fallback : v; } catch (e) { return fallback; }
}
export function set(key, value) {
  try { localStorage.setItem(key, String(value)); return true; } catch (e) { return false; }
}
export function remove(key) { try { localStorage.removeItem(key); } catch (e) {} }

export function getBool(key, fallback = false) { const v = get(key, null); return v == null ? fallback : v === '1'; }
export function setBool(key, on) { set(key, on ? '1' : '0'); }

export function getNum(key, fallback = 0) { const v = parseFloat(get(key, null)); return isFinite(v) ? v : fallback; }

export function getJSON(key, fallback = null) {
  try { const s = get(key, null); return s == null ? fallback : JSON.parse(s); } catch (e) { return fallback; }
}
export function setJSON(key, obj) { try { set(key, JSON.stringify(obj)); } catch (e) {} }

// Registro das chaves conhecidas (documentação em UM lugar; a fonte de verdade ainda é o uso). Vai sendo
// completado à medida que os lotes migram. Chaves com {i}/{cen}/{id} são parametrizadas por jogador/cenário/controle.
export const KEYS = {
  // empatia motora/auditiva
  onebtn: 'incl_onebtn', wheelchair: 'incl_wheelchair', modocego: 'incl_modocego', caneDiv: 'incl_cane_div',
  hearingloss: 'incl_hearingloss',
  // atividade / quiz / cenário
  activity: 'incl_activity', quizlevel: 'incl_quizlevel', cenario: 'incl_cenario', tabsel: 'incl_tabsel',
  fracnot: 'incl_fracnot',
  // visual / contraste / cor
  viz: 'incl_viz', lq: 'incl_lq', cbsafe: 'incl_cbsafe', ownercolors: 'incl_ownercolors',
  outfg: 'incl_outfg', outbg: 'incl_outbg', hcrole: 'incl_hcrole', juice: 'incl_juice', crt: 'incl_crt2',
  // áudio / voz / i18n
  ttsEngine: 'incl_tts_engine', ttsVoice: 'incl_tts_voice', lang: 'incl_lang', // audiocat_{k}, attract_{cen}
  // tipografia / controles / toque
  fontKey: 'incl_font_k', padDesign: 'incl_paddesign', padDir: 'incl_paddir', touchmap: 'incl_touchmap',
  // por jogador (sufixo _p{i}): viz_p, sink_p, easy_p, togglemove_p, rmWalk_p, rmBreath_p, rmFlavor_p
};
