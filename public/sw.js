const CACHE_NAME = 'tranmer-ca-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/pwa/icon-192.svg',
  '/icons/pwa/icon-512.svg',
  '/icons/pwa/icon-192-maskable.svg',
  '/icons/pwa/icon-512-maskable.svg',
  '/icons/pwa/icon-192-maskable.png',
  '/icons/pwa/icon-512-maskable.png',
  '/icons/pwa/apple-touch-icon.svg',
  '/icons/pwa/apple-touch-icon.png',
  '/icons/pwa/favicon.ico',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
// Pages are network-first so a deploy (including security fixes) reaches
// returning visitors; the cached copy is only an offline fallback. Static
// icons stay cache-first. Non-GET and cross-origin requests are not touched.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/'))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
