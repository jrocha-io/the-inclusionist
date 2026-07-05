// SPDX-License-Identifier: GPL-3.0-or-later
// ui/dom.ts — atalhos de seleção do DOM, usados em toda a UI (menus/HUD/pausa/quiz/opções). Módulo-folha PURO:
// só define as funções (não toca no DOM no import → importável em node). $ = querySelector; $$ = querySelectorAll
// como Array. Genéricos: $<HTMLInputElement>('#x') já tipa o retorno. (Fase 2.27 / Tier 1)
export const $ = <T extends Element = Element>(s: string): T | null => document.querySelector<T>(s);
export const $$ = <T extends Element = Element>(s: string): T[] => [...document.querySelectorAll<T>(s)];
