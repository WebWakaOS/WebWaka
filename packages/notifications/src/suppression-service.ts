/**
 * @webwaka/notifications — Suppression service (N-029, Phase 2).
 *
 * Hard-suppression check against notification_suppression_list.
 * Checked before EVERY external channel dispatch (G20).
 *
 * Hard suppression sources:
 *   - Bounced addresses (provider bounce webhook)
 *   - User unsubscribe requests
 *   - Complaint reports (spam reports)
 *   - Admin manual blocks
 *
 * Suppressed addresses NEVER receive notifications regardless of user preference
 * (distinct from soft unsubscribe in notification_subscription table).
 *
 * Address privacy (G23 NDPR):
 *   - Raw address is NEVER stored in D1
 *   - address_hash = SHA-256(lower(address) + ':' + tenantId + ':' + channel)
 *   - Lookup uses the same hash; address is hashed in memory only
 *
 * Lookup strategy (G1):
 *   - Check tenant-specific suppression (tenant_id = tenantId)
 *   - Also check platform-wide suppression (tenant_id IS NULL)
 *   - Either match → address is suppressed
 *
 * Guardrails enforced:
 *   G1  — tenant_id scoped queries; platform-wide checked separately
 *   G20 — callers must invoke checkSuppression before every external dispatch
 *   G23 — address_hash stored; raw address never touches D1
 */

import type { D1LikeFull } from './db-types.js';
import type { NotificationChannel, SuppressionCheckResult } from './types.js';
import { computeSuppressionHash } from './crypto-utils.js';

// ---------------------------------------------------------------------------
// Suppression channel types (per migration CHECK constraint)
// NOTE: push/whatsapp/telegram are NOT in the channel CHECK list for suppression.
// Only 'email' | 'sms' | 'whatsapp' | 'push' are in suppression_list.
// in_app, telegram, slack, webhook are NOT suppressed via this table.
// ---------------------------------------------------------------------------

type SuppressionChannel = 'email' | 'sms' | 'whatsapp' | 'push';

const SUPPRESSION_CHANNELS = new Set<string>(['email', 'sms', 'whatsapp', 'push']);

// ---------------------------------------------------------------------------
// checkSuppression (G20)
// ---------------------------------------------------------------------------

/**
 * Check if an address is suppressed for a given channel.
 *
 * Returns { suppressed: false } for channels not in suppression_list
 * (in_app, telegram, slack, webhook are never suppressed via this table).
 *
 * G1: checks tenant-specific AND platform-wide suppressions.
 * G23: address is hashed in memory; raw value never written to D1.
 * G20: this must be called before every external channel dispatch.
 *
 * @param db       - D1LikeFull database binding
 * @param address  - The raw delivery address (email, phone number, etc.)
 * @param tenantId - Tenant context (G1: checked for both tenant + platform rows)
 * @param channel  - The notification channel
 * @returns        - SuppressionCheckResult with suppressed flag and reason
 */
export async function checkSuppression(
  db: D1LikeFull,
  address: string,
  tenantId: string,
  channel: NotificationChannel,
): Promise<SuppressionCheckResult> {
  // in_app/telegram/slack/webhook are not suppression-list channels
  if (!SUPPRESSION_CHANNELS.has(channel)) {
    return { suppressed: false };
  }

  const suppChannel = channel as SuppressionChannel;

  // Hash the address (G23: raw address never goes to D1)
  const tenantHash = await computeSuppressionHash(address, tenantId, suppChannel);
  const platformHash = await computeSuppressionHash(address, 'platform', suppChannel);

  // Check both tenant-specific and platform-wide in one query
  // Uses the UNIQUE index: idx_notif_suppress_unique (tenant_id, channel, address_hash)
  const row = await db
    .prepare(
      `SELECT reason FROM notification_suppression_list
       WHERE channel = ?
         AND (
           (tenant_id = ? AND address_hash = ?)
           OR
           (tenant_id IS NULL AND address_hash = ?)
         )
         AND (expires_at IS NULL OR expires_at > unixepoch())
       LIMIT 1`,
    )
    .bind(suppChannel, tenantId, tenantHash, platformHash)
    .first<{ reason: string }>();

  if (!row) {
    return { suppressed: false };
  }

  return {
    suppressed: true,
    reason: row.reason as 'bounced' | 'unsubscribed' | 'complaint' | 'admin_block',
  };
}

// ---------------------------------------------------------------------------
// addSuppression
// ---------------------------------------------------------------------------

export interface AddSuppressionParams {
  tenantId: string | null;          // null = platform-wide suppression
  channel: SuppressionChannel;
  address: string;                  // raw address — hashed before storage (G23)
  reason: 'bounced' | 'unsubscribed' | 'complaint' | 'admin_block';
  provider?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: number;               // unix epoch; null = permanent
}

/**
 * Record a hard suppression for an address.
 *
 * G23: address_hash stored; raw address never written to D1.
 * INSERT OR IGNORE: safe to call multiple times for same address.
 *
 * @param db     - D1LikeFull database binding
 * @param params - Suppression details
 */
export async function addSuppression(
  db: D1LikeFull,
  params: AddSuppressionParams,
): Promise<void> {
  const suppressId = `suppress_${crypto.randomUUID().replace(/-/g, '')}`;
  const effectiveTenantId = params.tenantId ?? 'platform';

  const hash = await computeSuppressionHash(
    params.address,
    effectiveTenantId,
    params.channel,
  );

  const metadataJson = params.metadata != null
    ? JSON.stringify(params.metadata)
    : null;

  await db
    .prepare(
      `INSERT OR IGNORE INTO notification_suppression_list (
        id, tenant_id, channel, address_hash,
        reason, provider, metadata, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      suppressId,
      params.tenantId,     // stored as NULL for platform-wide rows
      params.channel,
      hash,                // G23: hashed
      params.reason,
      params.provider ?? null,
      metadataJson,
      params.expiresAt ?? null,
    )
    .run();
}
