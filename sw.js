const CACHE = 'evaluations-ps-shell-v75';
const ROOT = new URL('./', self.location.href);
const SHELL = ['index.html','mobile.html','manifest.webmanifest','icon-192.png','icon-512.png'];
const paths = new Set(SHELL.map(p => new URL(p, ROOT).pathname));
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('evaluations-ps-shell-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin) return;
  if (url.pathname !== ROOT.pathname && !paths.has(url.pathname)) return;
  const key = new URL(url.pathname === ROOT.pathname ? 'index.html' : url.pathname, ROOT).href;
  event.respondWith((async () => {
    try {
      const response = await fetch(request, {cache:'no-store'});
      if (response.ok && response.type === 'basic') {
        try { const cache = await caches.open(CACHE); await cache.put(key, response.clone()); } catch (_) {}
      }
      return response;
    } catch (_) {
      const cached = await caches.match(key, {cacheName:CACHE});
      return cached || new Response('Connexion indisponible. Réessayez lorsque vous êtes connecté.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
