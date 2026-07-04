// SPDX-License-Identifier: GPL-3.0-or-later
// input/devices.js — rótulos/mapeamentos de gamepad e toque (dados). Módulo-folha, ZERO deps.
// PAD_DESIGNS: como rotular os 4 botões de ação por modelo de controle (o navegador detecta genérico no
// Windows). TOUCH_ACT_LABELS: rótulos das ações de toque. TOUCH_DEFAULT: mapa padrão dos 9 slots de toque.
// A leitura de pads (pollPads) e o layout de toque ficam no game.js. (Fase 2, subsistema input)
export const PAD_DESIGNS = {
  generic:{'0':['0','#3a4a6a'],'1':['1','#3a4a6a'],'2':['2','#3a4a6a'],'3':['3','#3a4a6a']},
  microsoft:{'0':['A','#2fae4e'],'1':['B','#d23b3b'],'2':['X','#2f6fd2'],'3':['Y','#d9a400']},
  sony:{'0':['✕','#4f8fd0'],'1':['○','#d23b3b'],'2':['□','#d76fae'],'3':['△','#2fae7e']},
  nintendo:{'0':['B','#d9a400'],'1':['A','#d23b3b'],'2':['Y','#2fae4e'],'3':['X','#2f6fd2']},
};
export const TOUCH_ACT_LABELS = { left:'Andar à esquerda', right:'Andar à direita', up:'Subir / escada', down:'Descer / escada', jump:'Pular', run:'Correr / interagir', especial:'Especial', swap:'Trocar poder', pause:'Pausar (START)' };
export const TOUCH_DEFAULT = { up:'up',down:'down',left:'left',right:'right',start:'pause',b0:'jump',b1:'especial',b2:'run',b3:'swap' };
