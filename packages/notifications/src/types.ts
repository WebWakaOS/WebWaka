/**
 * @webwaka/notifications — Core TypeScript interfaces and types.
 *
 * Task N-003 (Phase 0): Define INotificationChannel, ITemplateRenderer,
 * IPreferenceStore, and KillSwitch contracts.
 *
 * These interfaces form the non-negotiable contract layer for the notification
 * engine. All Phase 1-9 implementations must satisfy these contracts.
 *
 * Guardrails enforced by this file:
 *  G1  — tenant_id required on all operations
 *  G5  — transaction OTPs must use SMS only (enforced in channel routing)
 *  G7  — idempotency key required for all sends
 *  G13 — provider abstraction must be complete
 *  G14 — template variables must be schema-validated
 *  G16 — credentials in KV never D1 (ADL-002)
 */

import type { NotificationEventSource } from '@webwaka/events';

// ---------------------------------------------------------------------------
// Notification channel types
// ---------------------------------------------------------------------------

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app' | 'telegram' | 'slack' | 'webhook';

export type NotificationSeverity = 'info' | 'warning' | 'critical';

export type NotificationStatus =
  | 'queued'
  | 'rendering'
  | 'dispatched'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'failed'
  | 'suppressed'
  | 'dead_lettered';

export type TemplateLocale = 'en' | 'ha' | 'yo' | 'ig' | 'pcm' | 'fr';

export type TemplateStatus = 'draft' | 'active' | 'deprecated';

export type WhatsAppApprovalStatus =
  | 'not_required'
  | 'pending_meta_approval'
  | 'meta_approved'
  | 'meta_rejected';

// ---------------------------------------------------------------------------
// Dispatch context — passed to every channel dispatch call
// ---------------------------------------------------------------------------

export interface DispatchContext {
  deliveryId: string;
  tenantId: string;                         // G1: always required
  workspaceId?: string;
  recipientId: string;
  recipientType: 'user' | 'admin' | 'system';
  channel: NotificationChannel;
  template: RenderedTemplate;
  idempotencyKey: string;                   // G7: required for all sends
  correlationId?: string;                   // N-011: distributed tracing
  source: NotificationEventSource;          // N-060a: USSD bypass (G21)
  severity: NotificationSeverity;
  sandboxMode: boolean;                     // G24: redirect to test address if true
  sandboxRecipient?: SandboxRecipient;
}

// ---------------------------------------------------------------------------
// Sandbox redirect address set (G24 — OQ-012)
// ---------------------------------------------------------------------------

export interface SandboxRecipient {
  email?: string;
  phone?: string;
  pushToken?: string;
}

// ---------------------------------------------------------------------------
// Rendered template — output of ITemplateRenderer.render()
// ---------------------------------------------------------------------------

export interface RenderedTemplate {
  subject?: string;
  body: string;
  bodyPlainText?: string;             // N-038: auto-generated plain-text
  preheader?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  locale: TemplateLocale;
  templateId: string;
  templateVersion: number;
}

// ---------------------------------------------------------------------------
// Dispatch result — returned by INotificationChannel.dispatch()
// ---------------------------------------------------------------------------

export interface DispatchResult {
  success: boolean;
  providerMessageId?: string;
  lastError?: string;
  senderFallbackUsed?: boolean;       // G3/OQ-004: platform sender used
  sandboxRedirect?: boolean;          // G24: redirected to sandbox address
  sandboxOriginalRecipientHash?: string;
}

// ---------------------------------------------------------------------------
// INotificationChannel — G13: all provider specifics behind this interface
// ---------------------------------------------------------------------------

/**
 * Core channel provider interface.
 * Every channel (email, SMS, WhatsApp, push, in_app, telegram, slack, webhook)
 * must implement this contract. No channel-specific code may appear in business
 * logic outside of INotificationChannel implementations.
 *
 * @see G13 — Provider Abstraction Must Be Complete
 */
export interface INotificationChannel {
  readonly channel: NotificationChannel;
  readonly providerName: string;

  /**
   * Dispatch a rendered notification to the recipient.
   * MUST check sandbox mode and redirect if G24 applies.
   * MUST record sender_fallback_used if G3 applies.
   * MUST check suppression list before dispatching (G20).
   */
  dispatch(ctx: DispatchContext): Promise<DispatchResult>;

  /**
   * Check if this channel is available for the given workspace entitlement.
   * @see G19 — Channel Dispatch Respects Entitlement Tier
   */
  isEntitled(workspacePlan: string): boolean;
}

// ---------------------------------------------------------------------------
// Template variable schema — G14
// ---------------------------------------------------------------------------

export interface TemplateVariableSchema {
  required: string[];
  optional: string[];
  properties: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'url' | 'currency_kobo';
    description: string;
    maxLength?: number;
    sensitive?: boolean;    // never log; never pass raw to templates
  }>;
}

// ---------------------------------------------------------------------------
// Template render request
// ---------------------------------------------------------------------------

