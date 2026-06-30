// SPDX-License-Identifier: GPL-3.0-or-later
// Service worker — cache do app-shell para rodar 100% offline (PWA).
const CACHE = 'inclusionist-v4.0.0-101'; // bump invalida cache antigo (dev gotcha)
const SHELL = [
  './', 'index.html', 'game.js', 'style.css',
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
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => hit))
  );
});
