// SPDX-License-Identifier: GPL-3.0-or-later
// Service worker — cache do app-shell para rodar 100% offline (PWA).
const CACHE = 'inclusionist-v4.164.15'; // = versão do jogo (bump A CADA commit invalida o cache antigo)
const SHELL = [
  './', 'index.html', 'js/game.js', 'css/style.css',
  // i18n: módulo + idiomas pré-cacheados p/ trocar de idioma offline (docs/plano-i18n.md)
  'js/core/i18n.js', 'js/i18n/pt.js', 'js/i18n/en.js', 'js/i18n/es.js',
  'js/core/constants.js', 'js/core/world.js', 'js/core/tiles.js', // constantes + mundo + legend/parser (Fase B)
  'assets/levels/clarity.map.txt', // nível em texto-glifo (Fase 1.2) — offline
  'js/platform/storage.js', 'js/core/state.js', 'js/core/loop.js', // persistência + estado + loop (Fase 2)
  'js/input/keyboard.js', 'js/platform/audio-mixer.js', 'js/ui/fonts.js', // teclado + mixer + fontes (Fase 2)
  'js/render/viz-modes.js', 'js/input/devices.js', 'js/platform/audio.js', 'js/platform/speech.js', // viz + devices + áudio + fala (Fase 2)
  'js/render/sprites.js', // texturas do personagem (Fase 2.17)
  'manifest.webmanifest', 'icon.svg', 'vendor/pixi.min.js',
  // tipografia: fonts.css + Atkinson padrão (Andika/Lexend cacheiam sob demanda como os sprites)
  'vendor/fonts.css', 'vendor/fonts/atkinson-400.woff2', 'vendor/fonts/atkinson-700.woff2',
];
self.addEventListener('install', (e) => {
  // fetch com cache:'reload' ignora o cache HTTP do navegador → o SW NUNCA assa arquivos velhos
  // (era a causa do "mistura velha+nova quebra tudo" a cada alteração)
  e.waitUntil(caches.open(CACHE).then((c) =>
    Promise.all(SHELL.map((u) =>
      fetch(u, { cache: 'reload' }).then((r) => { if (r && (r.ok || r.type === 'opaque')) return c.put(u, r); }).catch(() => {})
    ))
  ).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) =>
    Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // só gerencia o próprio app-shell; cross-origin (ex.: VLibras) passa direto ao navegador
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  // App-shell (navegação + html/css/js) = NETWORK-FIRST: online sempre pega a versão nova e reescreve
  // o cache; offline cai no cache. Evita o quirk de "CSS/JS velho preso" sem perder o offline (PWA).
  const isShell = e.request.mode === 'navigate' || url.pathname === '/' || /\.(html|css|js)$/i.test(url.pathname);
  if (isShell) {
    // NETWORK-FIRST com cache:'reload' → ignora o cache HTTP do NAVEGADOR (o python http.server não manda
    // Cache-Control, então o Chrome cacheia html/js/css por heurística e o SW servia arquivo VELHO). Assim o
    // José sempre recebe o build novo online; offline cai no cache do SW. (Corrige o "canvas velho preso".)
    e.respondWith(
      fetch(e.request.url, { cache: 'reload' }).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Demais (fontes, ícones, imagens) = CACHE-FIRST (imutáveis; rápido e offline)
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => hit))
  );
});
