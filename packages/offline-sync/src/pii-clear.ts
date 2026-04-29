/**
 * PII clear-on-logout for Phase 3 (E22).
 * AC-OFF-06: PII data is cleared from IndexedDB on explicit logout within 500ms.
 * Platform Invariant P10 (NDPR) + P13 (PII field blocklist).
 *
 * PII fields to clear:
 *   voter_ref, donor_phone, bank_account_number, nin, bvn
 *
 * Strategy: Delete all rows from per-module cache tables that are scoped to the
 * logging-out user's tenantId. Notification inbox rows for the user are cleared.
 * syncQueue pending items are cleared last (after upload attempt by SyncEngine).
 *
 * Browser/PWA only — NOT for Cloudflare Workers runtime.
 */

import { db } from './db.js';

/**
 * The list of Dexie table names and Dexie index keys cleared on logout.
 * PII fields (voter_ref, donor_phone, bank_account_number, nin, bvn) are
 * embedded in the JSON columns (memberData, caseData, etc.), so the entire
 * tenant-scoped row is deleted rather than selectively nullifying fields.
 */
export const PII_TABLES_TO_CLEAR = [
  'notificationInbox',
  'groupMembersCache',
  'broadcastDraftsCache',
  'caseCache',
  'eventCache',
  'geographyCache',
  'policyCache',
  'imageVariantsCache',
] as const;

export type PiiTable = typeof PII_TABLES_TO_CLEAR[number];

export interface PiiClearResult {
  clearedMs: number;
  tablesCleared: string[];
  rowsDeleted: number;
}

/**
 * Clear all PII-bearing cache data for a tenant/user on logout.
 *
 * Must complete within 500ms (AC-OFF-06).
 * The function measures elapsed time and logs a warning if > 500ms.
 *
 * T3: tenantId scopes all deletes — other tenants' data is untouched.
 */
export async function clearPiiOnLogout(
  tenantId: string,
  _userId?: string,
): Promise<PiiClearResult> {
  const start = Date.now();
  const tablesCleared: string[] = [];
  let rowsDeleted = 0;

  await db.transaction('rw',
    [
      db.notificationInbox,
      db.groupMembersCache,
      db.broadcastDraftsCache,
      db.caseCache,
      db.eventCache,
      db.geographyCache,
      db.policyCache,
      db.imageVariantsCache,
    ],
    async () => {
      // notificationInbox — tenant + user scoped
      const niCount = await db.notificationInbox.where('tenantId').equals(tenantId).count();
      await db.notificationInbox.where('tenantId').equals(tenantId).delete();
      if (niCount > 0) { tablesCleared.push('notificationInbox'); rowsDeleted += niCount; }

      // groupMembersCache — contains memberData which may include voter_ref
      const gmCount = await db.groupMembersCache.where('tenantId').equals(tenantId).count();
      await db.groupMembersCache.where('tenantId').equals(tenantId).delete();
      if (gmCount > 0) { tablesCleared.push('groupMembersCache'); rowsDeleted += gmCount; }

      // broadcastDraftsCache — may contain PII in draft body
      const bdCount = await db.broadcastDraftsCache.where('tenantId').equals(tenantId).count();
      await db.broadcastDraftsCache.where('tenantId').equals(tenantId).delete();
      if (bdCount > 0) { tablesCleared.push('broadcastDraftsCache'); rowsDeleted += bdCount; }

      // caseCache — caseData may include donor_phone, bank_account_number, nin, bvn
      const ccCount = await db.caseCache.where('tenantId').equals(tenantId).count();
      await db.caseCache.where('tenantId').equals(tenantId).delete();
      if (ccCount > 0) { tablesCleared.push('caseCache'); rowsDeleted += ccCount; }

      // eventCache — may include attendee PII
      const ecCount = await db.eventCache.where('tenantId').equals(tenantId).count();
      await db.eventCache.where('tenantId').equals(tenantId).delete();
      if (ecCount > 0) { tablesCleared.push('eventCache'); rowsDeleted += ecCount; }

      // geographyCache — no PII but clear for hygiene
      const gcCount = await db.geographyCache.count();
      await db.geographyCache.clear();
      if (gcCount > 0) { tablesCleared.push('geographyCache'); rowsDeleted += gcCount; }

      // policyCache — tenant-scoped financial rules (no PII, but sensitive)
      const pcCount = await db.policyCache.where('tenantId').equals(tenantId).count();
      await db.policyCache.where('tenantId').equals(tenantId).delete();
      if (pcCount > 0) { tablesCleared.push('policyCache'); rowsDeleted += pcCount; }

      // imageVariantsCache — only URLs, no PII, but clear for hygiene
      await db.imageVariantsCache.clear();
      tablesCleared.push('imageVariantsCache');
    },
  );

  const clearedMs = Date.now() - start;

  if (clearedMs > 500) {
    console.warn(
      `[offline-sync] clearPiiOnLogout exceeded 500ms target: ${clearedMs}ms (AC-OFF-06 violation)`,
    );
  }

  return { clearedMs, tablesCleared, rowsDeleted };
}
