// SPDX-License-Identifier: GPL-3.0-or-later
// input/keyboard.js — esquemas de teclado (config) + persistência. Módulo-folha (só depende de storage).
// 8 ações: up,left,down,right,run(corre/interage),jump,swap(troca poder),especial. Esquemas por contagem de
// jogadores (solo/p2/p3/p4). A INSTÂNCIA atual (KB) e o remap ficam no game.js — aqui só config/load/save/reset.
import * as store from '../platform/storage.js';

const CKEY = 'inclusionist.kbcontrols.v3';

// 4 esquemas base p/ 3–4 jogadores (modos 3 e 4 têm esquemas SEPARADOS, p3 e p4, editáveis por jogador)
export const KB_SCHEMES4 = [
  { left:['KeyA'],right:['KeyD'],up:['KeyW'],down:['KeyS'], run:['KeyZ'],jump:['KeyX'],swap:['KeyC'],especial:['KeyV'] },
  { left:['KeyJ'],right:['KeyL'],up:['KeyI'],down:['KeyK'], run:['KeyM'],jump:['Comma'],swap:['Period'],especial:['Semicolon','Slash'] },
  { left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown'], run:['Home'],jump:['End'],swap:['PageUp'],especial:['PageDown'] },
  { left:['Numpad4'],right:['Numpad6'],up:['Numpad8'],down:['Numpad5'], run:['Numpad2'],jump:['Numpad0'],swap:['Numpad3'],especial:['NumpadDecimal'] },
];
export const KB_DEFAULTS = {
  // 1 jogador: WASD + setas; pulo J/Espaço; UJIK como na mão pequena do DOS. Sem Alt/AltGr/Ctrl/Shift.
  solo:{ left:['KeyA','ArrowLeft'], right:['KeyD','ArrowRight'], up:['KeyW','ArrowUp'], down:['KeyS','ArrowDown'],
         run:['KeyU'], jump:['KeyJ','Space'], swap:['KeyI'], especial:['KeyK'] },
  p2:[ { left:['KeyA'],right:['KeyD'],up:['KeyW'],down:['KeyS'], run:['KeyU'],jump:['KeyJ'],swap:['KeyI'],especial:['KeyK'] },
       { left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown'], run:['Numpad8'],jump:['Numpad5'],swap:['Numpad9'],especial:['Numpad6'] } ],
  p3: JSON.parse(JSON.stringify(KB_SCHEMES4.slice(0, 3))), // modo 3 jogadores (independente do 4)
  p4: JSON.parse(JSON.stringify(KB_SCHEMES4)),             // modo 4 jogadores
};

// carrega os esquemas salvos SOBRE os defaults (com migração do dado antigo p34 → p3+p4)
export function loadKB() {
  const d = JSON.parse(JSON.stringify(KB_DEFAULTS));
  const s = store.getJSON(CKEY, null);
  if (s) {
    if (s.solo) Object.assign(d.solo, s.solo);
    if (Array.isArray(s.p34)) { s.p34.forEach((m, i) => { if (m) { if (d.p4[i]) Object.assign(d.p4[i], m); if (i < 3 && d.p3[i]) Object.assign(d.p3[i], m); } }); }
    ['p2', 'p3', 'p4'].forEach((g) => { if (Array.isArray(s[g])) s[g].forEach((m, i) => { if (d[g][i] && m) Object.assign(d[g][i], m); }); });
  }
  return d;
}
export function saveKB(kb) { store.setJSON(CKEY, kb); }
export function resetKB() { store.remove(CKEY); return JSON.parse(JSON.stringify(KB_DEFAULTS)); }
