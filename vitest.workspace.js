// SPDX-License-Identifier: GPL-3.0-or-later
// Workspace do Vitest — DEV-ONLY (fora do jogo build-less; deploy = pasta app/). Dois "projects":
//  • node    — lógica pura (sem PIXI/document/localStorage): tests/*.node.test.js. Rápido.
//  • browser — render/DOM real via Chromium/Playwright: tests/*.browser.test.js (PIXI/canvas/localStorage).
// Ver docs/plano-testes.md. Config de browser mode segue a API do Vitest 2.x; se a sua versão divergir, ajuste.
export default [
  {
    test: {
      name: 'node',
      environment: 'node',
      include: ['tests/**/*.node.test.js'],
    },
  },
  {
    test: {
      name: 'browser',
      include: ['tests/**/*.browser.test.js'],
      setupFiles: ['./vitest.setup.browser.js'],
      browser: {
        enabled: true,
        provider: 'playwright',
        name: 'chromium',
        headless: true,
        screenshotOnFailure: false,
      },
    },
  },
];
