/**
 * Client-side image variant URL cache for Phase 3 (E23).
 * Caches image variant URLs (thumbnail/card/full) in IndexedDB (Dexie v4)
 * to prevent repeated network calls for the same entity's image variants.
 *
 * Browser/PWA only — NOT for Cloudflare Workers runtime.
 */

import { db } from './db.js';

export interface ImageVariants {
  thumbnailUrl: string;  // 100px × 100px (< 100KB, M13 gate)
  cardUrl: string;       // 400px wide
  fullUrl: string;       // 1200px wide
  originalUrl: string;
}

function makeCacheKey(entityType: string, entityId: string): string {
  return `${entityType}:${entityId}`;
}

export class ImageVariantCache {
  /**
   * Store variant URLs in IndexedDB.
   * Uses put() so subsequent calls for the same entity update the cached URLs.
   */
  async cacheVariants(entityType: string, entityId: string, variants: ImageVariants): Promise<void> {
    const cacheKey = makeCacheKey(entityType, entityId);
    await db.imageVariantsCache.put({
      cacheKey,
      entityType,
      entityId,
      thumbnailUrl: variants.thumbnailUrl,
      cardUrl: variants.cardUrl,
      fullUrl: variants.fullUrl,
      originalUrl: variants.originalUrl,
      cachedAt: Date.now(),
    });
  }

  /**
   * Retrieve variant URLs from IndexedDB.
   * Returns null if the entity has not been cached.
   */
  async getVariants(entityType: string, entityId: string): Promise<ImageVariants | null> {
    const cacheKey = makeCacheKey(entityType, entityId);
    const row = await db.imageVariantsCache
      .where('cacheKey')
      .equals(cacheKey)
      .first();

    if (!row) return null;

    return {
      thumbnailUrl: row.thumbnailUrl,
      cardUrl: row.cardUrl,
      fullUrl: row.fullUrl,
      originalUrl: row.originalUrl,
    };
  }

  /**
   * Clear all cached image variant URLs.
   * Called on logout (AC-OFF-06 — clearPiiOnLogout handles this via pii-clear.ts).
   */
  async clearCache(): Promise<void> {
    await db.imageVariantsCache.clear();
  }
}

export const imageVariantCache = new ImageVariantCache();
