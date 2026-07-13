const CACHE_VERSION = 'buki-rush-v5';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const BASE_PATH = '/buki-rush/';

const APP_SHELL = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}favicon.svg`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`,
  `${BASE_PATH}assets/generated/title-ichigo.png`,
  `${BASE_PATH}assets/generated/super-ichigo-background.png`,
  `${BASE_PATH}assets/generated/slot/strawberry-slot-panel.png`,
  `${BASE_PATH}assets/generated/slot/strawberry-slot-symbol.png`,
  `${BASE_PATH}assets/generated/slot/cream-slot-symbol.png`,
  `${BASE_PATH}assets/generated/slot/seed-slot-symbol.png`,
  `${BASE_PATH}assets/generated/slot/bell-slot-symbol.png`,
  `${BASE_PATH}assets/generated/slot/fireworks-slot-symbol.png`,
  `${BASE_PATH}assets/generated/slot/fan-slot-symbol.png`,
  `${BASE_PATH}assets/generated/slot/crown-slot-symbol.png`,
  `${BASE_PATH}assets/generated/slot/seven-slot-symbol.png`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE_PATH)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put(`${BASE_PATH}index.html`, copy));
          return response;
        })
        .catch(() => caches.match(`${BASE_PATH}index.html`).then((response) => response || caches.match(BASE_PATH)))
    );
    return;
  }

  const isStaticAsset = /\.(?:js|css|png|svg|webp|jpg|jpeg|json|webmanifest)$/i.test(url.pathname);
  if (!isStaticAsset) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
