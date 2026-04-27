/**
 * Domain event type catalogue for WebWaka OS event bus.
 * All events follow: {aggregate, aggregate_id, event_type, tenant_id, payload, version}
 *
 * Notification Engine v2 — expanded from 16 to 122+ canonical event keys.
 * Tasks N-001 and N-010. Supersedes all prior event-type constants.
 *
 * Categories:
 *  - Auth/Identity (15 events)
 *  - Workspace (11 events)
 *  - Billing (12 events)
 *  - KYC/Identity Verification (6 events)
 *  - Claims (8 events)
 *  - Negotiation (7 events)
 *  - Support Tickets (5 events)
 *  - AI / SuperAgent (9 events)
 *  - Onboarding (3 events)
 *  - POS / Finance (4 events)
 *  - Social / Community (5 events)
 *  - Partner Ecosystem (6 events)
 *  - Bank Transfer FSM (7 events)
 *  - B2B Marketplace (6 events)
 *  - Airtime (3 events)
 *  - Transport FSM (5 events)
 *  - System / Platform (3 events)
 *  - Canonical Vertical (8 events)
 *  - Legacy (search/profile/entity/payment — preserved for backwards compatibility)
 */

// ---------------------------------------------------------------------------
// Auth / Identity Lifecycle (15 events)
// ---------------------------------------------------------------------------

export const AuthEventType = {
  UserRegistered:             'auth.user.registered',
  UserEmailVerified:          'auth.user.email_verified',
  UserPhoneVerified:          'auth.user.phone_verified',
  UserLoginSuccess:           'auth.user.login_success',
  UserLoginFailed:            'auth.user.login_failed',
  UserLogout:                 'auth.user.logout',
  UserPasswordResetRequested: 'auth.user.password_reset_requested',
  UserPasswordChanged:        'auth.user.password_changed',
  UserAccountLocked:          'auth.user.account_locked',
  UserAccountUnlocked:        'auth.user.account_unlocked',
  UserMfaEnabled:             'auth.user.mfa_enabled',
  UserMfaDisabled:            'auth.user.mfa_disabled',
  UserDeleted:                'auth.user.deleted',
  UserProfileUpdated:             'auth.user.profile_updated',
  UserInvited:                    'auth.user.invited',
  UserInviteAccepted:             'auth.user.invite_accepted',
  UserEmailVerificationSent:      'auth.user.email_verification_sent',
} as const;

// ---------------------------------------------------------------------------
// Workspace (11 events)
// ---------------------------------------------------------------------------

export const WorkspaceEventType = {
  WorkspaceCreated:          'workspace.created',
  WorkspaceActivated:        'workspace.activated',
  WorkspaceSuspended:        'workspace.suspended',
  WorkspaceDeprovisioned:    'workspace.deprovisioned',
  WorkspaceInviteSent:       'workspace.invite_sent',
  WorkspaceInviteAccepted:   'workspace.invite_accepted',
  WorkspaceMemberRemoved:    'workspace.member_removed',
  WorkspaceRoleChanged:      'workspace.role_changed',
  WorkspacePlanUpgraded:     'workspace.plan_upgraded',
  WorkspacePlanDowngraded:   'workspace.plan_downgraded',
  WorkspaceSettingsChanged:  'workspace.settings_changed',
} as const;

// ---------------------------------------------------------------------------
// Billing (12 events)
// ---------------------------------------------------------------------------

export const BillingEventType = {
  BillingSubscriptionCreated:   'billing.subscription_created',
  BillingSubscriptionRenewed:   'billing.subscription_renewed',
  BillingSubscriptionCancelled: 'billing.subscription_cancelled',
  BillingPaymentSucceeded:      'billing.payment_succeeded',
  BillingPaymentFailed:         'billing.payment_failed',
  BillingInvoiceGenerated:      'billing.invoice_generated',
  BillingTrialStarted:          'billing.trial_started',
  BillingTrialEnding:           'billing.trial_ending',
  BillingTrialExpired:          'billing.trial_expired',
  BillingRefundIssued:          'billing.refund_issued',
  BillingCreditApplied:         'billing.credit_applied',
  BillingSpendLimitReached:     'billing.spend_limit_reached',
} as const;

// ---------------------------------------------------------------------------
// KYC / Identity Verification (6 events)
// ---------------------------------------------------------------------------

export const KycEventType = {
  KycSubmitted:               'kyc.submitted',
  KycApproved:                'kyc.approved',
  KycRejected:                'kyc.rejected',
  KycResubmissionRequired:    'kyc.resubmission_required',
  IdentityVerified:           'identity.verified',
  IdentityVerificationFailed: 'identity.verification_failed',
} as const;

