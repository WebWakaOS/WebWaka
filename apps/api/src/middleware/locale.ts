/**
 * Locale middleware (L-12 — i18n error responses)
 *
 * Detects the user's preferred language from:
 *   1. ?lang= query parameter
 *   2. Accept-Language header
 *   3. Default: 'en'
 *
 * Sets c.var.locale so route handlers can call i18nErrorResponse(code, locale).
 *
 * Supported locales: en, ha, yo, ig, pcm, fr
 *
 * Usage:
 *   app.use('*', localeMiddleware);
 *   // In handler:
 *   const locale = c.get('locale') as SupportedApiLocale ?? 'en';
 */

import type { Context, Next } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext; userId: string; tenantId: string; locale: string } };
import { detectApiLocale, type SupportedApiLocale } from '@webwaka/shared-config';

export async function localeMiddleware(c: Context<AppEnv>, next: Next): Promise<void> {
  const langParam = c.req.query('lang');
  const sp = langParam ? new URLSearchParams(`lang=${langParam}`) : undefined;
  const locale: SupportedApiLocale = detectApiLocale(c.req.raw, sp);
  c.set('locale', locale);
  await next();
}
