/**
 * @webwaka/notifications — Core notification service package.
 *
 * Phase 2: Full service layer — rule engine, audience resolution, delivery
 * persistence, in-app channel, Resend email channel, audit logging, suppression.
 *
 * Public API surface:
 *   INotificationChannel    — channel provider contract (G13)
 *   ITemplateRenderer       — template rendering contract (G14, G18)
 *   IPreferenceStore        — preference inheritance contract (G22)
 *   KillSwitch              — pipeline enable gate (N-009, OQ-002)
 *   createKillSwitch()      — factory for the kill-switch
 *   processEvent()          — core pipeline orchestrator (N-020, Phase 2)
 *   loadMatchingRules()     — rule engine (N-021)
 *   resolveAudience()       — audience resolver (N-022)
 *   createDeliveryRow()     — delivery persistence (N-023)
 *   InAppChannel            — in-app channel (N-024)
 *   ResendEmailChannel      — email channel (N-025)
 *   checkSuppression()      — suppression service (N-029, G20)
 *   addSuppression()        — add hard suppression
 *   writeAuditLog()         — audit service (N-027, G9)
 *   All shared types
 */

export type {
  NotificationChannel,
  NotificationSeverity,
  NotificationStatus,
  TemplateLocale,
  TemplateStatus,
  WhatsAppApprovalStatus,
  PreferenceScope,
  DispatchContext,
  DispatchResult,
  RenderedTemplate,
  RenderRequest,
  ResolvedPreference,
  SuppressionCheckResult,
  AuditLogEntry,
  AuditEventType,
  SandboxRecipient,
  TemplateVariableSchema,
  NotificationRaiseParams,
  KillSwitch,
  KillSwitchConfig,
  INotificationChannel,
  ITemplateRenderer,
  IPreferenceStore,
} from './types.js';

export { createKillSwitch, EnvKillSwitch } from './kill-switch.js';

// Phase 2 additions
export type { D1BoundStatement, D1Statement, D1LikeFull } from './db-types.js';
export { sha256hex, computeIdempotencyKey, computeSuppressionHash } from './crypto-utils.js';

export type { NotificationRuleRow } from './rule-engine.js';
export { loadMatchingRules, evaluateRule, parseChannels } from './rule-engine.js';

export type { RecipientInfo, AudienceContext } from './audience-resolver.js';
export {
  resolveAudience,
  lookupRecipientEmail,
  deduplicateRecipients,
} from './audience-resolver.js';

export type { CreateDeliveryParams, UpdateDeliveryParams } from './delivery-service.js';
export {
  createDeliveryRow,
  updateDeliveryStatus,
  updateDeliveredByProviderMessageId,
  markNotifEventProcessed,
} from './delivery-service.js';

export { writeAuditLog } from './audit-service.js';

export type { AddSuppressionParams } from './suppression-service.js';
export { checkSuppression, addSuppression } from './suppression-service.js';

export type { Phase2RenderedOutput } from './phase2-renderer.js';
export { renderPhase2, buildRenderedTemplate } from './phase2-renderer.js';

export { InAppChannel } from './channels/in-app-channel.js';
export type { ResendEmailChannelOptions } from './channels/resend-channel.js';
export { ResendEmailChannel } from './channels/resend-channel.js';

// Phase 4 channels (N-043–N-049)
export type { TermiiSmsChannelOptions } from './channels/termii-sms-channel.js';
export { TermiiSmsChannel } from './channels/termii-sms-channel.js';
export type { MetaWhatsAppChannelOptions } from './channels/meta-whatsapp-channel.js';
export { MetaWhatsAppChannel } from './channels/meta-whatsapp-channel.js';
export type { Dialog360WhatsAppChannelOptions } from './channels/dialog360-whatsapp-channel.js';
export { Dialog360WhatsAppChannel } from './channels/dialog360-whatsapp-channel.js';
export type { TelegramChannelOptions } from './channels/telegram-channel.js';
export { TelegramChannel } from './channels/telegram-channel.js';
export type { FcmPushChannelOptions } from './channels/fcm-push-channel.js';
export { FcmPushChannel } from './channels/fcm-push-channel.js';
export type { SlackWebhookChannelOptions } from './channels/slack-webhook-channel.js';
export { SlackWebhookChannel } from './channels/slack-webhook-channel.js';
export type { TeamsWebhookChannelOptions } from './channels/teams-webhook-channel.js';
export { TeamsWebhookChannel } from './channels/teams-webhook-channel.js';

export type { ProcessEventParams, SandboxConfig, Phase5Config } from './notification-service.js';
export { processEvent } from './notification-service.js';

// Phase 5 additions (N-060–N-064)
export type { KVLike } from './preference-service.js';
export {
  PreferenceService,
  buildPrefCacheKey,
  mergePreferenceRows,
  applyOverrides,
} from './preference-service.js';

export type { QuietHoursConfig } from './quiet-hours.js';
export { isInQuietHours, computeQueueDelayMs, QuietHoursService } from './quiet-hours.js';

export type {
  DigestBatchChannel,
  DigestWindowType,
  FindOrCreateDigestBatchParams,
  AddToDigestBatchParams,
} from './digest-service.js';
export { DigestService } from './digest-service.js';

export type { ProcessDigestBatchOptions } from './digest-engine.js';
export { processDigestBatch } from './digest-engine.js';

// Phase 3 additions (N-030–N-041, N-033a)
export type { TemplateRendererOptions } from './template-renderer.js';
export {
  TemplateRenderer,
  TemplateNotFoundError,
  TemplateVariableError,
  WhatsAppNotApprovedError,
  TemplateUrlValidationError,
  publishTemplate,
  findTemplate,
} from './template-renderer.js';

export type { WrapEmailOptions, WrappedEmail } from './email-wrapper.js';
export { wrapEmail, htmlToPlainText } from './email-wrapper.js';

export type { LegalFooterOptions, DataTableRow, AlertBoxType } from './partials.js';
export {
  renderCtaButton,
  renderDataTable,
  renderAlertBox,
  renderLegalFooter,
  renderOtpDisplay,
  escapeHtml,
  escapeAttr,
} from './partials.js';

export type { UnsubscribeChannel, UnsubscribePayload, VerifyResult } from './unsubscribe.js';
export {
  signUnsubscribeToken,
  verifyUnsubscribeToken,
  generateUnsubscribeUrl,
} from './unsubscribe.js';

export type { D1RunMeta } from './db-types.js';

// Phase 7 additions (N-110)
export type { BounceRateOptions, BounceAnomalyResult } from './anomaly-alerts.js';
export { checkBounceRateAnomalies } from './anomaly-alerts.js';
