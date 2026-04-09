/**
 * Cloudflare Worker environment bindings for public-discovery.
 * (Pillar 3 — Listing / Multi-Vendor Marketplace)
 */

export interface Env {
  DB: D1Database;
  DISCOVERY_CACHE: KVNamespace;
  LOG_PII_SALT: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
}
