/**
 * Cloudflare Worker environment bindings for brand-runtime.
 * (Pillar 2 — Branding / Website / Portal)
 */

export interface Env {
  DB: D1Database;
  THEME_CACHE: KVNamespace;
  /**
   * KV namespace for transient cart data (session-scoped, 24h TTL).
   * Keyed as `cart:{tenantId}:{sessionId}`.
   * Optional — shop routes gracefully degrade if absent.
   */
  CART_KV?: KVNamespace;
  JWT_SECRET: string;
  LOG_PII_SALT: string;
  INTER_SERVICE_SECRET: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  /**
   * Paystack secret key for e-commerce checkout (P4-A).
   * Optional — shop/checkout routes return 503 if absent.
   */
  PAYSTACK_SECRET_KEY?: string;
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
  /**
   * Maximum white-label branding depth allowed for this tenant's partner.
   * 0 = no white-label, 1 = basic (logo + colors), 2 = full (custom domain + all).
   * Null/undefined means no partner restriction (use subscription plan only).
   * Set by whiteLabelDepthMiddleware after tenant resolution.
   */
  whiteLabelDepth?: number;
}
