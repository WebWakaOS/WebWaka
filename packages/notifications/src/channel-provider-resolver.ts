/**
 * @webwaka/notifications — Channel provider resolver (N-053, Phase 4).
 *
 * Resolves the effective channel_provider configuration for a given
 * tenant + channel. Implements the two-tier lookup:
 *   1. Tenant-specific row (tenant_id = ?, is_active = 1, channel = ?)
 *   2. Platform default    (is_platform_default = 1, is_active = 1, channel = ?)
 *
 * Used by all Phase 4 channel implementations to determine:
 *   - Which API credentials to use (via credentials_kv_key → ADL-002 KV)
 *   - Whether the tenant has a verified custom sender domain (G3/OQ-004)
 *   - The platform sender fallback flag
 *   - Provider-specific metadata (sender_id, route, phone_number_id, etc.)
 *
 * Guardrails:
 *   G1  — tenantId in every D1 query
 *   G3  (OQ-004) — sender fallback logic
 *   G13 — resolveChannelProvider() is the single source of provider truth
 *   G16 (ADL-002) — credentials_kv_key is what gets loaded; never actual secrets from D1
 */

import type { D1LikeFull } from './db-types.js';
import type { NotificationChannel } from './types.js';

// ---------------------------------------------------------------------------
// ChannelProviderConfig — resolved channel provider configuration
// ---------------------------------------------------------------------------

export interface ChannelProviderConfig {
  /** channel_provider.id */
  id: string;
  /** e.g. 'resend', 'termii', 'meta_whatsapp', 'fcm', 'telegram_bot' */
  providerName: string;
  /** G16 ADL-002: KV key for AES-256-GCM encrypted credentials. Null = use platform env var. */
  credentialsKvKey: string | null;
  /** Email: tenant custom FROM address (e.g. 'hello@tenant.com'). Null = platform default. */
  customFromEmail: string | null;
  /** Email: tenant custom FROM name (e.g. 'Acme Support'). Null = platform default. */
  customFromName: string | null;
  /**
   * Email: true when tenant domain is Resend-verified.
   * G3/OQ-004: if false, fall back to platform FROM; set senderFallbackUsed=true.
   */
  customFromDomainVerified: boolean;
  /**
   * G3/OQ-004: true = always fall back to platform FROM even if domain is verified.
   * Explicitly set by platform admin to force fallback (e.g., during domain migration).
   */
  platformSenderFallback: boolean;
  /** Provider-specific metadata parsed from JSON. Null if not set. */
  metadata: Record<string, unknown> | null;
  /** True = this is the platform default (tenant has no override for this channel). */
  isPlatformDefault: boolean;
  /**
   * Tenant display name from tenants.display_name — used for G3 subject prefix
   * "[{tenantDisplayName}]" when sender fallback is active.
   * Null for platform-default providers or if the tenant record is missing.
   */
  tenantDisplayName: string | null;
}

// ---------------------------------------------------------------------------
// resolveChannelProvider
// ---------------------------------------------------------------------------

/**
 * Resolve the effective channel_provider config for a tenant + channel.
 *
 * Lookup order:
 *   1. Tenant-specific: channel_provider WHERE tenant_id = ? AND channel = ? AND is_active = 1
 *   2. Platform default: channel_provider WHERE is_platform_default = 1 AND channel = ? AND is_active = 1
 *
 * Returns null if neither row exists (channel not configured at all).
 *
 * @param db       - D1 database binding (G1: tenant_id used in query)
 * @param tenantId - Current tenant ID
 * @param channel  - Channel type to look up
 */
