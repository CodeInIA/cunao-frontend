/* Basic service worker for Cuñadismo Ilustrado */
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `cunao-static-${CACHE_VERSION}`;

// Rutas críticas que queremos cachear de inicio
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/logo-sin-letras.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith('cunao-static-') && k !== STATIC_CACHE)
          .map(k => caches.delete(k))
    ))
  );
});

// Network first for HTML navigation requests, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Navigations (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/')))
    );
    return;
  }

  // Static assets strategy: Cache First con actualización en background
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, copy));
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
