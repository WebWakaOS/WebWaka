/**
 * @webwaka/vertical-events — Vertical-specific event helpers
 *
 * Phase 6 — Notification Engine N-096/N-097
 *
 * Provides:
 *   - Re-export of VerticalEventType from @webwaka/events (single import point)
 *   - Typed payload builder for all vertical notification events
 *   - Per-vertical event constants for common domain transitions
 *   - Source tagging helpers (api | ussd_gateway | cron | webhook)
 *
 * Usage:
 *   import { VerticalEventType, buildVerticalEvent } from '@webwaka/vertical-events';
 *
 *   void publishEvent(env, buildVerticalEvent({
 *     eventKey: VerticalEventType.VerticalRecordCreated,
 *     tenantId, actorId, workspaceId,
 *     vertical: 'pharmacy',
 *     recordType: 'prescription',
 *     recordId: rx.id,
 *   }));
 */

export {
  VerticalEventType,
  AiEventType,
  AuthEventType,
  WorkspaceEventType,
  BillingEventType,
  KycEventType,
  ClaimEventType,
  NegotiationEventType,
  SupportEventType,
  OnboardingEventType,
  PosFinanceEventType,
  SocialEventType,
  PartnerEventType,
  BankTransferEventType,
  B2bEventType,
  AirtimeEventType,
  TransportEventType,
  SystemEventType,
} from '@webwaka/events';

export type { VerticalEventPayload, NotificationEventSource } from '@webwaka/events';

// ---------------------------------------------------------------------------
// Source tag helper — maps runtime context to NotificationEventSource
// ---------------------------------------------------------------------------

export type VerticalSource = 'api' | 'ussd_gateway' | 'cron' | 'webhook';

// ---------------------------------------------------------------------------
// Vertical event payload builder — strongly-typed helper for route/cron use
// ---------------------------------------------------------------------------

export interface VerticalEventParams {
  eventId?: string;
  eventKey: string;
  tenantId: string;
  actorId: string;
  actorType?: 'user' | 'system' | 'partner';
  workspaceId?: string;
  vertical: string;
  recordType: string;
  recordId?: string;
  source?: VerticalSource;
  severity?: 'info' | 'warning' | 'high' | 'critical';
  extra?: Record<string, unknown>;
}

export function buildVerticalEvent(params: VerticalEventParams) {
  return {
    eventId: params.eventId ?? crypto.randomUUID(),
    eventKey: params.eventKey,
    tenantId: params.tenantId,
    actorId: params.actorId,
    actorType: params.actorType ?? 'user',
    workspaceId: params.workspaceId,
    payload: {
      vertical: params.vertical,
      record_type: params.recordType,
      record_id: params.recordId ?? null,
      ...params.extra,
    },
    source: params.source ?? 'api',
    severity: params.severity ?? 'info',
  } as const;
}

// ---------------------------------------------------------------------------
// Vertical-specific event key constants (common FSM transitions)
// Callers can import these for consistent event keys across vertical routes.
// ---------------------------------------------------------------------------

export const VerticalRecordEvents = {
  created:     'vertical.record_created',
  updated:     'vertical.record_updated',
  deleted:     'vertical.record_deleted',
  staffed:     'vertical.staff_assigned',
  paid:        'vertical.payment_received',
  completed:   'vertical.service_completed',
  booked:      'vertical.appointment_booked',
  stockLow:    'vertical.stock_low',
} as const;

// ---------------------------------------------------------------------------
// USSD gateway source tag helper
// Use in ussd-gateway worker to tag events originating from USSD sessions.
// ---------------------------------------------------------------------------

export function ussdSource(): VerticalSource {
  return 'ussd_gateway';
}
