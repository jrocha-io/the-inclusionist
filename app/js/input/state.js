// SPDX-License-Identifier: GPL-3.0-or-later
// input/state.js — ESTADO de input em runtime + query genérica, compartilhado pelos handlers (que ficam no
// game.js e mutam estes objetos IN-PLACE): teclas seguradas (keys), estado de gamepad por controle
// (padCur/padPrevAct/padPrevStart) e a zona morta do analógico (PAD_DEAD). held(pl,act) = o jogador está
// segurando a ação, por teclado (pl.ctrl) OU pelo gamepad associado (pl.pad). Módulo-folha, ZERO deps. (Fase 2.22)

// Teclas físicas seguradas AGORA (KeyboardEvent.code). Mutada por keydown/keyup no game.js.
export const keys = new Set();

// Gamepad (B3/L1): padCur[gi] = ações seguradas neste frame; padPrevAct/padPrevStart = borda do frame anterior.
// Associação pad↔jogador vive em p.pad. Mutados IN-PLACE por pollPads no game.js.
export const padCur = {}, padPrevAct = {}, padPrevStart = {};
export const PAD_DEAD = 0.5; // zona morta = primeira METADE do curso do analógico (ergonomia — José 2026-07-02)

// Jogador está segurando a ação? teclado (algum code do esquema pl.ctrl) OU o gamepad associado (pl.pad).
export const held = (pl, act) => pl.ctrl[act].some((k) => keys.has(k)) || (pl.pad >= 0 && padCur[pl.pad] && !!padCur[pl.pad][act]);
