/**
 * Service Worker registration + Background Sync integration.
 * (TDR-0010, Platform Invariant P6)
 *
 * Browser/PWA only — NOT for Cloudflare Workers runtime.
 * The actual sw.js lives at public/sw.js (not a TS module).
 *
 * Phase 3 (E20) additions:
 *   Per-module background sync tags for groups, cases, notifications, geography.
 *   Each module syncs independently so a slow groups sync does not block cases sync.
 */

const CACHE_NAME = 'webwaka-runtime-v2';
const COMMUNITY_POST_SYNC_TAG = 'webwaka-community-posts';

// Phase 3 (E20) — per-module sync tags
const GROUPS_SYNC_TAG        = 'webwaka-groups-sync';
const CASES_SYNC_TAG         = 'webwaka-cases-sync';
const NOTIFICATIONS_SYNC_TAG = 'webwaka-notifications-sync';
const GEOGRAPHY_SYNC_TAG     = 'webwaka-geography-sync';

type SyncRegistration = { sync: { register(tag: string): Promise<void> } };

async function registerSyncTag(registration: ServiceWorkerRegistration, tag: string): Promise<void> {
  if ('sync' in registration) {
    await (registration as unknown as SyncRegistration).sync.register(tag);
  }
}

/**
 * Register the WebWaka service worker and subscribe to all background sync tags.
 * Call once on app startup (e.g. in main.ts).
 *
 * Tags registered:
 *   webwaka-sync              — main queue (agent transactions + general)
 *   webwaka-community-posts   — offline forum posts (M7c)
 *   webwaka-groups-sync       — groups module delta sync (E20)
 *   webwaka-cases-sync        — cases module delta sync (E20)
 *   webwaka-notifications-sync — notifications module delta sync (E20)
 *   webwaka-geography-sync    — geography module delta sync (E20; long TTL, infrequent)
 */
export function registerSyncServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('/sw.js').then(async (registration) => {
    await registerSyncTag(registration, 'webwaka-sync');
    await registerSyncTag(registration, COMMUNITY_POST_SYNC_TAG);
    // Phase 3 (E20) per-module sync tags
    await registerSyncTag(registration, GROUPS_SYNC_TAG);
    await registerSyncTag(registration, CASES_SYNC_TAG);
    await registerSyncTag(registration, NOTIFICATIONS_SYNC_TAG);
    await registerSyncTag(registration, GEOGRAPHY_SYNC_TAG);
  }).catch((err: unknown) => {
    console.warn('[offline-sync] Service Worker registration failed:', err);
  });
}

/**
 * Export cache name and sync tags for use in public/sw.js and tests.
 *
 * public/sw.js Background Sync handler (not TypeScript — place manually):
 *
 * self.addEventListener('sync', (event) => {
 *   switch (event.tag) {
 *     case 'webwaka-sync':
 *       event.waitUntil(syncEngine.processPendingQueue()); break;
 *     case 'webwaka-community-posts':
 *       event.waitUntil(syncEngine.processPendingQueue('community_post')); break;
 *     case 'webwaka-groups-sync':
 *       event.waitUntil(syncEngine.syncModule('groups')); break;
 *     case 'webwaka-cases-sync':
 *       event.waitUntil(syncEngine.syncModule('cases')); break;
 *     case 'webwaka-notifications-sync':
 *       event.waitUntil(syncEngine.syncModule('notifications')); break;
 *     case 'webwaka-geography-sync':
 *       event.waitUntil(syncEngine.syncModule('geography')); break;
 *   }
 * });
 */
export const SW_CACHE_NAME = CACHE_NAME;
export const SW_COMMUNITY_POST_SYNC_TAG = COMMUNITY_POST_SYNC_TAG;
export const SW_GROUPS_SYNC_TAG         = GROUPS_SYNC_TAG;
export const SW_CASES_SYNC_TAG          = CASES_SYNC_TAG;
export const SW_NOTIFICATIONS_SYNC_TAG  = NOTIFICATIONS_SYNC_TAG;
export const SW_GEOGRAPHY_SYNC_TAG      = GEOGRAPHY_SYNC_TAG;

/** All per-module sync tags, ordered by expected sync frequency (most → least frequent) */
export const SW_MODULE_SYNC_TAGS = [
  GROUPS_SYNC_TAG,
  CASES_SYNC_TAG,
  NOTIFICATIONS_SYNC_TAG,
  GEOGRAPHY_SYNC_TAG,
] as const;
