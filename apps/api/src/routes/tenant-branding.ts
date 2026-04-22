/**
 * Tenant branding / white-label routes.
 *
 *   GET  /tenant/branding             — fetch this tenant's branding settings
 *   PATCH /tenant/branding            — create or update branding settings
 *   POST  /tenant/branding/domain     — set (or update) custom domain
 *   GET   /tenant/branding/domain/verify — re-trigger DNS verification check
 *
 * All routes require auth (applied at app level in router.ts).
 * PATCH and POST require admin or super_admin role.
 *
 * The `tenant_branding` table stores:
 *   - Visual tokens (colors, fonts, logo/favicon URLs)
 *   - Custom domain (with verification lifecycle)
 *   - Display name for the white-label app
 *   - Notification-specific fields (support_email, mailing_address)
 *   - Workspace-level receiving bank account for B2B/POS payments
 *
 * Custom domain flow:
 *   1. Admin calls POST /tenant/branding/domain with { custom_domain: "shop.example.com" }
 *   2. API generates a verification token and returns it
 *   3. Admin adds a DNS TXT record: _webwaka-verify.shop.example.com → token
 *   4. GET /tenant/branding/domain/verify checks DNS and marks verified
 *   (Automated polling can be added later via CRON.)
 *
 * The brand-runtime app already resolves tenants via tenant_branding.custom_domain
 * using subdomain fallback — this endpoint provides the management API.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

export const tenantBrandingRoutes = new Hono<AppEnv>();

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface TenantBrandingRow {
  id:                               string;
  tenant_id:                        string;
  primary_color:                    string | null;
  secondary_color:                  string | null;
  accent_color:                     string | null;
  font_family:                      string | null;
  logo_url:                         string | null;
  favicon_url:                      string | null;
  border_radius_px:                 number;
  custom_domain:                    string | null;
  custom_domain_verified:           number;
  custom_domain_verification_token: string | null;
  custom_domain_verified_at:        number | null;
  display_name:                     string | null;
  support_email:                    string | null;
  mailing_address:                  string | null;
  requires_attribution:             number;
  payment_bank_account_json:        string | null;
  created_at:                       number;
  updated_at:                       number;
}

function brandingId(tenantId: string): string {
  return `brnd_${tenantId.replace(/[^a-z0-9]/g, '').slice(-16)}`;
}

function generateVerificationToken(): string {
  return `wkv_${Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')}`;
}

// ---------------------------------------------------------------------------
// GET /tenant/branding
// ---------------------------------------------------------------------------

tenantBrandingRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;

  const row = await db
    .prepare('SELECT * FROM tenant_branding WHERE tenant_id = ? LIMIT 1')
    .bind(auth.tenantId)
    .first<TenantBrandingRow>();

  if (!row) {
    return c.json({ branding: null, message: 'No branding configured yet. Use PATCH /tenant/branding to create.' });
  }

  let bankAccount: unknown = null;
  if (row.payment_bank_account_json) {
    try { bankAccount = JSON.parse(row.payment_bank_account_json); } catch { bankAccount = null; }
  }

  return c.json({
    branding: {
      id:                       row.id,
      primary_color:            row.primary_color,
      secondary_color:          row.secondary_color,
      accent_color:             row.accent_color,
      font_family:              row.font_family,
      logo_url:                 row.logo_url,
      favicon_url:              row.favicon_url,
      border_radius_px:         row.border_radius_px,
      display_name:             row.display_name,
      support_email:            row.support_email,
      mailing_address:          row.mailing_address,
      requires_attribution:     row.requires_attribution === 1,
      payment_bank_account:     bankAccount,
      custom_domain: {
        domain:      row.custom_domain,
        verified:    row.custom_domain_verified === 1,
        verified_at: row.custom_domain_verified_at,
        dns_record:  row.custom_domain_verification_token
          ? `Add TXT record: _webwaka-verify.${row.custom_domain ?? '<domain>'} → ${row.custom_domain_verification_token}`
          : null,
      },
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  });
});

// ---------------------------------------------------------------------------
// PATCH /tenant/branding — create or update (upsert)
// ---------------------------------------------------------------------------

tenantBrandingRoutes.patch('/', async (c) => {
  const auth = c.get('auth');
  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'admin or super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  let body: {
    primary_color?:      string;
    secondary_color?:    string;
    accent_color?:       string;
    font_family?:        string;
    logo_url?:           string;
    favicon_url?:        string;
    border_radius_px?:   number;
    display_name?:       string;
    support_email?:      string;
    mailing_address?:    string;
    requires_attribution?: boolean;
    bank_account?: {
      bank_name:      string;
      account_number: string;
      account_name:   string;
      bank_code?:     string;
      sort_code?:     string;
    };
  } = {};

  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const existing = await db
    .prepare('SELECT id FROM tenant_branding WHERE tenant_id = ? LIMIT 1')
    .bind(auth.tenantId)
    .first<{ id: string }>();

  const bankAccountJson = body.bank_account
    ? JSON.stringify(body.bank_account)
    : undefined;

  if (!existing) {
    const id = brandingId(auth.tenantId);
    await db
      .prepare(
        `INSERT INTO tenant_branding
           (id, tenant_id, primary_color, secondary_color, accent_color,
            font_family, logo_url, favicon_url, border_radius_px,
            display_name, support_email, mailing_address, requires_attribution,
            payment_bank_account_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
      )
      .bind(
        id,
        auth.tenantId,
        body.primary_color   ?? null,
        body.secondary_color ?? null,
        body.accent_color    ?? null,
        body.font_family     ?? null,
        body.logo_url        ?? null,
        body.favicon_url     ?? null,
        body.border_radius_px ?? 8,
        body.display_name    ?? null,
        body.support_email   ?? null,
        body.mailing_address ?? null,
        body.requires_attribution === false ? 0 : 1,
        bankAccountJson ?? null,
      )
      .run();
    return c.json({ message: 'Branding created successfully.', id }, 201);
  }

  const parts: string[] = [];
  const vals: unknown[] = [];

  const optionals: Array<[string, unknown]> = [
    ['primary_color',   body.primary_color],
    ['secondary_color', body.secondary_color],
    ['accent_color',    body.accent_color],
    ['font_family',     body.font_family],
    ['logo_url',        body.logo_url],
    ['favicon_url',     body.favicon_url],
    ['display_name',    body.display_name],
    ['support_email',   body.support_email],
    ['mailing_address', body.mailing_address],
  ];

  for (const [col, val] of optionals) {
    if (val !== undefined) { parts.push(`${col} = ?`); vals.push(val); }
  }

  if (body.border_radius_px !== undefined) {
    parts.push('border_radius_px = ?'); vals.push(body.border_radius_px);
  }
  if (body.requires_attribution !== undefined) {
    parts.push('requires_attribution = ?'); vals.push(body.requires_attribution ? 1 : 0);
  }
  if (bankAccountJson !== undefined) {
    parts.push('payment_bank_account_json = ?'); vals.push(bankAccountJson);
  }

  if (parts.length === 0) {
    return c.json({ error: 'No updatable fields provided.' }, 400);
  }

  parts.push('updated_at = unixepoch()');
  vals.push(auth.tenantId);

  await db
    .prepare(`UPDATE tenant_branding SET ${parts.join(', ')} WHERE tenant_id = ?`)
    .bind(...vals)
    .run();

  return c.json({ message: 'Branding updated successfully.', id: existing.id });
});

// ---------------------------------------------------------------------------
// POST /tenant/branding/domain — set or update custom domain
// ---------------------------------------------------------------------------

tenantBrandingRoutes.post('/domain', async (c) => {
  const auth = c.get('auth');
  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'admin or super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  let body: { custom_domain?: string } = {};
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const domain = body.custom_domain?.trim().toLowerCase();
  if (!domain) {
    return c.json({ error: 'custom_domain is required' }, 400);
  }

  const domainPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
  if (!domainPattern.test(domain)) {
    return c.json({ error: 'Invalid domain format (e.g. shop.example.com)' }, 400);
  }

  const conflict = await db
    .prepare('SELECT tenant_id FROM tenant_branding WHERE custom_domain = ? AND tenant_id != ? LIMIT 1')
    .bind(domain, auth.tenantId)
    .first<{ tenant_id: string }>();

  if (conflict) {
    return c.json({ error: 'This custom domain is already registered by another tenant.' }, 409);
  }

  const token = generateVerificationToken();

  const existing = await db
    .prepare('SELECT id FROM tenant_branding WHERE tenant_id = ? LIMIT 1')
    .bind(auth.tenantId)
    .first<{ id: string }>();

  if (!existing) {
    const id = brandingId(auth.tenantId);
    await db
      .prepare(
        `INSERT INTO tenant_branding
           (id, tenant_id, custom_domain, custom_domain_verified, custom_domain_verification_token, updated_at, created_at)
         VALUES (?, ?, ?, 0, ?, unixepoch(), unixepoch())`,
      )
      .bind(id, auth.tenantId, domain, token)
      .run();
  } else {
    await db
      .prepare(
        `UPDATE tenant_branding
         SET custom_domain = ?, custom_domain_verified = 0,
             custom_domain_verification_token = ?,
             custom_domain_verified_at = NULL,
             updated_at = unixepoch()
         WHERE tenant_id = ?`,
      )
      .bind(domain, token, auth.tenantId)
      .run();
  }

  return c.json({
    message:    'Custom domain registered. Complete DNS verification to activate.',
    domain,
    verified:   false,
    dns_instructions: {
      record_type: 'TXT',
      record_name: `_webwaka-verify.${domain}`,
      record_value: token,
      note: 'Add this TXT record to your DNS provider, then call GET /tenant/branding/domain/verify to confirm.',
    },
  }, 201);
});

// ---------------------------------------------------------------------------
// GET /tenant/branding/domain/verify — check DNS and mark domain verified
// ---------------------------------------------------------------------------

tenantBrandingRoutes.get('/domain/verify', async (c) => {
  const auth = c.get('auth');
  const db = c.env.DB as unknown as D1Like;

  const row = await db
    .prepare(
      `SELECT custom_domain, custom_domain_verified, custom_domain_verification_token
       FROM tenant_branding WHERE tenant_id = ? LIMIT 1`,
    )
    .bind(auth.tenantId)
    .first<{
      custom_domain: string | null;
      custom_domain_verified: number;
      custom_domain_verification_token: string | null;
    }>();

  if (!row?.custom_domain) {
    return c.json({ error: 'No custom domain configured. Use POST /tenant/branding/domain first.' }, 404);
  }

  if (row.custom_domain_verified === 1) {
    return c.json({ verified: true, domain: row.custom_domain, message: 'Domain already verified.' });
  }

  if (!row.custom_domain_verification_token) {
    return c.json({ error: 'No verification token found. Re-register the domain via POST /tenant/branding/domain.' }, 500);
  }

  const expectedToken = row.custom_domain_verification_token;
  const lookupDomain  = `_webwaka-verify.${row.custom_domain}`;

  let dnsVerified = false;
  try {
    const dnsResponse = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(lookupDomain)}&type=TXT`,
      { headers: { Accept: 'application/dns-json' } },
    );
    if (dnsResponse.ok) {
      const dnsData = await dnsResponse.json() as { Answer?: Array<{ data: string }> };
      if (dnsData.Answer) {
        dnsVerified = dnsData.Answer.some(
          (record) => record.data.replace(/^"|"$/g, '') === expectedToken,
        );
      }
    }
  } catch {
    return c.json({
      verified:     false,
      domain:       row.custom_domain,
      dns_checked:  false,
      message:      'DNS lookup failed. Please try again shortly.',
    }, 503);
  }

  if (dnsVerified) {
    await db
      .prepare(
        `UPDATE tenant_branding
         SET custom_domain_verified = 1, custom_domain_verified_at = unixepoch(), updated_at = unixepoch()
         WHERE tenant_id = ?`,
      )
      .bind(auth.tenantId)
      .run();

    return c.json({
      verified: true,
      domain:   row.custom_domain,
      message:  'Custom domain verified successfully! Your brand frontend is now accessible at your custom domain.',
    });
  }

  return c.json({
    verified:        false,
    domain:          row.custom_domain,
    dns_checked:     true,
    expected_record: { type: 'TXT', name: lookupDomain, value: expectedToken },
    message:         'DNS TXT record not found yet. DNS propagation can take up to 48 hours. Try again later.',
  });
});