// ---------------------------------------------------------------------------
// Claims (8 events — includes claim.advanced from legacy)
// ---------------------------------------------------------------------------

export const ClaimEventType = {
  ClaimIntentCaptured: 'claim.intent_captured',
  ClaimSubmitted:      'claim.submitted',
  ClaimAdvanced:       'claim.advanced',
  ClaimApproved:       'claim.approved',
  ClaimRejected:       'claim.rejected',
  ClaimEscalated:      'claim.escalated',
  ClaimWithdrawn:      'claim.withdrawn',
  ClaimExpired:        'claim.expired',
} as const;

// ---------------------------------------------------------------------------
// Negotiation (7 events)
// ---------------------------------------------------------------------------

export const NegotiationEventType = {
  NegotiationSessionStarted: 'negotiation.session_started',
  NegotiationOfferMade:      'negotiation.offer_made',
  NegotiationCounterOffered: 'negotiation.counter_offered',
  NegotiationAccepted:       'negotiation.accepted',
  NegotiationRejected:       'negotiation.rejected',
  NegotiationWithdrawn:      'negotiation.withdrawn',
  NegotiationSessionExpired: 'negotiation.session_expired',
} as const;

// ---------------------------------------------------------------------------
// Support Tickets (5 events)
// ---------------------------------------------------------------------------

export const SupportEventType = {
  SupportTicketCreated:  'support.ticket_created',
  SupportTicketAssigned: 'support.ticket_assigned',
  SupportTicketReplied:  'support.ticket_replied',
  SupportTicketResolved: 'support.ticket_resolved',
  SupportTicketClosed:   'support.ticket_closed',
} as const;

// ---------------------------------------------------------------------------
// AI / SuperAgent (9 events)
// ---------------------------------------------------------------------------

export const AiEventType = {
  AiRequestSubmitted:   'ai.request_submitted',
  AiResponseGenerated:  'ai.response_generated',
  AiResponseFailed:     'ai.response_failed',
  AiHitlRequired:       'ai.hitl_required',
  AiHitlApproved:       'ai.hitl_approved',
  AiHitlExecuted:       'ai.hitl_executed',
  AiHitlRequestExpired: 'ai.hitl_request_expired',
  AiHitlEscalatedToL3:  'ai.hitl_escalated_to_l3',
  AiConsentGranted:     'ai.consent_granted',
  AiBudgetWarning:      'ai.budget_warning',
  AiBudgetExhausted:    'ai.budget_exhausted',
  AiToolCallExecuted:   'ai.tool_call_executed',
} as const;

// ---------------------------------------------------------------------------
// Onboarding (3 events)
// ---------------------------------------------------------------------------

export const OnboardingEventType = {
  OnboardingStarted:   'onboarding.started',
  OnboardingCompleted: 'onboarding.completed',
  OnboardingStalled:   'onboarding.stalled',
} as const;

// ---------------------------------------------------------------------------
// POS / Finance (4 events)
// ---------------------------------------------------------------------------

export const PosFinanceEventType = {
  PosSaleCompleted:         'pos.sale_completed',
  PosFloatCredited:         'pos.float_credited',
  PosFloatDebited:          'pos.float_debited',
  PosFloatReversed:         'pos.float_reversed',
  FinanceTransferInitiated: 'finance.transfer_initiated',
  FinanceTransferCompleted: 'finance.transfer_completed',
  FinanceTransferFailed:    'finance.transfer_failed',
} as const;

// ---------------------------------------------------------------------------
// Social / Community (5 events)
// ---------------------------------------------------------------------------

export const SocialEventType = {
  SocialPostPublished:       'social.post_published',
  SocialCommentAdded:        'social.comment_added',
  SocialFollowCreated:       'social.follow_created',
  CommunityMemberJoined:     'community.member_joined',
  CommunityEventScheduled:   'community.event_scheduled',
  CommunityAnnouncementSent: 'community.announcement_sent',
} as const;

// ---------------------------------------------------------------------------
// Support Groups (14 events)
// ---------------------------------------------------------------------------

