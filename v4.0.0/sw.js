// SPDX-License-Identifier: GPL-3.0-or-later
// Service worker — cache do app-shell para rodar 100% offline (PWA).
const CACHE = 'inclusionist-v4.129.0'; // = versão do jogo (bump A CADA commit invalida o cache antigo)
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
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  // App-shell (navegação + html/css/js) = NETWORK-FIRST: online sempre pega a versão nova e reescreve
  // o cache; offline cai no cache. Evita o quirk de "CSS/JS velho preso" sem perder o offline (PWA).
  const isShell = e.request.mode === 'navigate' || url.pathname === '/' || /\.(html|css|js)$/i.test(url.pathname);
  if (isShell) {
    e.respondWith(
      fetch(e.request).then((res) => {
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
