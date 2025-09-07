/* Enhanced service worker for Cuñadismo Ilustrado PWA */
const CACHE_VERSION = 'v3'; // Incrementado para nuevas optimizaciones
let IS_FIRST_INSTALL = false; // Flag para evitar notificación en primera instalación
const STATIC_CACHE = `cunao-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `cunao-runtime-${CACHE_VERSION}`;
const API_CACHE = `cunao-api-${CACHE_VERSION}`;
const IMAGES_CACHE = `cunao-images-${CACHE_VERSION}`; // Cache específico para imágenes

// Rutas críticas que queremos cachear de inicio
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/logo-sin-letras.webp',
  '/manifest.webmanifest'
];

// Páginas para fallback offline
const OFFLINE_FALLBACK_PAGES = [
  '/productos',
  '/sobre-nosotros',
  '/contacto'
];

self.addEventListener('install', (event) => {
  // Si no existe un service worker activo previo, es primera instalación
  if (!self.registration.active) {
    IS_FIRST_INSTALL = true;
  }
  console.log('[SW] Installing version', CACHE_VERSION, 'firstInstall:', IS_FIRST_INSTALL);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => {
        console.log('[SW] Precached assets');
        // Forzar activación inmediata
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      caches.keys().then(keys => Promise.all(
        keys.filter(k => 
          (k.startsWith('cunao-static-') && k !== STATIC_CACHE) ||
          (k.startsWith('cunao-runtime-') && k !== RUNTIME_CACHE) ||
          (k.startsWith('cunao-api-') && k !== API_CACHE)
        ).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )),
      // Tomar control inmediato
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activated and ready. firstInstall:', IS_FIRST_INSTALL);
      
      // Precargar imágenes críticas en primera instalación
      if (IS_FIRST_INSTALL) {
        preloadCriticalImages();
      }
      
      if (!IS_FIRST_INSTALL) {
        // Notificar a clientes sobre nueva versión SOLO en actualización
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
          });
        });
      }
    })
  );
});

// Estrategias de cache avanzadas
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') return;

  // API calls - Stale While Revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE, 300000)); // 5 min TTL
    return;
  }

  // Navegaciones HTML - Network First con fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(request, copy));
          return response;
        })
        .catch(() => 
          caches.match(request)
            .then(cached => cached || caches.match('/'))
            .then(fallback => fallback || createOfflinePage())
        )
    );
    return;
  }

  // Assets estáticos - Cache First con update en background
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Imágenes de productos de Cloudinary - Cache agresivo para productos
  if (request.destination === 'image' && 
      (url.hostname.includes('cloudinary.com') || url.origin !== location.origin)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE)
        .then(cache => cache.match(request))
        .then(cached => {
          if (cached) {
            console.log('[SW] Imagen servida desde cache:', url.pathname);
            return cached;
          }
          
          console.log('[SW] Descargando y cacheando imagen:', url.pathname);
          return fetch(request)
            .then(response => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              console.warn('[SW] Error descargando imagen:', url.pathname);
              return new Response('', { status: 404 });
            });
        })
    );
    return;
  }
});

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request, cacheName, maxAge = 300000) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  // Si hay cache y no está expirado, devolver inmediatamente
  if (cached) {
    const cachedDate = new Date(cached.headers.get('date') || 0);
    const isExpired = Date.now() - cachedDate.getTime() > maxAge;
    
    if (!isExpired) {
      fetchPromise.catch(() => {}); // Update en background
      return cached;
    }
  }
  
  return fetchPromise.then(response => response || cached);
}

// Estrategia Cache First
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached && (!maxAge || !isExpired(cached, maxAge))) {
    // Update en background si es necesario
    fetch(request).then(response => {
      if (response.ok) cache.put(request, response.clone());
    }).catch(() => {});
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || createOfflineResponse();
  }
}

// Utilities
function isStaticAsset(request) {
  return request.destination === 'script' || 
         request.destination === 'style' || 
         request.destination === 'font' ||
         /\.(js|css|woff2?|ttf|eot)$/i.test(request.url);
}

function isExpired(response, maxAge) {
  const date = new Date(response.headers.get('date') || 0);
  return Date.now() - date.getTime() > maxAge;
}

function createOfflinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sin conexión - Cuñadismo Ilustrado</title>
      <style>
        body { font-family: system-ui; background: #0f172a; color: #fff; text-align: center; padding: 2rem; }
        .logo { max-width: 200px; margin: 2rem auto; }
        .cuñao { color: #fbbf24; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="logo">🇪🇸</div>
      <h1>Sin conexión</h1>
      <p>No hay conexión a internet, pero tranquilo <span class="cuñao">cuñao</span>.</p>
      <p>En cuanto vuelva la conexión podrás seguir viendo camisetas.</p>
      <button onclick="location.reload()">Reintentar</button>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

function createOfflineResponse() {
  return new Response('Offline', { 
    status: 503, 
    statusText: 'Service Unavailable' 
  });
}

// Función para precargar imágenes críticas en primera visita
async function preloadCriticalImages() {
  console.log('[SW] Starting critical image preload for first-time visitor');
  
  try {
    // URLs de imágenes críticas (logo, héroe, destacados)
    const criticalImages = [
      // Logo
      '/logo-sin-letras.webp',
      // Imágenes más comunes en Cloudinary (ejemplos típicos)
      'https://res.cloudinary.com/dt2t5twyx/image/upload/v1/products/polo-fitness-crossfit-culturismo-hombre-mujer-7_uxuytm.webp',
      'https://res.cloudinary.com/dt2t5twyx/image/upload/v1/products/polo-cerveza-rubia-preferida-cuñaos-hombre-mujer-7_qzfwad.webp',
      'https://res.cloudinary.com/dt2t5twyx/image/upload/v1/products/polo-cubana-hombre-mujer-7_a0jpzq.webp'
    ];
    
    const cache = await caches.open(IMAGES_CACHE);
    
    // Precargar en paralelo con timeout
    const preloadPromises = criticalImages.map(async (url) => {
      try {
        const response = await fetch(url, {
          mode: 'no-cors',
          credentials: 'omit'
        });
        if (response.ok || response.type === 'opaque') {
          await cache.put(url, response.clone());
          console.log('[SW] Preloaded:', url);
        }
      } catch (error) {
        console.log('[SW] Failed to preload:', url, error);
      }
    });
    
    // Esperar máximo 5 segundos por la precarga
    await Promise.race([
      Promise.all(preloadPromises),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]);
    
    console.log('[SW] Critical image preload completed');
  } catch (error) {
    console.error('[SW] Critical image preload failed:', error);
  }
}