export const SupportGroupEventType = {
  SupportGroupCreated:            'support_group.created',
  SupportGroupUpdated:            'support_group.updated',
  SupportGroupArchived:           'support_group.archived',
  SupportGroupMemberJoined:       'support_group.member_joined',
  SupportGroupMemberApproved:     'support_group.member_approved',
  SupportGroupMemberSuspended:    'support_group.member_suspended',
  SupportGroupBroadcastSent:      'support_group.broadcast_sent',
  SupportGroupMeetingScheduled:   'support_group.meeting_scheduled',
  SupportGroupMeetingCompleted:   'support_group.meeting_completed',
  SupportGroupResolutionRecorded: 'support_group.resolution_recorded',
  SupportGroupEventCreated:       'support_group.event_created',
  SupportGroupGotvRecorded:       'support_group.gotv_recorded',
  SupportGroupGotvVoteConfirmed:  'support_group.gotv_vote_confirmed',
  SupportGroupPetitionOpened:     'support_group.petition_opened',
  SupportGroupPetitionSigned:     'support_group.petition_signed',
} as const;

// ---------------------------------------------------------------------------
// Fundraising (12 events)
// ---------------------------------------------------------------------------

export const FundraisingEventType = {
  FundraisingCampaignCreated:        'fundraising.campaign_created',
  FundraisingCampaignApproved:       'fundraising.campaign_approved',
  FundraisingCampaignRejected:       'fundraising.campaign_rejected',
  FundraisingCampaignCompleted:      'fundraising.campaign_completed',
  FundraisingContributionReceived:   'fundraising.contribution_received',
  FundraisingContributionConfirmed:  'fundraising.contribution_confirmed',
  FundraisingContributionFailed:     'fundraising.contribution_failed',
  FundraisingPledgeCreated:          'fundraising.pledge_created',
  FundraisingMilestoneReached:       'fundraising.milestone_reached',
  FundraisingUpdatePosted:           'fundraising.update_posted',
  FundraisingPayoutRequested:        'fundraising.payout_requested',
  FundraisingPayoutApproved:         'fundraising.payout_approved',
  FundraisingPayoutRejected:         'fundraising.payout_rejected',
} as const;

// ---------------------------------------------------------------------------
// Partner Ecosystem (6 events)
// ---------------------------------------------------------------------------

export const PartnerEventType = {
  PartnerOnboarded:            'partner.onboarded',
  PartnerApplicationSubmitted: 'partner.application_submitted',
  PartnerApplicationApproved:  'partner.application_approved',
  PartnerApplicationRejected:  'partner.application_rejected',
  PartnerCommissionEarned:     'partner.commission_earned',
  PartnerSubPartnerCreated:    'partner.sub_partner_created',
} as const;

// ---------------------------------------------------------------------------
// Bank Transfer FSM (7 events)
// ---------------------------------------------------------------------------

export const BankTransferEventType = {
  BankTransferInitiated:   'bank_transfer.initiated',
  BankTransferProcessing:  'bank_transfer.processing',
  BankTransferCompleted:   'bank_transfer.completed',
  BankTransferFailed:      'bank_transfer.failed',
  BankTransferCancelled:   'bank_transfer.cancelled',
  BankTransferAwaitingOtp: 'bank_transfer.awaiting_otp',
  BankTransferOtpVerified: 'bank_transfer.otp_verified',
} as const;

// ---------------------------------------------------------------------------
// B2B Marketplace (6 events)
// ---------------------------------------------------------------------------

export const B2bEventType = {
  B2bRfqCreated:    'b2b.rfq_created',
  B2bBidSubmitted:  'b2b.bid_submitted',
  B2bBidAccepted:   'b2b.bid_accepted',
  B2bPoIssued:      'b2b.po_issued',
  B2bPoDelivered:   'b2b.po_delivered',
  B2bInvoiceRaised: 'b2b.invoice_raised',
  B2bDisputeRaised: 'b2b.dispute_raised',
} as const;

// ---------------------------------------------------------------------------
// Airtime (3 events)
// ---------------------------------------------------------------------------

export const AirtimeEventType = {
  AirtimePurchaseInitiated: 'airtime.purchase_initiated',
  AirtimePurchaseCompleted: 'airtime.purchase_completed',
  AirtimePurchaseFailed:    'airtime.purchase_failed',
} as const;

// ---------------------------------------------------------------------------
// Transport FSM (5 events)
// ---------------------------------------------------------------------------

export const TransportEventType = {
  TransportBookingCreated:   'transport.booking_created',
  TransportBookingConfirmed: 'transport.booking_confirmed',
  TransportTripStarted:      'transport.trip_started',
  TransportTripCompleted:    'transport.trip_completed',
  TransportBookingCancelled: 'transport.booking_cancelled',
} as const;

// ---------------------------------------------------------------------------
// System / Platform (3 events)
// ---------------------------------------------------------------------------

