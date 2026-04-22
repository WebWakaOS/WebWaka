/**
 * Service Worker registration + Background Sync integration.
 * (TDR-0010, Platform Invariant P6)
 *
 * Browser/PWA only — NOT for Cloudflare Workers runtime.
 * The actual sw.js lives at public/sw.js (not a TS module).
 *
 * M7c additions:
 *   - Runtime caching for GET /community/lessons/:id (P6 — offline course access)
 *   - Background Sync for POST /community/channels/:id/posts (offline forum posts)
 */

const CACHE_NAME = 'webwaka-runtime-v2';
const COMMUNITY_POST_SYNC_TAG = 'webwaka-community-posts';

/**
 * Register the WebWaka service worker and subscribe to background sync.
 * Call once on app startup (e.g. in main.ts).
 */
export function registerSyncServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('/sw.js').then(async (registration) => {
    // Main sync queue (agent transactions + general queue, M7b)
    if ('sync' in registration) {
      await (registration as { sync: { register(tag: string): Promise<void> } }).sync.register('webwaka-sync');
    }

    // M7c: Community post sync (offline forum posts queued in Dexie, P6/P11)
    if ('sync' in registration) {
      await (registration as { sync: { register(tag: string): Promise<void> } }).sync.register(COMMUNITY_POST_SYNC_TAG);
    }
  }).catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.warn('[offline-sync] Service Worker registration failed:', err);
  });
}

/**
 * Export cache name and sync tags for use in public/sw.js.
 *
 * public/sw.js content (not TypeScript — place manually in public/ folder):
 *
 * const LESSON_CACHE = 'webwaka-runtime-v2';
 *
 * // Cache-first strategy for lesson content (P6 — readable offline)
 * self.addEventListener('fetch', (event) => {
 *   const url = new URL(event.request.url);
 *   if (/\/community\/lessons\//.test(url.pathname) && event.request.method === 'GET') {
 *     event.respondWith(
 *       caches.open(LESSON_CACHE).then(async (cache) => {
 *         const cached = await cache.match(event.request);
 *         if (cached) return cached;
 *         const response = await fetch(event.request);
 *         if (response.ok) cache.put(event.request, response.clone());
 *         return response;
 *       })
 *     );
 *   }
 * });
 *
 * // Background Sync for main queue + community posts (P6/P11)
 * self.addEventListener('sync', (event) => {
 *   if (event.tag === 'webwaka-sync') {
 *     event.waitUntil(syncEngine.processPendingQueue());
 *   }
 *   if (event.tag === 'webwaka-community-posts') {
 *     event.waitUntil(syncEngine.processPendingQueue('community_post'));
 *   }
 * });
 */
export const SW_CACHE_NAME = CACHE_NAME;
export const SW_COMMUNITY_POST_SYNC_TAG = COMMUNITY_POST_SYNC_TAG;
