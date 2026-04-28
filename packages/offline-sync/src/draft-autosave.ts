/**
 * Draft autosave for Phase 3 (E22).
 * AC-OFF-01: A coordinator with zero connectivity can draft a broadcast,
 * save it, and send it within 30 seconds of reconnecting.
 *
 * DraftAutosaveManager saves the draft body to broadcastDraftsCache (Dexie v4)
 * every 5 seconds using setInterval. The cleanup function returned by
 * startAutosave() must be called to stop the interval.
 *
 * Browser/PWA only — NOT for Cloudflare Workers runtime.
 */

import { db } from './db.js';

export class DraftAutosaveManager {
  private readonly intervalMs: number;

  constructor(intervalMs = 5_000) {
    this.intervalMs = intervalMs;
  }

  /**
   * Start autosaving a broadcast draft every intervalMs.
   *
   * @param draftId   - Stable client-generated UUID for this draft
   * @param groupId   - The group this broadcast targets
   * @param tenantId  - Tenant scope (T3)
   * @param getBody   - Callback that returns the current draft body text
   * @returns Cleanup function — call to stop the autosave interval
   */
  startAutosave(
    draftId: string,
    groupId: string,
    tenantId: string,
    getBody: () => string,
  ): () => void {
    const save = async (): Promise<void> => {
      const body = getBody();
      if (!body.trim()) return; // Do not save empty drafts

      await db.broadcastDraftsCache.put({
        draftId,
        groupId,
        tenantId,
        body,
        savedAt: Date.now(),
      });
    };

    // Save immediately on start, then every intervalMs
    void save();
    const intervalId = setInterval(() => void save(), this.intervalMs);

    return () => clearInterval(intervalId);
  }

  /**
   * Restore a previously autosaved draft body from IndexedDB.
   * Returns null if no draft exists for this draftId.
   */
  async restoreDraft(draftId: string): Promise<string | null> {
    const row = await db.broadcastDraftsCache
      .where('draftId')
      .equals(draftId)
      .first();
    return row?.body ?? null;
  }

  /**
   * Clear a draft from IndexedDB (e.g. after sending or discarding).
   */
  async clearDraft(draftId: string): Promise<void> {
    await db.broadcastDraftsCache
      .where('draftId')
      .equals(draftId)
      .delete();
  }
}

export const draftAutosaveManager = new DraftAutosaveManager();
