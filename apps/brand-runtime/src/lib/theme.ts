/**
 * White-label theme token generator — thin wrapper around @webwaka/white-label-theming.
 *
 * P1 — Build Once: all theming logic lives in the shared package.
 * This file re-exports the shared types and provides the env-aware entry points.
 *
 * Two resolution strategies are exposed:
 *   generateCssTokens(tenantSlug, env)  — slug-based (getBrandTokens), used for
 *     public pages where only the subdomain slug is available.
 *   generateCssTokensByWorkspace(workspaceId, env)  — workspace-id-based
 *     (resolveBrandContext), walks the full brand hierarchy and respects
 *     brand_independence_mode; used for portal and authenticated routes where
 *     the workspaceId is available from the JWT. Fixes P1: whiteLabelDepth was
 *     set by middleware but getBrandTokens (slug-only) never walked the hierarchy.
 */

import type { Env } from '../env.js';
import {
  getBrandTokens,
  resolveBrandContext,
  buildCssVars,
  validateBrandConfig,
  getDefaultTheme,
} from '@webwaka/white-label-theming';
import type { TenantTheme, ThemeTokens, BrandConfig } from '@webwaka/white-label-theming';

export type { TenantTheme, ThemeTokens, BrandConfig };
export { buildCssVars, validateBrandConfig, getDefaultTheme, resolveBrandContext };

/**
 * Slug-based CSS token generation.
 * Uses getBrandTokens (single-org, no hierarchy walk).
 * Suitable for public pages resolved via subdomain slug.
 */
export async function generateCssTokens(
  tenantSlug: string,
  env: Env,
): Promise<ThemeTokens> {
  return getBrandTokens(tenantSlug, env.DB, env.THEME_CACHE);
}

/**
 * Workspace-ID-based CSS token generation (P1 fix).
 * Uses resolveBrandContext which walks the workspace→sub-partner→partner
 * brand hierarchy and respects brand_independence_mode.
 * Use this on authenticated routes where workspaceId is available from JWT.
 * Result is wrapped as ThemeTokens (adds cssVars string).
 */
export async function generateCssTokensByWorkspace(
  workspaceId: string,
  env: Env,
): Promise<ThemeTokens> {
  const theme = await resolveBrandContext(workspaceId, env.DB, env.THEME_CACHE);
  return { theme, cssVars: buildCssVars(theme) };
}
