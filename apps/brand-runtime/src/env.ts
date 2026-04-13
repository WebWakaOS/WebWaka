/**
 * Cloudflare Worker environment bindings for brand-runtime.
 * (Pillar 2 — Branding / Website / Portal)
 */

export interface Env {
  DB: D1Database;
  THEME_CACHE: KVNamespace;
  JWT_SECRET: string;
  LOG_PII_SALT: string;
  INTER_SERVICE_SECRET: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  /**
   * R2 bucket for brand asset storage: logos, cover images, favicons, custom fonts.
   * Bound as "assets-staging" / "assets-production" per environment.
   * Optional in type; routes using this must guard for undefined.
   */
  ASSETS?: R2Bucket;
}

export interface Variables {
  tenantSlug: string;
  tenantId?: string;
  tenantName?: string;
  themeColor?: string;
}
