const CACHE = 'webwaka-admin-dashboard-v2';
const SHELL = ['/', '/manifest.json', '/offline.html'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;

  var isNavigation = e.request.mode === 'navigate';

  e.respondWith(
    fetch(e.request).then(function(response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
      }
      return response;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        if (isNavigation) return caches.match('/offline.html');
        return cached;
      });
    })
  );
});