export const SystemEventType = {
  SystemProviderDown:     'system.provider_down',
  SystemQueueDlqItem:     'system.queue_dlq_item',
  SystemDailyDigestSweep: 'system.daily_digest_sweep',
} as const;

// ---------------------------------------------------------------------------
// Canonical Vertical (8 events — N-096/N-097; used across all 160+ verticals)
// ---------------------------------------------------------------------------

export const VerticalEventType = {
  VerticalRecordCreated:     'vertical.record_created',
  VerticalRecordUpdated:     'vertical.record_updated',
  VerticalRecordDeleted:     'vertical.record_deleted',
  VerticalStaffAssigned:     'vertical.staff_assigned',
  VerticalPaymentReceived:   'vertical.payment_received',
  VerticalServiceCompleted:  'vertical.service_completed',
  VerticalAppointmentBooked: 'vertical.appointment_booked',
  VerticalStockLow:          'vertical.stock_low',
} as const;

// ---------------------------------------------------------------------------
// Wallet event types — HandyLife Wallet (WF-001 – WF-056)
// P-wallet: user-level NGN wallet, offline-bank-funded, tenant-scoped.
// ---------------------------------------------------------------------------

export const WalletEventType = {
  WalletFundingRequested:     'wallet.funding.requested',
  WalletFundingProofSubmitted:'wallet.funding.proof_submitted',
  WalletFundingConfirmed:     'wallet.funding.confirmed',
  WalletFundingRejected:      'wallet.funding.rejected',
  WalletFundingExpired:       'wallet.funding.expired',
  WalletSpendCompleted:       'wallet.spend.completed',
  WalletBalanceLow:           'wallet.balance.low',
  WalletKycUpgradeRequired:   'wallet.kyc.upgrade_required',
  WalletMlaEarned:            'wallet.mla.earned',
  WalletMlaCredited:          'wallet.mla.credited',
  WalletTransferDisabled:     'wallet.transfer.disabled',
  WalletWithdrawalDisabled:   'wallet.withdrawal.disabled',
  WalletAdminFrozen:          'wallet.admin.frozen',
  WalletAdminUnfrozen:        'wallet.admin.unfrozen',
  WalletFundingHitlRequired:  'wallet.funding.hitl_required',
} as const;

// ---------------------------------------------------------------------------
// WakaPage (Smart Profile / Public Page Builder) — Phase 0 foundation
// Namespace: wakapage.*
// Added: Phase 0 ADR-0041
// ---------------------------------------------------------------------------

export const WakaPageEventType = {
  // Page lifecycle
  WakaPageCreated:          'wakapage.page.created',
  WakaPagePublished:        'wakapage.page.published',
  WakaPageUnpublished:      'wakapage.page.unpublished',
  WakaPageDeleted:          'wakapage.page.deleted',
  WakaPageSlugChanged:      'wakapage.page.slug_changed',
  // Block management
  WakaPageBlockAdded:       'wakapage.block.added',
  WakaPageBlockUpdated:     'wakapage.block.updated',
  WakaPageBlockRemoved:     'wakapage.block.removed',
  WakaPageBlockReordered:   'wakapage.block.reordered',
  // Public surface engagement (analytics)
  WakaPageViewed:           'wakapage.page.viewed',
  WakaPageBlockClicked:     'wakapage.block.clicked',
  WakaPageLeadCaptured:     'wakapage.lead.captured',
  // Template & theme
  WakaPageTemplateApplied:  'wakapage.template.applied',
  WakaPageThemeUpdated:     'wakapage.theme.updated',
  // QR / share
  WakaPageQrGenerated:      'wakapage.qr.generated',
  WakaPageShareLinkCopied:  'wakapage.share.link_copied',
} as const;

export type WakaPageEventType = (typeof WakaPageEventType)[keyof typeof WakaPageEventType];

// WakaPage typed payloads

export interface WakaPageCreatedPayload {
  pageId: string;
  workspaceId: string;
  profileId: string;
  slug: string;
}

export interface WakaPageViewedPayload {
  pageId: string;
  workspaceId: string;
  visitorId?: string;
  referrer?: string;
  countryCode?: string;
}

export interface WakaPageLeadCapturedPayload {
  pageId: string;
  workspaceId: string;
  blockId: string;
  leadId: string;
}

// ---------------------------------------------------------------------------
// Legacy event types (preserved for backwards compatibility — Milestone 6)
// These constants are intentionally kept to avoid breaking existing callers.
// ---------------------------------------------------------------------------

