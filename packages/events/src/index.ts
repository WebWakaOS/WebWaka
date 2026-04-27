/**
 * @webwaka/events — Domain event bus (publisher + subscriber + projections).
 * Milestone 6 — Event Bus Layer
 * Notification Engine v2 — extended exports for N-001, N-011, N-060a
 */

export type {
  DomainEvent,
  EventType,
  NotificationEventSource,
  EntityCreatedPayload,
  ClaimAdvancedPayload,
  PaymentSuccessPayload,
  PaymentFailedPayload,
  SearchIndexedPayload,
  UserRegisteredPayload,
  UserPasswordResetPayload,
  UserLoginFailedPayload,
  UserAccountLockedPayload,
  UserInvitedPayload,
  BillingPaymentPayload,
  BillingSpendLimitPayload,
  BankTransferPayload,
  AiBudgetWarningPayload,
  AiHitlPayload,
  SystemProviderDownPayload,
  SystemQueueDlqPayload,
  VerticalEventPayload,
  WakaPageCreatedPayload,
  WakaPageViewedPayload,
  WakaPageLeadCapturedPayload,
} from './event-types.js';

export {
  EventType as EventTypes,  // backward-compat alias for the const object
  AuthEventType,
  WorkspaceEventType,
  BillingEventType,
  KycEventType,
  ClaimEventType,
  NegotiationEventType,
  SupportEventType,
  AiEventType,
  OnboardingEventType,
  PosFinanceEventType,
  SocialEventType,
  PartnerEventType,
  BankTransferEventType,
  B2bEventType,
  AirtimeEventType,
  TransportEventType,
  SystemEventType,
  VerticalEventType,
  WalletEventType,
  WakaPageEventType,
  LegacyEventType,
  SupportGroupEventType,
  FundraisingEventType,
} from './event-types.js';

export type { PublishEventParams, NotificationOutboxMessage, QueueLike } from './publisher.js';
export { publishEvent, getAggregateEvents } from './publisher.js';

export type { EventHandler } from './subscriber.js';
export {
  subscribe,
  dispatch,
  clearSubscriptions,
  handlerCount,
} from './subscriber.js';

export { rebuildSearchIndexFromEvents } from './projections/search.js';
export type { RebuildResult } from './projections/search.js';
