/**
 * Cloudflare Worker environment bindings type definition.
 * All bindings must be declared here and referenced as `Env` throughout the app.
 *
 * Bindings are provisioned via wrangler.toml + CF Dashboard secrets.
 * Never hardcode secrets — use CF Worker Secrets.
 */

export interface Env {
  /** Main D1 database binding */
  DB: D1Database;

  /** KV namespace for caching the geography index */
  GEOGRAPHY_CACHE: KVNamespace;

  /** KV namespace for OTP rate limiting and channel locks (R9) */
  RATE_LIMIT_KV: KVNamespace;

  /** General-purpose KV namespace — audit log fallback, cache, feature flags (SEC-17) */
  KV?: KVNamespace;

  /**
   * R2 bucket for file/asset storage: logos, user uploads, documents, export files.
   * Bound as "assets-staging" / "assets-production" per environment.
   * Optional in type; any route using this must guard with: if (!c.env.ASSETS) return c.json({ error: 'File storage not available' }, 503)
   */
  ASSETS?: R2Bucket;

  /** JWT secret — stored as a CF Worker Secret. Never log this. */
  JWT_SECRET: string;

  /** Runtime environment tag */
  ENVIRONMENT: 'development' | 'staging' | 'production';

  /**
   * Paystack secret key — stored as a CF Worker Secret.
   * Provisioned via CF Dashboard / wrangler secret put PAYSTACK_SECRET_KEY
   * Never hardcode or log this value.
   * Optional: when absent the platform falls back to DEFAULT_PAYMENT_MODE.
   */
  PAYSTACK_SECRET_KEY?: string;

  /**
   * Default payment mode for the platform.
   * 'bank_transfer' — manual/offline mode; upgrade routes return bank account
   *                   instructions instead of a Paystack checkout URL.
   * 'paystack'      — online mode; Paystack checkout is the primary flow.
   * Defaults to 'bank_transfer' when absent (safe default).
   * Set via wrangler.toml [vars] — not a secret.
   */
  DEFAULT_PAYMENT_MODE?: 'bank_transfer' | 'paystack';

  /**
   * JSON-encoded platform receiving bank account for manual payments.
   * Shape: { bank_name, account_number, account_name, sort_code? }
   * Surfaced to callers when DEFAULT_PAYMENT_MODE = 'bank_transfer'.
   * Set via wrangler.toml [vars] — this is NOT a secret (it is shared with payers).
   * Example: '{"bank_name":"Access Bank","account_number":"0123456789","account_name":"WebWaka Technologies Ltd"}'
   * UPDATE THIS before accepting live payments.
   */
  PLATFORM_BANK_ACCOUNT_JSON?: string;

  /**
   * Prembly API key — stored as a CF Worker Secret (M7a).
   * Used for BVN, NIN, CAC, FRSC verification.
   * Never hardcode or log this value.
   */
  PREMBLY_API_KEY: string;

  /**
   * Termii API key — stored as a CF Worker Secret (M7a).
   * Used for SMS OTP delivery on Nigerian networks.
   * Never hardcode or log this value.
   */
  TERMII_API_KEY: string;

  /**
   * Meta/WhatsApp Business API access token (M7a).
   * Used for WhatsApp OTP delivery via Meta Cloud API v18.
   * Never hardcode or log this value.
   */
  WHATSAPP_ACCESS_TOKEN: string;

  /**
   * WhatsApp Business phone number ID (M7a).
   * The business number registered in Meta Business Manager.
   */
  WHATSAPP_PHONE_NUMBER_ID: string;

  /**
   * Telegram Bot API token (M7a).
   * Used for Telegram OTP delivery.
   * Never hardcode or log this value.
   */
  TELEGRAM_BOT_TOKEN: string;

  /**
   * Salt for hashing PII (BVN, NIN, phone) before storage (M7a).
   * Security Baseline R7: SHA-256(SALT + value) — never store raw BVN/NIN.
   * Never hardcode or log this value.
   */
  LOG_PII_SALT: string;

  /**
   * AES-GCM master key for DM encryption (M7c).
   * Platform Invariant P14 — assertDMMasterKey() called at startup validates presence.
   * Never hardcode or log this value. Optional in type; runtime enforced.
   */
  DM_MASTER_KEY?: string;

  /**
   * Comma-separated list of allowed CORS origins (M7b advisory fix).
   * Example: "https://app.webwaka.com,https://admin.webwaka.com"
   * Set via CF Dashboard / wrangler secret put ALLOWED_ORIGINS
   * Falls back to ['https://*.webwaka.com'] in production if not set.
   */
  ALLOWED_ORIGINS?: string;

