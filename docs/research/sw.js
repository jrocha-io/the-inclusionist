// SPDX-License-Identifier: GPL-3.0-or-later
// Service Worker do sherpa-lab: persiste o MOTOR WASM + os PESOS das vozes via Cache API — o mesmo mecanismo que o jogo
// usará (PWA / vite-plugin-pwa). App shell precacheado; modelos do csukuangfj cacheados em runtime (cache-first).
const CACHE = 'sherpa-lab-v2'; // bump quando o motor muda (pthread → single-thread); o activate limpa os caches antigos
const SHELL = [
  './sherpa-lab.html',
  './sherpa-wasm/tts-single-thread/sherpa-onnx-wasm-main-tts.js',
  './sherpa-wasm/tts-single-thread/sherpa-onnx-wasm-main-tts.wasm',
  './sherpa-wasm/tts-single-thread/sherpa-onnx-wasm-main-tts.data',
  './sherpa-wasm/tts-single-thread/sherpa-onnx-tts.js',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k); // apaga caches de versões anteriores
    await self.clients.claim();
  })());
});

function cacheable(url) {
  return url.includes('/sherpa-wasm/tts') || url.includes('/sherpa-lab.html') || url.includes('huggingface.co/csukuangfj/');
}
self.addEventListener('fetch', (e) => {
  if (!cacheable(e.request.url)) return;               // deixa o resto passar direto
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(e.request, { ignoreVary: true });
    if (hit) return hit;                               // cache-first (pesos grandes → offline após 1º uso)
    const resp = await fetch(e.request);
    if (resp && resp.ok) { try { await c.put(e.request, resp.clone()); } catch (err) { /* opaque/erro: ignora */ } }
    return resp;
  })());
});
self.addEventListener('message', (e) => { if (e.data === 'clear') e.waitUntil(caches.delete(CACHE)); });
