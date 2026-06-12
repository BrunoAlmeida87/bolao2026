// Detecta o caminho base automaticamente (funciona em /bolao2026/ e em /)
const BASE = self.location.href.replace(/sw\.js(\?.*)?$/, '');

const CACHE = 'bolao-icn-v1.12.24';
const PRECACHE = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Ignora requisições externas (Firebase, CDN)
  if (url.origin !== location.origin) return;

  if (request.mode === 'navigate') {
    // HTML: tenta rede primeiro, cai no cache se offline
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(BASE + 'index.html'))
    );
    return;
  }

  // Outros assets (ícones, manifest): cache primeiro
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(request, clone));
      return res;
    }))
  );
});
