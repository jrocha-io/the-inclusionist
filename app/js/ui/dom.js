// SPDX-License-Identifier: GPL-3.0-or-later
// ui/dom.js — atalhos de seleção do DOM, usados em toda a UI (menus/HUD/pausa/quiz/opções). Módulo-folha PURO:
// só define as funções (não toca no DOM no import → importável em node). $ = querySelector; $$ = querySelectorAll
// como Array. (Fase 2.27 / Tier 1 — utilitário-base que destrava os outros módulos de UI)
export const $ = (s) => document.querySelector(s);
export const $$ = (s) => [...document.querySelectorAll(s)];
