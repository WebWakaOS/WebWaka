/**
 * White-label theme token generator — thin wrapper around @webwaka/white-label-theming.
 *
 * P1 — Build Once: all theming logic lives in the shared package.
 * This file re-exports the shared types and provides the env-aware entry point.
 */

import type { Env } from '../env.js';
import {
  getBrandTokens,
  buildCssVars,
  validateBrandConfig,
  getDefaultTheme,
} from '@webwaka/white-label-theming';
import type { TenantTheme, ThemeTokens, BrandConfig } from '@webwaka/white-label-theming';

export type { TenantTheme, ThemeTokens, BrandConfig };
export { buildCssVars, validateBrandConfig, getDefaultTheme };

export async function generateCssTokens(
  tenantSlug: string,
  env: Env,
): Promise<ThemeTokens> {
  return getBrandTokens(tenantSlug, env.DB, env.THEME_CACHE);
}
