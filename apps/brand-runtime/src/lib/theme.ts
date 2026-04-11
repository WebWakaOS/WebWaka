/**
 * White-label theme token generator.
 * (PV-1.3 — wires white-label-theming package into brand-runtime)
 *
 * Reads tenant branding config from DB (primary_color, secondary_color,
 * logo_url, font_family, border_radius_px) and converts to CSS custom
 * properties. Caches in THEME_CACHE KV with 300 s TTL.
 *
 * Platform Invariants: P2 (Nigeria First), T3 (tenant isolation — every
 * DB query must include WHERE tenant_id = ?).
 */

import type { Env } from '../env.js';

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

/**
 * Resolve tenant branding config and return CSS custom properties string.
 *
 * @throws If tenant is not found in DB (caller handles 404).
 */
export async function generateCssTokens(
  tenantSlug: string,
  env: Env,
): Promise<ThemeTokens> {
  const cacheKey = `theme:${tenantSlug}`;

  // ─── Cache hit ───────────────────────────────────────────────────────────
  const cached = await env.THEME_CACHE.get(cacheKey, 'json') as TenantTheme | null;
  if (cached) {
    return { cssVars: buildCssVars(cached), theme: cached };
  }

  // ─── DB lookup ───────────────────────────────────────────────────────────
  const row = await env.DB
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

  // ─── Write to cache ───────────────────────────────────────────────────────
  await env.THEME_CACHE.put(cacheKey, JSON.stringify(theme), {
    expirationTtl: CACHE_TTL_SECONDS,
  });

  return { cssVars: buildCssVars(theme), theme };
}

/**
 * Convert TenantTheme to a <style> block of CSS custom properties.
 */
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
