const CACHE = 'webwaka-admin-v2';
const SHELL = ['/', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('sync', (e) => {
  if (e.tag === 'webwaka-sync') {
    e.waitUntil(processSyncQueue());
  }
  if (e.tag === 'webwaka-community-posts') {
    e.waitUntil(processSyncQueue('community_post'));
  }
});

async function processSyncQueue(filterType) {
  try {
    const db = await openSyncDB();
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    const items = await getAllFromStore(store);

    const pending = items
      .filter((item) => item.status === 'pending' || item.status === 'failed')
      .filter((item) => !filterType || item.operationType === filterType)
      .sort((a, b) => a.createdAt - b.createdAt);

    for (const item of pending) {
      try {
        const resp = await fetch('/api/sync/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (resp.ok || resp.status === 409) {
          await updateItemStatus(db, item.id, 'synced');
        } else {
          await updateItemStatus(db, item.id, 'failed');
        }
      } catch {
        await updateItemStatus(db, item.id, 'failed');
      }
    }
  } catch {
    // IndexedDB not available in this context
  }
}

function openSyncDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('WebWakaOfflineDB', 2);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function updateItemStatus(db, id, status) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.status = status;
        item.lastAttemptAt = Date.now();
        store.put(item);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
