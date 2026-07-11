// Self-destructing service worker.
// This project has no service worker, but browsers that previously ran another
// app on the same origin (e.g. another dev project on localhost:3000) may still
// have one registered — intercepting requests and serving stale JS from its
// cache. When such a browser checks /sw.js for updates it receives this script,
// which wipes all caches, unregisters itself and reloads the open tabs.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(client => client.navigate(client.url)))
  );
});
