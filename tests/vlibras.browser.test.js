// SPDX-License-Identifier: GPL-3.0-or-later
// Testes de ui/vlibras — integração com o widget VLibras (project BROWSER: usa DOM). O widget real não existe no
// teste; checamos a DETECÇÃO (pelo botão de acesso), o aviso via srAlert e o polling sem transição.
// Ver docs/plano-modularizacao-mapa.md (Estágio 4, Tier 1, ui/vlibras).
import { describe, it, expect } from 'vitest';
import * as V from '../app/js/ui/vlibras.js';

const nextFrame = () => new Promise((r) => requestAnimationFrame(r));

describe('ui/vlibras — detecção do painel (vlibrasOpen)', () => {
  it('[Zero] sem o widget no DOM → false', () => {
    document.body.innerHTML = '';
    expect(V.vlibrasOpen()).toBe(false);
  });
  it('[Interface] botão de acesso escondido (display:none → offsetParent null) → painel ABERTO', () => {
    document.body.innerHTML = '<div vw-access-button style="display:none"></div>';
    expect(V.vlibrasOpen()).toBe(true);
  });
});

describe('ui/vlibras — toggleLibras (robustez)', () => {
  it('[Robustez] sem o widget carregado → avisa via srAlert e não lança', async () => {
    document.body.innerHTML = '<p id="sr-status"></p><p id="sr-alert"></p>';
    expect(() => V.toggleLibras()).not.toThrow();
    await nextFrame();
    expect(document.querySelector('#sr-alert').textContent).toMatch(/Libras/i); // usa o srAlert de core/a11y-sr
  });
});

describe('ui/vlibras — vlTick + callback de reflow', () => {
  it('[Zero] sem widget → sem transição → callback (layout) NÃO é chamado; librasOpen segue false', () => {
    document.body.innerHTML = '';
    let n = 0; V.setOnLibrasChange(() => { n++; });
    V.vlTick();
    expect(n).toBe(0);
    expect(V.librasOpen).toBe(false);
  });
});
