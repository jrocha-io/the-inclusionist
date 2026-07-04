import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Migração TS+Vite (docs/plano-typescript-vite.md). root=app/ (index.html) p/ dev/build.
// PWA (Estágio 1): o vite-plugin-pwa gera o SW (Workbox) e o manifest — aposenta o sw.js artesanal e o bump
// manual de INCL_VERSION. Precache do shell + assets por CONTENT-HASH → cache invalida sozinho; registerType
// 'autoUpdate' aplica a versão nova no próximo load (resolve o "build velho preso" por construção).
// A config de TESTE vive aqui (Vitest 3 deprecou o workspace → test.projects; cada project usa root=raiz do repo).
export default defineConfig({
  root: 'app',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // o plugin injeta o registro do SW no index.html (offline)
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'The Inclusionist',
        short_name: 'Inclusionist',
        description: 'Jogo educativo de plataforma acessível (PixiJS · WCAG 2.2 + GAG).',
        lang: 'pt-BR',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#0b1020',
        theme_color: '#0b1020',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        // precacheia TUDO que o jogo usa offline: bundle (js/css/html) + sprites (png) + fontes (woff2) +
        // nível (txt) + tileset (json) + ícone (svg). O maior arquivo é o pixi (445KB) < 2MB (limite default).
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,txt,json,webmanifest}'],
        cleanupOutdatedCaches: true,
      },
      // PWA fica DESLIGADA no dev (default) — sem SW/cache atrapalhando o HMR; testar via `npm run build` + `preview`.
    }),
  ],
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
