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
}
