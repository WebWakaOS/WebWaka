/**
 * @webwaka/white-label-theming — [Pillar 2] Brand token system for white-label surfaces.
 *
 * Single source of truth for tenant theme resolution, CSS variable generation,
 * and brand configuration validation. Used by brand-runtime and public-discovery.
 *
 * Platform Invariants:
 *   P1 — Build Once (no duplicated theming logic in individual apps)
 *   P2 — Nigeria First
 *   T3 — Tenant isolation (every DB query includes tenant_id / slug predicate)
 *
 * Phase 3 additions (N-033, N-033a):
 *   - TenantTheme extended with sender / footer / attribution fields
 *   - resolveBrandContext(workspaceId) — brand walk with brand_independence_mode
 *   - resolveEmailSender(tenantId) — G3 FROM address from channel_provider
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TenantTheme {
  tenantId: string;
  tenantSlug: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  borderRadiusPx: number;
  customDomain: string | null;

  // N-033 Phase 3 — email branding fields
  /** Custom FROM email for outbound email (from channel_provider). Null = platform sender. */
  senderEmailAddress: string | null;
  /** Custom FROM display name for outbound email (from channel_provider). */
  senderDisplayName: string | null;
  /** Tenant support email — shown in email footer. Null if not configured. */
  tenantSupportEmail: string | null;
  /** Tenant mailing address — NDPR-required for marketing email footer. */
  tenantAddress: string | null;
  /**
   * Whether this tenant must show "Powered by WebWaka" attribution in emails.
   * G17 OQ-003: free-plan tenants = true; paid plans = false (set via billing module).
   * Phase 3 default: true for all tenants (Phase 4 billing module flips this).
   */
  requiresWebwakaAttribution: boolean;
}

export interface ThemeTokens {
  cssVars: string;
  theme: TenantTheme;
}

export interface BrandConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  borderRadiusPx?: number;
}

interface ThemeCacheKV {
  get(key: string, format: 'json'): Promise<TenantTheme | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
    };
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CACHE_TTL_SECONDS = 300;

const DEFAULT_THEME: Omit<
  TenantTheme,
  | 'tenantId'
  | 'tenantSlug'
  | 'displayName'
  | 'customDomain'
  | 'senderEmailAddress'
  | 'senderDisplayName'
  | 'tenantSupportEmail'
  | 'tenantAddress'
> = {
  primaryColor: '#1a6b3a',
  secondaryColor: '#f5a623',
  accentColor: '#e8f5e9',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  logoUrl: null,
  faviconUrl: null,
  borderRadiusPx: 8,
  requiresWebwakaAttribution: true,
};

/**
 * Platform-level fallback TenantTheme used when no workspace / partner brand is found.
 * G3: senderEmailAddress null → ResendEmailChannel must use PLATFORM_FROM.
 */