export async function resolveChannelProvider(
  db: D1LikeFull,
  tenantId: string,
  channel: NotificationChannel,
): Promise<ChannelProviderConfig | null> {
  // Step 1: try tenant-specific provider
  const tenantRow = await db
    .prepare(
      `SELECT
         cp.id, cp.provider_name, cp.credentials_kv_key,
         cp.custom_from_email, cp.custom_from_name,
         cp.custom_from_domain_verified,
         cp.platform_sender_fallback,
         cp.metadata, cp.is_platform_default,
         t.display_name AS tenant_display_name
       FROM channel_provider cp
       LEFT JOIN tenants t ON t.id = cp.tenant_id
       WHERE cp.tenant_id = ? AND cp.channel = ? AND cp.is_active = 1
       LIMIT 1`,
    )
    .bind(tenantId, channel)
    .first<ChannelProviderRow>();

  if (tenantRow) {
    return mapRow(tenantRow, false);
  }

  // Step 2: fall back to platform default
  const platformRow = await db
    .prepare(
      `SELECT
         cp.id, cp.provider_name, cp.credentials_kv_key,
         cp.custom_from_email, cp.custom_from_name,
         cp.custom_from_domain_verified,
         cp.platform_sender_fallback,
         cp.metadata, cp.is_platform_default,
         NULL AS tenant_display_name
       FROM channel_provider cp
       WHERE cp.is_platform_default = 1
         AND cp.channel = ?
         AND cp.is_active = 1
       LIMIT 1`,
    )
    .bind(channel)
    .first<ChannelProviderRow>();

  if (platformRow) {
    return mapRow(platformRow, true);
  }

  return null;
}

// ---------------------------------------------------------------------------
// resolveChannelProviderByPriority
// ---------------------------------------------------------------------------

/**
 * Resolve ALL active providers for a channel, ordered by specificity:
 * tenant-specific first, then platform defaults.
 *
 * Used by the fallback chain (N-050) to obtain the ordered list of providers
 * to try for a given tenant + channel.
 *
 * @param db       - D1 database binding
 * @param tenantId - Current tenant ID
 * @param channel  - Channel type to look up
 */
export async function resolveChannelProviderList(
  db: D1LikeFull,
  tenantId: string,
  channel: NotificationChannel,
): Promise<ChannelProviderConfig[]> {
  const { results } = await db
    .prepare(
      `SELECT
         cp.id, cp.provider_name, cp.credentials_kv_key,
         cp.custom_from_email, cp.custom_from_name,
         cp.custom_from_domain_verified,
         cp.platform_sender_fallback,
         cp.metadata, cp.is_platform_default,
         t.display_name AS tenant_display_name
       FROM channel_provider cp
       LEFT JOIN tenants t ON t.id = cp.tenant_id
       WHERE cp.channel = ?
         AND cp.is_active = 1
         AND (cp.tenant_id = ? OR cp.is_platform_default = 1)
       ORDER BY
         CASE WHEN cp.tenant_id = ? THEN 0 ELSE 1 END ASC`,
    )
    .bind(channel, tenantId, tenantId)
    .all<ChannelProviderRow>();

  return results.map((row) => mapRow(row, row.is_platform_default === 1));
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface ChannelProviderRow {
  id: string;
  provider_name: string;
  credentials_kv_key: string | null;
  custom_from_email: string | null;
  custom_from_name: string | null;
  custom_from_domain_verified: number;
  platform_sender_fallback: number;
  metadata: string | null;
  is_platform_default: number;
  tenant_display_name: string | null;
}

function mapRow(row: ChannelProviderRow, isPlatformDefault: boolean): ChannelProviderConfig {
  let metadata: Record<string, unknown> | null = null;
  if (row.metadata) {
    try {
      metadata = JSON.parse(row.metadata) as Record<string, unknown>;
    } catch {
      metadata = null;
    }
  }

  return {
    id: row.id,
    providerName: row.provider_name,
    credentialsKvKey: row.credentials_kv_key,
    customFromEmail: row.custom_from_email,
    customFromName: row.custom_from_name,
    customFromDomainVerified: row.custom_from_domain_verified === 1,
    platformSenderFallback: row.platform_sender_fallback === 1,
    metadata,
    isPlatformDefault,
    tenantDisplayName: row.tenant_display_name,
  };
}
