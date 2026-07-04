import { defineConfig } from 'vite';

// Migração TS+Vite (docs/plano-typescript-vite.md). root=app/ (index.html) p/ dev/build. A config de TESTE
// vive aqui (Vitest 3 deprecou o vitest.workspace.js → test.projects). Cada project usa root = raiz do repo
// (import.meta.dirname) p/ achar tests/ e vitest.setup.browser.js — senão herdaria root=app/ e não acharia nada.
export default defineConfig({
  root: 'app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2022',
  },
  test: {
    projects: [
      {
        // lógica pura (rápido, sem browser)
        root: import.meta.dirname,
        test: {
          name: 'node',
          environment: 'node',
          include: ['tests/**/*.node.test.js'],
        },
      },
      {
        // render/DOM real via Chromium/Playwright (Vitest 3: browser.instances)
        root: import.meta.dirname,
        test: {
          name: 'browser',
          include: ['tests/**/*.browser.test.js'],
          setupFiles: ['./vitest.setup.browser.js'],
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