const PLATFORM_DEFAULT_THEME: TenantTheme = {
  tenantId: 'platform',
  tenantSlug: 'webwaka',
  displayName: 'WebWaka',
  ...DEFAULT_THEME,
  customDomain: null,
  senderEmailAddress: null,
  senderDisplayName: null,
  tenantSupportEmail: 'support@webwaka.com',
  tenantAddress: null,
  requiresWebwakaAttribution: false, // platform itself does not need to attribute itself
};

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateBrandConfig(config: BrandConfig): string[] {
  const errors: string[] = [];

  if (config.primaryColor && !HEX_COLOR_RE.test(config.primaryColor)) {
    errors.push(`Invalid primaryColor: "${config.primaryColor}" — must be hex (#RGB or #RRGGBB)`);
  }
  if (config.secondaryColor && !HEX_COLOR_RE.test(config.secondaryColor)) {
    errors.push(`Invalid secondaryColor: "${config.secondaryColor}" — must be hex`);
  }
  if (config.accentColor && !HEX_COLOR_RE.test(config.accentColor)) {
    errors.push(`Invalid accentColor: "${config.accentColor}" — must be hex`);
  }
  if (config.borderRadiusPx !== undefined && (config.borderRadiusPx < 0 || config.borderRadiusPx > 24)) {
    errors.push(`borderRadiusPx must be 0–24, got ${config.borderRadiusPx}`);
  }
  if (config.logoUrl && !config.logoUrl.startsWith('https://')) {
    errors.push('logoUrl must use HTTPS');
  }
  if (config.faviconUrl && !config.faviconUrl.startsWith('https://')) {
    errors.push('faviconUrl must use HTTPS');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// CSS generation
// ---------------------------------------------------------------------------

/**
 * Sanitize a CSS custom-property value to prevent CSS injection.
 * Strips characters that can escape out of a CSS value context:
 *   \ { } < > ; " url( expression(
 * SEC: P0 fix — fontFamily and other string tokens were injected unescaped.
 */
function sanitizeCssValue(value: string): string {
  return value
    .replace(/\\/g, '')
    .replace(/[{}<>;]/g, '')
    .replace(/"/g, '')
    .replace(/url\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '');
}

export function buildCssVars(theme: TenantTheme): string {
  return `:root {
  --ww-primary:        ${theme.primaryColor};
  --ww-secondary:      ${theme.secondaryColor};
  --ww-accent:         ${theme.accentColor};
  --ww-font:           ${sanitizeCssValue(theme.fontFamily)};
  --ww-radius:         ${theme.borderRadiusPx}px;
  --ww-text:           #111827;
  --ww-text-muted:     #6b7280;
  --ww-bg:             #ffffff;
  --ww-bg-surface:     #f9fafb;
  --ww-border:         #e5e7eb;
}`;
}

export function getDefaultTheme(): typeof DEFAULT_THEME {
  return { ...DEFAULT_THEME };
}

// ---------------------------------------------------------------------------
// Attribution (GAP-003 — White-Label Policy §4)
// ---------------------------------------------------------------------------

export interface AttributionOptions {
  removeAttribution?: boolean | undefined;
}

export function renderAttribution(opts?: AttributionOptions): string {
  if (opts?.removeAttribution) return '';
  return `<p>Powered by <a href="https://webwaka.com" target="_blank" rel="noopener">WebWaka</a></p>`;
}

// ---------------------------------------------------------------------------
// getBrandTokens — slug-based resolution (existing API, unchanged)
// ---------------------------------------------------------------------------

export async function getBrandTokens(
  tenantSlug: string,
  db: D1Like,
  cache?: ThemeCacheKV,
): Promise<ThemeTokens> {
  const cacheKey = `theme:${tenantSlug}`;

  if (cache) {
    const cached = await cache.get(cacheKey, 'json');
    if (cached) {
      return { cssVars: buildCssVars(cached), theme: cached };
    }
  }

  const row = await db
    .prepare(
      `SELECT
         o.id            AS tenantId,
         o.slug          AS tenantSlug,
         o.name          AS displayName,
         tb.primary_color,
         tb.secondary_color,
         tb.accent_color,
         tb.font_family,
         tb.logo_url,
         tb.favicon_url,
         tb.border_radius_px,
         tb.custom_domain,
         tb.support_email,
         tb.mailing_address,
         tb.requires_attribution,
         cp.custom_from_email,
         cp.custom_from_name
       FROM organizations o
       LEFT JOIN tenant_branding tb ON tb.tenant_id = o.id
       LEFT JOIN channel_provider cp
         ON cp.tenant_id = o.id AND cp.channel = 'email' AND cp.is_active = 1
       WHERE o.slug = ?
       LIMIT 1`,
    )
    .bind(tenantSlug)
    .first<OrgBrandRow>();

  if (!row) {
    throw new Error(`Tenant not found: ${tenantSlug}`);
  }

  const theme = buildThemeFromRow(row);

  if (cache) {
    await cache.put(cacheKey, JSON.stringify(theme), {
      expirationTtl: CACHE_TTL_SECONDS,
    });
  }

  return { cssVars: buildCssVars(theme), theme };
}

// ---------------------------------------------------------------------------
// resolveBrandContext — N-033a, workspaceId-based brand hierarchy walk
//
// Brand resolution order:
//   1. Workspace's own tenant_branding (if any branding row exists)
//   2. Sub-partner's workspace brand (if workspace belongs to a sub-partner)
//      2a. If brand_independence_mode = 0: also try parent partner's brand
//   3. Platform default (PLATFORM_DEFAULT_THEME)
//
// "Has branding" = the tenant_branding row exists for that workspace's org.
// sender info (G3) is always pulled from channel_provider for the resolved level.
// ---------------------------------------------------------------------------

export async function resolveBrandContext(
  workspaceId: string,
  db: D1Like,
  kv?: ThemeCacheKV,
): Promise<TenantTheme> {
  const cacheKey = `brand:ws:${workspaceId}`;

  if (kv) {
    const cached = await kv.get(cacheKey, 'json');
    if (cached) return cached;
  }

  // Step 1: Load workspace org + branding + sender config
  const wsRow = await queryOrgBrandById(workspaceId, db);

  // "Has branding" means the org row exists AND there is a tenant_branding record
  // for it (primary_color is a reliable indicator — NULL means no branding row or
  // the row has no customisation, in which case we continue walking).
  // We only skip the walk if ALL colour fields are set — a truly branded workspace.
  const wsHasBranding = wsRow !== null && hasBrandingRow(wsRow);

  if (wsHasBranding && wsRow !== null) {
    const theme = buildThemeFromRow(wsRow);
    if (kv) await kv.put(cacheKey, JSON.stringify(theme), { expirationTtl: CACHE_TTL_SECONDS });
    return theme;
  }

  // Step 2: Check whether this workspace belongs to a sub-partner
  const subPartnerRow = await db
    .prepare(
      `SELECT id, partner_id, brand_independence_mode
       FROM sub_partners
       WHERE workspace_id = ? AND status = 'active'
       LIMIT 1`,
    )
    .bind(workspaceId)
    .first<{ id: string; partner_id: string; brand_independence_mode: number }>();

  if (subPartnerRow) {
    // Try sub-partner's own workspace brand
    const spOrgRow = await queryOrgBrandById(subPartnerRow.id, db);
    if (spOrgRow !== null && hasBrandingRow(spOrgRow)) {
      const theme = buildThemeFromRow(spOrgRow);
      if (kv) await kv.put(cacheKey, JSON.stringify(theme), { expirationTtl: CACHE_TTL_SECONDS });
      return theme;
    }

    // Step 2a: brand_independence_mode = 0 → escalate to parent partner
    if (subPartnerRow.brand_independence_mode === 0) {
      const partnerRow = await db
        .prepare(
          `SELECT workspace_id FROM partners WHERE id = ? LIMIT 1`,
        )
        .bind(subPartnerRow.partner_id)
        .first<{ workspace_id: string }>();

      if (partnerRow) {
        const partnerOrgRow = await queryOrgBrandById(partnerRow.workspace_id, db);
        if (partnerOrgRow !== null && hasBrandingRow(partnerOrgRow)) {
          const theme = buildThemeFromRow(partnerOrgRow);
          if (kv) await kv.put(cacheKey, JSON.stringify(theme), { expirationTtl: CACHE_TTL_SECONDS });
          return theme;
        }
      }
    }
    // brand_independence_mode = 1: skip parent partner → fall to platform default
  }

  // Step 3: Platform default
  if (kv) {
    await kv.put(cacheKey, JSON.stringify(PLATFORM_DEFAULT_THEME), {
      expirationTtl: CACHE_TTL_SECONDS,
    });
  }
  return PLATFORM_DEFAULT_THEME;
}

// ---------------------------------------------------------------------------
// resolveEmailSender — G3 FROM address resolution
//
// Returns the resolved FROM string for Resend: "DisplayName <email@domain.com>"
// Priority: tenant channel_provider (verified domain only in Phase 4) → platform default.
// Phase 3: uses custom_from_email if present regardless of domain verification
//          (domain verification gating is Phase 4, N-053b).
// ---------------------------------------------------------------------------

const PLATFORM_SENDER_EMAIL = 'noreply@webwaka.com';
const PLATFORM_SENDER_NAME = 'WebWaka';

export function buildFromAddress(displayName: string | null, email: string | null): string {
  const name = displayName ?? PLATFORM_SENDER_NAME;
  const addr = email ?? PLATFORM_SENDER_EMAIL;
  return `${name} <${addr}>`;
}

export async function resolveEmailSender(
  tenantId: string,
  db: D1Like,
): Promise<{ fromAddress: string; senderFallbackUsed: boolean }> {
  const cpRow = await db
    .prepare(
      `SELECT custom_from_email, custom_from_name, platform_sender_fallback
       FROM channel_provider
       WHERE tenant_id = ? AND channel = 'email' AND is_active = 1
       LIMIT 1`,
    )
    .bind(tenantId)
    .first<{
      custom_from_email: string | null;
      custom_from_name: string | null;
      platform_sender_fallback: number;
    }>();

  if (cpRow?.custom_from_email) {
    return {
      fromAddress: buildFromAddress(cpRow.custom_from_name, cpRow.custom_from_email),
      senderFallbackUsed: false,
    };
  }

  // Fall back to platform sender (G3 OQ-004)
  return {
    fromAddress: buildFromAddress(PLATFORM_SENDER_NAME, PLATFORM_SENDER_EMAIL),
    senderFallbackUsed: true,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface OrgBrandRow {
  tenantId: string;
  tenantSlug: string;
  displayName: string;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  border_radius_px: number | null;
  custom_domain: string | null;
  support_email: string | null;
  mailing_address: string | null;
  requires_attribution: number | null;
  custom_from_email: string | null;
  custom_from_name: string | null;
}

async function queryOrgBrandById(orgId: string, db: D1Like): Promise<OrgBrandRow | null> {
  return db
    .prepare(
      `SELECT
         o.id            AS tenantId,
         o.slug          AS tenantSlug,
         o.name          AS displayName,
         tb.primary_color,
         tb.secondary_color,
         tb.accent_color,
         tb.font_family,
         tb.logo_url,
         tb.favicon_url,
         tb.border_radius_px,
         tb.custom_domain,
         tb.support_email,
         tb.mailing_address,
         tb.requires_attribution,
         cp.custom_from_email,
         cp.custom_from_name
       FROM organizations o
       LEFT JOIN tenant_branding tb ON tb.tenant_id = o.id
       LEFT JOIN channel_provider cp
         ON cp.tenant_id = o.id AND cp.channel = 'email' AND cp.is_active = 1
       WHERE o.id = ?
       LIMIT 1`,
    )
    .bind(orgId)
    .first<OrgBrandRow>();
}

/** Returns true if this org row has a meaningful tenant_branding record. */
function hasBrandingRow(row: OrgBrandRow): boolean {
  // A brand row is considered "set" if at least primaryColor is customised.
  // If the LEFT JOIN found no tenant_branding row, all tb.* columns are NULL.
  return row.primary_color !== null;
}

function buildThemeFromRow(row: OrgBrandRow): TenantTheme {
  return {
    tenantId: row.tenantId,
    tenantSlug: row.tenantSlug,
    displayName: row.displayName,
    primaryColor: row.primary_color ?? DEFAULT_THEME.primaryColor,
    secondaryColor: row.secondary_color ?? DEFAULT_THEME.secondaryColor,
    accentColor: row.accent_color ?? DEFAULT_THEME.accentColor,
    fontFamily: row.font_family ?? DEFAULT_THEME.fontFamily,
    logoUrl: row.logo_url ?? null,
    faviconUrl: row.favicon_url ?? null,
    borderRadiusPx: row.border_radius_px ?? DEFAULT_THEME.borderRadiusPx,
    customDomain: row.custom_domain ?? null,
    senderEmailAddress: row.custom_from_email ?? null,
    senderDisplayName: row.custom_from_name ?? null,
    tenantSupportEmail: row.support_email ?? null,
    tenantAddress: row.mailing_address ?? null,
    requiresWebwakaAttribution: (row.requires_attribution ?? 1) === 1,
  };
}
