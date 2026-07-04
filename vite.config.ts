import { defineConfig } from 'vite';

// Migração TS+Vite — Estágio 0 (docs/plano-typescript-vite.md). Mínimo: root = app/ (onde está o index.html).
// Em DEV o Vite serve TUDO sob app/ (js/css/assets/vendor), então o jogo CRU (PIXI global do vendor, módulos
// .js atuais) roda sem mover nada — só p/ provar o toolchain. O build joga em dist/ (Estágio 0b acerta a cópia
// dos estáticos via app/public/; PWA no Estágio 1 via vite-plugin-pwa).
export default defineConfig({
  root: 'app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2022',
  },
});