  /**
   * WhatsApp provider selector (M7f).
   * '360dialog' routes WhatsApp OTPs via 360dialog Business API.
   * 'termii' (default) routes via Termii WA gateway or Meta Cloud.
   */
  WHATSAPP_PROVIDER?: '360dialog' | 'termii';

  /**
   * 360dialog API key (M7f).
   * Only required when WHATSAPP_PROVIDER = '360dialog'.
   * Set via: wrangler secret put DIALOG360_API_KEY
   */
  DIALOG360_API_KEY?: string;

  /**
   * Telegram webhook secret token (M7f).
   * Validates X-Telegram-Bot-Api-Secret-Token header on /telegram/webhook.
   * Set via: wrangler secret put TELEGRAM_WEBHOOK_SECRET (in apps/ussd-gateway)
   */
  TELEGRAM_WEBHOOK_SECRET?: string;

  /**
   * HMAC-SHA256 secret for signing price-lock tokens (T004).
   * Prevents tampering of negotiated price in checkout tokens.
   * Set via: wrangler secret put PRICE_LOCK_SECRET
   */
  PRICE_LOCK_SECRET?: string;

  /**
   * Public base URL of the platform app (T006).
   * Used to build Paystack callback URLs and other redirects.
   * Example: "https://app.webwaka.com"
   * Set via: wrangler secret put APP_BASE_URL (or vars in wrangler.toml)
   */
  APP_BASE_URL?: string;

  /**
   * DEV-04: Webhook URL for critical error rate alerting.
   * Receives POST with JSON payload when error rate exceeds threshold.
   * Supports Slack, Discord, PagerDuty, or generic webhook endpoints.
   * Set via: wrangler secret put ALERT_WEBHOOK_URL
   */
  ALERT_WEBHOOK_URL?: string;

  /**
   * PROD-05: Resend API key for transactional email delivery.
   * Powers welcome, purchase-receipt, workspace-invite, payment-confirmation emails.
   * Set via: wrangler secret put RESEND_API_KEY
   */
  RESEND_API_KEY?: string;

  /**
   * N-009 (OQ-002, Phase 2): CF Queue producer binding for notification events.
   * apps/api uses this as the producer; apps/notificator consumes.
   * Used by N-026 auth-routes to enqueue notification events via publishEvent().
   */
  NOTIFICATION_QUEUE?: Queue;

  /**
   * N-009 (OQ-002, Phase 2): Kill-switch for notification pipeline.
   * "1" = pipeline enabled (replace legacy EmailService with pipeline).
   * "0" = legacy EmailService path active (default until Phase 6 full rollout).
   */
  NOTIFICATION_PIPELINE_ENABLED?: '0' | '1';

  /**
   * N-039 (Phase 3): HMAC-SHA256 secret for unsubscribe token signing.
   * Used by TemplateRenderer (preview + test-send endpoints) to generate
   * cryptographically signed unsubscribe URLs injected into email bodies.
   * Set via: wrangler secret put UNSUBSCRIBE_HMAC_SECRET
   * Must be at least 32 characters (256-bit security).
   */
  UNSUBSCRIBE_HMAC_SECRET?: string;

  /**
   * N-039 (Phase 3): Platform API base URL for unsubscribe link generation.
   * Injected into email templates as the base of the unsubscribe endpoint.
   * Example: 'https://api.webwaka.com'
   * Defaults to 'https://api.webwaka.com' if unset.
   */
  PLATFORM_BASE_URL?: string;

  /**
   * N-052 (Phase 4): Resend webhook secret for Svix signature verification.
   * Provided by Resend in the webhook subscription settings page.
   * Format: "whsec_{base64}" or a raw secret string.
   * Set via: wrangler secret put RESEND_WEBHOOK_SECRET
   */
  RESEND_WEBHOOK_SECRET?: string;

  /**
   * N-048/N-055 (Phase 4): KV namespace for notification provider credentials (ADL-002).
   * Shared with apps/notificator NOTIFICATION_KV binding.
   * Used by N-055 to route system alerts through SlackWebhookChannel.
   */
  NOTIFICATION_KV?: KVNamespace;

  /**
   * HandyLife Wallet feature flags and configuration (WF-012).
   * Keys:
   *   wallet:flag:{feature}_enabled   — '1' | '0'
   *   wallet:eligible_tenants          — JSON array of tenant_id strings
   *   wallet:hitl_threshold_kobo       — integer string (default '10000000' = ₦100k)
   *   wallet:mla:commission_bps:{1|2|3} — integer string bps
   *   wallet:daily_limit_kobo:{tier}   — CBN daily limit override
   *   wallet:balance_cap_kobo:{tier}   — CBN balance cap override
   * Provision: wrangler kv namespace create WALLET_KV --env staging
   */
  WALLET_KV?: KVNamespace;
}
