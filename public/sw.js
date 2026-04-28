/* Service Worker — Calculateur de Marge
   Stratégie :
     - Pré-cache à l'install : index.html (coquille SPA), calculateur.html
       (cœur métier monolithique), favicons, manifest.
     - Runtime : cache-first pour les assets hashés (assets/*.js et *.css
       générés par Vite — leurs noms sont uniques par version donc pas de
       souci d'invalidation), network-first pour la navigation.
     - Mise à jour : nouveau CACHE_VERSION → suppression des anciens caches
       et activation immédiate (skipWaiting + clients.claim).
*/
const CACHE_VERSION = 'cm-v2-2026-04-28';
const STATIC_CACHE  = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// Liste des fichiers critiques pour fonctionner offline.
// Les bundles JS/CSS de Vite (hashés) sont cachés à la volée par le runtime.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/calculateur.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon-192.png',
  '/favicon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // On ne s'occupe pas des autres origines (Google Fonts, CDN xlsx, etc.)
  // Le navigateur les chargera normalement quand il y a du réseau, sinon
  // ils auront éventuellement été cachés par le navigateur lui-même.
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigation HTML : network-first, fallback cache, fallback /index.html
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
          return resp;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || caches.match('/index.html');
        })
    );
    return;
  }

  // Assets statiques : cache-first, mise en cache à la volée si manquant
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (resp && resp.status === 200 && resp.type !== 'opaque') {
          const copy = resp.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
