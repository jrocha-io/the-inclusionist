// SPDX-License-Identifier: GPL-3.0-or-later
// render/props.js — arte procedural de "props" coletáveis/decorativos: moeda (coin) e árvore urbana (tree).
// Desenhados por ALGORITMO (pixel a pixel, sem PNG embutido) sobre as primitivas de render/canvas.js. Módulo-
// folha de dados visuais: zero estado de jogo. As variantes *Texture embrulham o canvas numa PIXI.Texture. (Fase 2.19)
import { makeCanvas, tex, pixDisc } from './canvas.js';

export function coinCanvas() {
  const cv = makeCanvas(11, 11), c = cv.getContext('2d');
  pixDisc(c, 5, 5, 5, '#ffd23f', '#7a5400');                                // disco dourado + contorno
  c.fillStyle = '#fff3b0'; c.fillRect(3, 2, 2, 1); c.fillRect(2, 3, 1, 2);  // brilho (canto sup-esq)
  c.fillStyle = '#e0a82a'; c.fillRect(7, 7, 2, 1); c.fillRect(8, 6, 1, 2);  // sombra (inf-dir)
  return cv;
}
export function coinTexture() { return tex(coinCanvas()); }

export function treeCanvas() { // árvore urbana caprichada (R-cidade): tronco sombreado c/ raízes + copa em 3 tons + luz de borda
  const cv = makeCanvas(30, 52), c = cv.getContext('2d');
  c.fillStyle = '#241a0e'; c.fillRect(12, 28, 7, 22); c.fillRect(9, 47, 13, 3); // contorno tronco + raízes
  c.fillStyle = '#5c4033'; c.fillRect(13, 28, 5, 21);                           // tronco
  c.fillStyle = '#7a5a48'; c.fillRect(13, 28, 2, 21);                           // luz do tronco
  c.fillStyle = '#3f2c20'; c.fillRect(16, 30, 2, 19);                           // sombra do tronco
  c.fillStyle = '#5c4033'; c.fillRect(10, 47, 4, 2); c.fillRect(17, 47, 4, 2);  // raízes
  pixDisc(c, 15, 17, 13, '#175e3c', '#0e3a24');                                 // copa base (escura + contorno)
  pixDisc(c, 10, 15, 8, '#1f7a4d'); pixDisc(c, 20, 14, 7, '#1f7a4d');           // volumes médios
  pixDisc(c, 9, 12, 5, '#2fa35f'); pixDisc(c, 19, 10, 5, '#2fa35f');            // tufos claros
  pixDisc(c, 12, 9, 3, '#46b06a'); pixDisc(c, 21, 8, 2, '#46b06a');             // luz de topo
  c.fillStyle = '#0e3a24'; c.fillRect(6, 25, 18, 3);                            // sombra sob a copa
  c.fillStyle = 'rgba(255,255,255,.20)'; c.fillRect(8, 7, 3, 1); c.fillRect(18, 5, 2, 1); // brilhinhos
  return cv;
}
export function treeTexture() { return tex(treeCanvas()); }
