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
 */

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

const CACHE_TTL_SECONDS = 300;

const DEFAULT_THEME: Omit<TenantTheme, 'tenantId' | 'tenantSlug' | 'displayName' | 'customDomain'> = {
  primaryColor: '#1a6b3a',
  secondaryColor: '#f5a623',
  accentColor: '#e8f5e9',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  logoUrl: null,
  faviconUrl: null,
  borderRadiusPx: 8,
};

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

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

export function buildCssVars(theme: TenantTheme): string {
  return `:root {
  --ww-primary:        ${theme.primaryColor};
  --ww-secondary:      ${theme.secondaryColor};
  --ww-accent:         ${theme.accentColor};
  --ww-font:           ${theme.fontFamily};
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
         tb.custom_domain
       FROM organizations o
       LEFT JOIN tenant_branding tb ON tb.tenant_id = o.id
       WHERE o.slug = ?
       LIMIT 1`,
    )
    .bind(tenantSlug)
    .first<{
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
    }>();

  if (!row) {
    throw new Error(`Tenant not found: ${tenantSlug}`);
  }

  const theme: TenantTheme = {
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
  };

  if (cache) {
    await cache.put(cacheKey, JSON.stringify(theme), {
      expirationTtl: CACHE_TTL_SECONDS,
    });
  }

  return { cssVars: buildCssVars(theme), theme };
}