export const LegacyEventType = {
  EntityCreated:      'entity.created',
  EntityUpdated:      'entity.updated',
  PaymentInitialized: 'payment.initialized',
  PaymentSuccess:     'payment.success',
  PaymentFailed:      'payment.failed',
  SearchIndexed:      'search.indexed',
  SearchDeindexed:    'search.deindexed',
  ProfileViewed:      'profile.viewed',
} as const;

// ---------------------------------------------------------------------------
// Unified EventType constant — all event keys combined
// Updated to include SupportGroupEventType and FundraisingEventType.
// ---------------------------------------------------------------------------

export const EventType = {
  ...AuthEventType,
  ...WorkspaceEventType,
  ...BillingEventType,
  ...KycEventType,
  ...ClaimEventType,
  ...NegotiationEventType,
  ...SupportEventType,
  ...AiEventType,
  ...OnboardingEventType,
  ...PosFinanceEventType,
  ...SocialEventType,
  ...SupportGroupEventType,
  ...FundraisingEventType,
  ...PartnerEventType,
  ...BankTransferEventType,
  ...B2bEventType,
  ...AirtimeEventType,
  ...TransportEventType,
  ...SystemEventType,
  ...VerticalEventType,
  ...WalletEventType,
  ...LegacyEventType,
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

// ---------------------------------------------------------------------------
// Notification event source — N-060a (OQ-009)
// Used to tag events originating from USSD gateway for immediate SMS routing (G21).
// ---------------------------------------------------------------------------

export type NotificationEventSource = 'api' | 'ussd_gateway' | 'cron' | 'queue_consumer';

// ---------------------------------------------------------------------------
// Base event shape — extended with correlationId (N-011) and source (N-060a)
// ---------------------------------------------------------------------------

export interface DomainEvent<TPayload = Record<string, unknown>> {
  id: string;
  aggregate: string;
  aggregateId: string;
  eventType: EventType;
  tenantId: string;
  payload: TPayload;
  version: number;
  createdAt: string;
  correlationId?: string;           // N-011: cross-service distributed tracing
  source?: NotificationEventSource; // N-060a: origin tag for USSD quiet-hours bypass (G21)
}

// ---------------------------------------------------------------------------
// Typed event payloads — existing (preserved) + notification-relevant additions
// ---------------------------------------------------------------------------

export interface EntityCreatedPayload {
  entityType: string;
  displayName: string;
  placeId?: string;
}

export interface ClaimAdvancedPayload {
  profileId: string;
  fromState: string;
  toState: string;
  evidence?: Record<string, unknown>;
}

export interface PaymentSuccessPayload {
  workspaceId: string;
  paystackRef: string;
  amountKobo: number;
  plan: string;
}

export interface PaymentFailedPayload {
  workspaceId: string;
  paystackRef: string;
  reason?: string;
}

export interface SearchIndexedPayload {
  entityId: string;
  entityType: string;
  displayName: string;
  placeId?: string;
}

export interface UserRegisteredPayload {
  email: string;
  workspaceId?: string;
}

export interface UserPasswordResetPayload {
  email: string;
}

export interface UserLoginFailedPayload {
  email: string;
  reason: string;
  attemptCount?: number;
}

export interface UserAccountLockedPayload {
  email: string;
  lockedUntil?: string;
}

export interface UserInvitedPayload {
  inviteEmail: string;
  invitedByUserId: string;
  workspaceId: string;
  role: string;
}

export interface BillingPaymentPayload {
  workspaceId: string;
  amountKobo: number;
  currency: string;
  plan?: string;
  paystackRef?: string;
  reason?: string;
}

export interface BillingSpendLimitPayload {
  workspaceId: string;
  currentSpendKobo: number;
  limitKobo: number;
  percentUsed: number;
}

export interface BankTransferPayload {
  transferId: string;
  workspaceId: string;
  amountKobo: number;
  recipientAccountNumber?: string;
  recipientBankCode?: string;
  status: string;
  paystackRef?: string;
  reason?: string;
}

export interface AiBudgetWarningPayload {
  workspaceId: string;
  currentSpendKobo: number;
  budgetKobo: number;
  percentUsed: number;
}

export interface AiHitlPayload {
  requestId: string;
  workspaceId: string;
  agentType: string;
  escalationLevel?: string;
}

export interface SystemProviderDownPayload {
  provider: string;
  channel: string;
  reason: string;
  templateId?: string;
}

export interface SystemQueueDlqPayload {
  queueName: string;
  messageId: string;
  eventKey: string;
  attempts: number;
  lastError: string;
}

export interface VerticalEventPayload {
  recordId: string;
  recordType: string;
  workspaceId: string;
  details?: Record<string, unknown>;
}
