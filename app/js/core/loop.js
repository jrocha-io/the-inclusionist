// SPDX-License-Identifier: GPL-3.0-or-later
// core/loop.js — driver do loop de jogo. Registra a função de frame num "ticker" (o app.ticker do PixiJS, ou
// qualquer objeto com .add(fn) e .deltaTime) e passa o dt CLAMPADO (evita saltos gigantes após a aba ficar em
// segundo plano). Módulo-folha. Mantém a cadência ATUAL (não muda o timing) — o fixed-timestep determinístico
// fica para depois, pois mudaria a física. Ver docs/plano-engine.md (subsistema Loop) e docs/plano-mestre.md.
export function startLoop(ticker, frame, maxDt = 2) {
  ticker.add(() => frame(Math.min(ticker.deltaTime, maxDt)));
}
