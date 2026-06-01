// SPDX-License-Identifier: GPL-3.0-or-later
// Service worker — cache do app-shell para rodar 100% offline (PWA).
const CACHE = 'inclusionist-v4.0.0-23'; // bump invalida cache antigo (dev gotcha)
const SHELL = [
  './', 'index.html', 'game.js', 'style.css',
  'manifest.webmanifest', 'icon.svg', 'vendor/pixi.min.js',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
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