export interface RenderRequest {
  templateFamily: string;
  channel: NotificationChannel;
  locale: TemplateLocale;
  tenantId?: string;                  // null = use platform default template
  workspaceId?: string;
  variables: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// ITemplateRenderer — G14: validates variables; G18: uses @webwaka/i18n
// ---------------------------------------------------------------------------

/**
 * Template renderer interface.
 * Resolves template (tenant override > platform default), validates variables
 * against schema (G14), applies brand context (G4), and renders output.
 *
 * @see G14 — Template Variables Must Be Schema-Validated
 * @see G18 — Locale Resolution Must Use @webwaka/i18n
 */
export interface ITemplateRenderer {
  /**
   * Render a template for a given channel and locale.
   * Throws if required variables are missing (G14: fail loudly).
   */
  render(request: RenderRequest): Promise<RenderedTemplate>;

  /**
   * Preview a template without dispatching (N-036).
   * Used by platform-admin preview endpoint.
   */
  preview(request: RenderRequest): Promise<RenderedTemplate>;
}

// ---------------------------------------------------------------------------
// Preference scope
// ---------------------------------------------------------------------------

export type PreferenceScope = 'platform' | 'tenant' | 'role' | 'user';

export interface ResolvedPreference {
  enabled: boolean;
  quietHoursStart?: number;           // hour 0-23 in scope timezone
  quietHoursEnd?: number;
  timezone: string;                   // default: 'Africa/Lagos'
  digestWindow: 'none' | 'hourly' | 'daily' | 'weekly';
  lowDataMode: boolean;               // G22: OQ-011
}

// ---------------------------------------------------------------------------
// IPreferenceStore — 4-level inheritance + USSD + low_data_mode
// ---------------------------------------------------------------------------

/**
 * Preference resolution interface.
 * Resolves: platform → tenant → role → user (most specific wins).
 * KV-cached with tenant-prefixed keys (G1: `{tenant_id}:pref:`).
 *
 * @see G22 — Low-Data Mode Channel Restrictions
 * @see G21 — USSD-Origin Notifications Use SMS Immediately
 */
export interface IPreferenceStore {
  /**
   * Resolve effective preference for a user+channel combination.
   * Applies 4-level inheritance: platform → tenant → role → user.
   * Applies USSD-origin override (G21).
   * Applies low_data_mode restrictions (G22).
   */
  resolve(
    tenantId: string,
    userId: string,
    channel: NotificationChannel,
    source: NotificationEventSource,
  ): Promise<ResolvedPreference>;

  /**
   * Record a preference change to the audit log (G9).
   */
  update(
    tenantId: string,
    userId: string,
    scope: PreferenceScope,
    channel: NotificationChannel,
    patch: Partial<ResolvedPreference>,
    actorId: string,
  ): Promise<void>;
}

// ---------------------------------------------------------------------------
// KillSwitch — NOTIFICATION_PIPELINE_ENABLED gate
// ---------------------------------------------------------------------------

/**
 * Kill-switch interface.
 * All NotificationService.raise() calls must check this before enqueueing.
 * When disabled, the notification pipeline is bypassed entirely.
 * Used in conjunction with HITL_LEGACY_NOTIFICATIONS_ENABLED in apps/projections.
 *
 * @see N-009 (OQ-002)
 */
export interface KillSwitch {
  /** Returns true when the notification pipeline is active. */
  isEnabled(): boolean;
}

export interface KillSwitchConfig {
  /** NOTIFICATION_PIPELINE_ENABLED env var value — "1" = enabled, "0" = disabled */
  notificationPipelineEnabled: string;
  /** HITL_LEGACY_NOTIFICATIONS_ENABLED env var value — see apps/projections */
  hitlLegacyNotificationsEnabled: string;
}

// ---------------------------------------------------------------------------
// NotificationRaiseParams — input to NotificationService.raise()
// ---------------------------------------------------------------------------

/**
 * Parameters for raising a notification event.
 * Used by all business routes that emit notifications (Phase 6+).
 */
export interface NotificationRaiseParams {
  eventKey: string;
  tenantId: string;
  workspaceId?: string;
  actorId?: string;
  actorType: 'user' | 'system' | 'admin' | 'unknown';
  subjectType?: string;
  subjectId?: string;
  payload: Record<string, unknown>;
  correlationId?: string;
  source?: NotificationEventSource;
  severity?: NotificationSeverity;
}

// ---------------------------------------------------------------------------
// Suppression check result
// ---------------------------------------------------------------------------

export interface SuppressionCheckResult {
  suppressed: boolean;
  reason?: 'bounced' | 'unsubscribed' | 'complaint' | 'admin_block';
}

// ---------------------------------------------------------------------------
// Audit log entry
// ---------------------------------------------------------------------------

export type AuditEventType =
  | 'notification.sent'
  | 'notification.failed'
  | 'notification.suppressed'
  | 'notification.dead_lettered'
  | 'preference.changed'
  | 'unsubscribe';

export interface AuditLogEntry {
  tenantId: string;
  eventType: AuditEventType;
  actorId?: string;                   // G23: zeroed to 'ERASED' on NDPR erasure
  recipientId?: string;               // G23: zeroed to 'ERASED' on NDPR erasure
  channel?: NotificationChannel;
  notificationEventId?: string;
  deliveryId?: string;
  metadata?: Record<string, unknown>;
}
