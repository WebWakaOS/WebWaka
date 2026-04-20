/**
 * apps/notificator — Environment binding types.
 *
 * Defines all Cloudflare Workers bindings available to the notificator Worker.
 * Used as the Bindings type parameter for Hono and scheduled() handlers.
 *
 * N-008 (Phase 0): Initial env type scaffold.
 * N-012 (Phase 1): Queue consumer will add MessageBatch handling.
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

  /** CF Queue binding — consumer side (N-012). Producer is in apps/api. */
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

  /** Inter-service authentication secret (SEC-009) */
  INTER_SERVICE_SECRET: string;
}
