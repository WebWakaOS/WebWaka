/**
 * White-label depth cap helper \u2014 shared between branded-page, blog, shop, and portal.
 * (Pillar 2 / ENT-004)
 *
 * P1 audit fix (Emergent Pillar-2 audit 2026-04-25):
 *   Previously only branded-page.ts applied the depth cap. /blog, /shop, /portal
 *   bypassed it, allowing a depth-0 sub-partner-restricted tenant to leak their
 *   custom branding on those surfaces. Centralising the cap here ensures every
 *   route applies it consistently.
 */

import type { Context } from 'hono';
import type { Env, Variables } from '../env.js';
import { generateCssTokens } from './theme.js';
import {
  buildCssVars,
  getDefaultTheme,
} from '@webwaka/white-label-theming';
import type { TenantTheme } from '@webwaka/white-label-theming';

export type ResolvedThemeAndCss = { cssVars: string; theme: TenantTheme } | null;

/**
 * ENT-004: Apply the partner-granted white-label depth cap to a resolved theme.
 *   depth 0 \u2014 no white-labelling: visual fields reset to platform defaults
 *   depth 1 \u2014 basic: logo + brand colours; strip custom domain + email branding
 *   depth 2 \u2014 full white-label: theme returned unchanged
 */
export function applyDepthCap(theme: TenantTheme, depth: number): TenantTheme {
  if (depth >= 2) return theme;

  if (depth === 0) {
    const defaults = getDefaultTheme();
    return {
      ...defaults,
      tenantId: theme.tenantId,
      tenantSlug: theme.tenantSlug,
      displayName: theme.displayName,
      customDomain: null,
      senderEmailAddress: null,
      senderDisplayName: null,
      tenantSupportEmail: null,
      tenantAddress: null,
    };
  }

  // depth 1: basic
  return {
    ...theme,
    customDomain: null,
    senderEmailAddress: null,
    senderDisplayName: null,
    tenantSupportEmail: null,
    tenantAddress: null,
    faviconUrl: null,
  };
}

/**
 * Resolve theme tokens for a request, applying the partner-granted depth cap.
 * Returns null when the tenant cannot be resolved (caller should respond 404).
 *
 * Reads c.get('whiteLabelDepth') (set by whiteLabelDepthMiddleware) \u2014 default
 * is 2 (full) when not set.
 */
export async function resolveCappedTheme(
  c: Context<{ Bindings: Env; Variables: Variables }>,
): Promise<ResolvedThemeAndCss> {
  try {
    const tenantSlug = c.get('tenantSlug') as string | undefined;
    if (!tenantSlug) return null;
    const result = await generateCssTokens(tenantSlug, c.env);
    const depth: number = c.get('whiteLabelDepth') ?? 2;
    const theme = applyDepthCap(result.theme, depth);
    const cssVars = depth >= 2 ? result.cssVars : buildCssVars(theme);
    return { cssVars, theme };
  } catch {
    return null;
  }
}
