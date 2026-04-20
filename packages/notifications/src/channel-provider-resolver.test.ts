/**
 * channel-provider-resolver.test.ts — N-053 (Phase 4)
 *
 * Tests resolveChannelProvider() two-tier lookup:
 *   1. Tenant-specific row
 *   2. Platform default fallback
 * And resolveChannelProviderList() ordered multi-provider list.
 */

import { describe, it, expect } from 'vitest';
import { resolveChannelProvider, resolveChannelProviderList } from './channel-provider-resolver.js';

// ---------------------------------------------------------------------------
// Mock DB builder
// ---------------------------------------------------------------------------

interface MockRow {
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

function makeDb(
  tenantRows: MockRow[],
  platformRows: MockRow[],
  listRows?: MockRow[],
) {
  return {
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => {
        // Determine which result set to return based on query content
        const isListQuery = sql.includes('ORDER BY');
        if (isListQuery) {
          return {
            all: async <T>() => ({ results: (listRows ?? [...tenantRows, ...platformRows]) as unknown as T[] }),
            first: async <T>() => null as T | null,
            run: async () => ({ success: true, meta: { changes: 0, duration: 0, rows_written: 0, rows_read: 0, last_row_id: 0, changed_db: false, size_after: 0 } }),
          };
        }
        // Tenant query binds 2 args (tenantId + channel); platform query binds 1 (channel).
        // Can't use sql.includes('is_platform_default') — it appears in SELECT of both queries.
        const isTenantQuery = args.length === 2;
        const rows = isTenantQuery ? tenantRows : platformRows;
        return {
          first: async <T>() => (rows[0] ?? null) as T | null,
          all: async <T>() => ({ results: rows as unknown as T[] }),
          run: async () => ({ success: true, meta: { changes: 0, duration: 0, rows_written: 0, rows_read: 0, last_row_id: 0, changed_db: false, size_after: 0 } }),
        };
      },
    }),
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const platformResendRow: MockRow = {
  id: 'ch_prov_resend_platform',
  provider_name: 'resend',
  credentials_kv_key: 'platform:ch_creds:email:resend',
  custom_from_email: 'hello@webwaka.com',
  custom_from_name: 'WebWaka',
  custom_from_domain_verified: 1,
  platform_sender_fallback: 1,
  metadata: '{"from_domain":"webwaka.com"}',
  is_platform_default: 1,
  tenant_display_name: null,
};

const tenantResendRow: MockRow = {
  id: 'ch_prov_resend_tenant_abc',
  provider_name: 'resend',
  credentials_kv_key: 'tenant_abc:ch_creds:email:resend',
  custom_from_email: 'support@acmecorp.com',
  custom_from_name: 'Acme Support',
  custom_from_domain_verified: 1,
  platform_sender_fallback: 0,
  metadata: '{"from_domain":"acmecorp.com"}',
  is_platform_default: 0,
  tenant_display_name: 'Acme Corp',
};

const tenantResendUnverifiedRow: MockRow = {
  ...tenantResendRow,
  id: 'ch_prov_resend_tenant_xyz',
  custom_from_domain_verified: 0,
  platform_sender_fallback: 0,
  credentials_kv_key: null,
  tenant_display_name: 'XYZ Ltd',
};

// ---------------------------------------------------------------------------
// resolveChannelProvider
// ---------------------------------------------------------------------------

describe('resolveChannelProvider', () => {
  it('returns tenant-specific provider when tenant row exists', async () => {
    const db = makeDb([tenantResendRow], [platformResendRow]) as never;
    const config = await resolveChannelProvider(db, 'tenant_abc', 'email');

    expect(config).not.toBeNull();
    expect(config!.providerName).toBe('resend');
    expect(config!.customFromEmail).toBe('support@acmecorp.com');
    expect(config!.customFromName).toBe('Acme Support');
    expect(config!.customFromDomainVerified).toBe(true);
    expect(config!.platformSenderFallback).toBe(false);
    expect(config!.isPlatformDefault).toBe(false);
    expect(config!.tenantDisplayName).toBe('Acme Corp');
    expect(config!.credentialsKvKey).toBe('tenant_abc:ch_creds:email:resend');
  });

  it('falls back to platform default when no tenant row exists', async () => {
    const db = makeDb([], [platformResendRow]) as never;
    const config = await resolveChannelProvider(db, 'tenant_no_config', 'email');

    expect(config).not.toBeNull();
    expect(config!.providerName).toBe('resend');
    expect(config!.customFromEmail).toBe('hello@webwaka.com');
    expect(config!.isPlatformDefault).toBe(true);
    expect(config!.tenantDisplayName).toBeNull();
    expect(config!.credentialsKvKey).toBe('platform:ch_creds:email:resend');
  });

  it('returns null when no platform default exists either', async () => {
    const db = makeDb([], []) as never;
    const config = await resolveChannelProvider(db, 'tenant_abc', 'email');
    expect(config).toBeNull();
  });

  it('parses metadata JSON correctly', async () => {
    const db = makeDb([tenantResendRow], []) as never;
    const config = await resolveChannelProvider(db, 'tenant_abc', 'email');
    expect(config!.metadata).toEqual({ from_domain: 'acmecorp.com' });
  });

  it('returns metadata as null when metadata column is null', async () => {
    const rowNoMeta: MockRow = { ...platformResendRow, metadata: null };
    const db = makeDb([], [rowNoMeta]) as never;
    const config = await resolveChannelProvider(db, 'tenant_abc', 'email');
    expect(config!.metadata).toBeNull();
  });

  it('returns metadata as null when metadata column is invalid JSON', async () => {
    const rowBadMeta: MockRow = { ...platformResendRow, metadata: 'not json' };
    const db = makeDb([], [rowBadMeta]) as never;
    const config = await resolveChannelProvider(db, 'tenant_abc', 'email');
    expect(config!.metadata).toBeNull();
  });

  it('maps custom_from_domain_verified=0 to false', async () => {
    const db = makeDb([tenantResendUnverifiedRow], []) as never;
    const config = await resolveChannelProvider(db, 'tenant_xyz', 'email');
    expect(config!.customFromDomainVerified).toBe(false);
  });

  it('G3/OQ-004: exposes platformSenderFallback correctly', async () => {
    const db = makeDb([], [platformResendRow]) as never;
    const config = await resolveChannelProvider(db, 'tenant_abc', 'email');
    // Platform default has platform_sender_fallback=1
    expect(config!.platformSenderFallback).toBe(true);
  });

  it('returns credentialsKvKey as null when column is null', async () => {
    const db = makeDb([tenantResendUnverifiedRow], []) as never;
    const config = await resolveChannelProvider(db, 'tenant_xyz', 'email');
    expect(config!.credentialsKvKey).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// resolveChannelProviderList
// ---------------------------------------------------------------------------

describe('resolveChannelProviderList', () => {
  it('returns empty array when no providers configured', async () => {
    const db = makeDb([], [], []) as never;
    const list = await resolveChannelProviderList(db, 'tenant_abc', 'sms');
    expect(list).toHaveLength(0);
  });

  it('returns ordered list with tenant provider first, then platform default', async () => {
    const db = makeDb([], [], [tenantResendRow, platformResendRow]) as never;
    const list = await resolveChannelProviderList(db, 'tenant_abc', 'email');
    expect(list).toHaveLength(2);
    expect(list[0]!.isPlatformDefault).toBe(false);
    expect(list[1]!.isPlatformDefault).toBe(true);
  });

  it('marks each row with correct isPlatformDefault', async () => {
    const db = makeDb([], [], [platformResendRow]) as never;
    const list = await resolveChannelProviderList(db, 'tenant_abc', 'email');
    expect(list[0]!.isPlatformDefault).toBe(true);
  });
});
