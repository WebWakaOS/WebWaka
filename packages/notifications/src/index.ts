/**
 * @webwaka/notifications — Core notification service package.
 *
 * Phase 0 skeleton: exports interfaces and kill-switch.
 * Implementations are added progressively in Phases 1-8.
 *
 * Public API surface:
 *  - INotificationChannel    — channel provider contract (G13)
 *  - ITemplateRenderer       — template rendering contract (G14, G18)
 *  - IPreferenceStore        — preference inheritance contract (G22)
 *  - KillSwitch              — pipeline enable gate (N-009, OQ-002)
 *  - createKillSwitch()      — factory for the kill-switch
 *  - All shared types
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
