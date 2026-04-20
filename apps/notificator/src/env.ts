/**
 * apps/notificator — Environment binding types.
 *
 * Defines all Cloudflare Workers bindings available to the notificator Worker.
 * Used as the Bindings type parameter for Hono and scheduled() handlers.
 *
 * N-008 (Phase 0): Initial env type scaffold.
 * N-012 (Phase 1): Queue consumer will add MessageBatch handling.
 * N-042–N-049 (Phase 4): Channel-specific platform credentials added.
 * N-131 (Phase 4): NOTIFICATION_QUEUE is now producer+consumer (webhook_delivery retry).
 */

export interface Env {
  /** D1 database — shared with apps/api. All 16 notification tables live here. */
  DB: D1Database;

  /**
   * KV namespace for:
   *  - Preference reads (N-061: `{tenant_id}:pref:{user_id}:{channel}`)
   *  - Unread-count cache (N-067: `{tenant_id}:inbox:unread:{user_id}`)
   *  - AES-256-GCM encrypted provider credentials (G16 ADL-002)
   */
  NOTIFICATION_KV: KVNamespace;

  /** CF Queue binding — consumer side (N-012). Producer is in apps/api.
   *  Phase 4 (N-131): Also used as producer for webhook_delivery retry messages. */
  NOTIFICATION_QUEUE: Queue;

  /** Worker environment tag */
  ENVIRONMENT: 'development' | 'staging' | 'production';

  /**
   * G24 (OQ-012): "true" in all non-production environments.
   * When true, all deliveries are redirected to sandbox test addresses.
   * CI/CD governance check asserts 'false' on production deploy.
   */
  NOTIFICATION_SANDBOX_MODE: 'true' | 'false';

  /**
   * N-009 (OQ-002): Kill-switch for notification pipeline.
   * "1" = pipeline enabled; "0" = disabled (legacy EmailService path active).
   */
  NOTIFICATION_PIPELINE_ENABLED: '0' | '1';

  /**
   * N-009 (OQ-002): HITL legacy notification kill-switch.
   * "1" = apps/projections still handles HITL escalation dispatch.
   * "0" = NotificationService.raise() handles it (set in Phase 6, N-100a).
   */
  HITL_LEGACY_NOTIFICATIONS_ENABLED: '0' | '1';

  /**
   * Sandbox redirect addresses (G24 — OQ-012).
   * Only used when NOTIFICATION_SANDBOX_MODE = 'true'.
   * Set via: wrangler secret put NOTIFICATION_SANDBOX_EMAIL --env staging
   */
  NOTIFICATION_SANDBOX_EMAIL?: string;
  NOTIFICATION_SANDBOX_PHONE?: string;
  NOTIFICATION_SANDBOX_PUSH_TOKEN?: string;

  /**
   * AES-256-GCM master key for credential encryption (G16 — ADL-002).
   * Set via: wrangler secret put NOTIFICATION_KV_MASTER_KEY
   */
  NOTIFICATION_KV_MASTER_KEY?: string;

  /**
   * Resend API key for transactional email dispatch (N-025, Phase 2).
   * Used by ResendEmailChannel in NotificationService pipeline.
   * Set via: wrangler secret put RESEND_API_KEY --env staging
   */
  RESEND_API_KEY?: string;

  /**
   * HMAC-SHA256 secret for unsubscribe token signing (N-039, Phase 3).
   * Used by TemplateRenderer to generate signed unsubscribe URLs.
   * Set via: wrangler secret put UNSUBSCRIBE_HMAC_SECRET --env staging
   * Must be at least 32 characters (256-bit security).
   */
  UNSUBSCRIBE_HMAC_SECRET?: string;

  /**
   * Platform API base URL for unsubscribe link generation (N-039, Phase 3).
   * Example: 'https://api.webwaka.com'
   * Defaults to 'https://api.webwaka.com' if not set.
   */
  PLATFORM_BASE_URL?: string;

  /** Inter-service authentication secret (SEC-009) */
  INTER_SERVICE_SECRET: string;

  // -------------------------------------------------------------------------
  // Phase 4 (N-042–N-049) — Channel-specific platform credentials
  // All are optional: channels fall back to dev-skipped when absent.
  // Set via: wrangler secret put <VAR_NAME> --env staging
  // -------------------------------------------------------------------------

  /**
   * N-043: Termii SMS platform API key.
   * Fallback when no tenant-specific key is found in KV.
   * Set via: wrangler secret put TERMII_API_KEY --env staging
   */
  TERMII_API_KEY?: string;

  /**
   * N-043: Termii SMS platform sender ID (alphanumeric, max 11 chars).
   * Example: 'WebWaka'
   */
  TERMII_SENDER_ID?: string;

  /**
   * N-044: Meta WhatsApp Business API access token (Meta Graph API v19).
   * Fallback when no tenant-specific credentials in KV.
   * Set via: wrangler secret put META_WA_ACCESS_TOKEN --env staging
   */
  META_WA_ACCESS_TOKEN?: string;

  /**
   * N-044: Meta WhatsApp Business phone number ID.
   * The business number registered in Meta Business Manager.
   */
  META_WA_PHONE_NUMBER_ID?: string;

  /**
   * N-045: 360dialog WhatsApp platform API key.
   * Fallback when no tenant-specific key in KV.
   * Set via: wrangler secret put DIALOG360_API_KEY --env staging
   */
  DIALOG360_API_KEY?: string;

  /**
   * N-046: Telegram Bot API token.
   * Fallback when no tenant-specific token in KV.
   * Set via: wrangler secret put TELEGRAM_BOT_TOKEN --env staging
   */
  TELEGRAM_BOT_TOKEN?: string;

  /**
   * N-047: FCM v1 API access token (pre-generated from service account).
   * Phase 7 (N-107) upgrades to automatic rotation.
   * Set via: wrangler secret put FCM_ACCESS_TOKEN --env staging
   */
  FCM_ACCESS_TOKEN?: string;

  /**
   * N-047: Firebase project ID (e.g. 'webwaka-production').
   */
  FCM_PROJECT_ID?: string;

  /**
   * N-048/N-055: Slack incoming webhook URL for platform-level system alerts.
   * Used by N-055 to replace direct ALERT_WEBHOOK_URL HTTP calls.
   * Set via: wrangler secret put SLACK_ALERT_WEBHOOK_URL --env staging
   */
  SLACK_ALERT_WEBHOOK_URL?: string;

  /**
   * N-049: Microsoft Teams incoming webhook URL for system alerts.
   * Set via: wrangler secret put TEAMS_ALERT_WEBHOOK_URL --env staging
   */
  TEAMS_ALERT_WEBHOOK_URL?: string;

  /**
   * N-053b: Resend API key for domain verification polling.
   * Uses GET /domains/{id} endpoint to check verification status.
   * Can be the same as RESEND_API_KEY.
   */
  RESEND_API_KEY_FOR_DOMAIN_POLL?: string;
}
