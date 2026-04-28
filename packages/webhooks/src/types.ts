/**
 * Webhook SDK — TypeScript Event Payload Types
 * Phase 6 / E34 (Webhook SDK)
 *
 * Provides strongly-typed interfaces for all WebWaka outbound webhook event payloads.
 * Partners receiving webhook deliveries can use these types to process events safely.
 *
 * Signature verification: use verifyWebhookSignature from ./signing.ts
 * Header: X-WebWaka-Signature: sha256=<hmac>
 */

// ---------------------------------------------------------------------------
// Base wrapper — all webhook deliveries use this envelope
// ---------------------------------------------------------------------------

export interface WebhookEnvelope<T = unknown> {
  id: string;
  event_type: WebhookEventType;
  tenant_id: string;
  workspace_id: string;
  api_version: '1';
  created_at: number;
  payload: T;
}

// ---------------------------------------------------------------------------
// All valid event type literals (mirrors VALID_EVENTS in webhooks.ts)
// ---------------------------------------------------------------------------

export type WebhookEventType =
  | 'template.installed'
  | 'template.purchased'
  | 'workspace.member_added'
  | 'payment.completed'
  | 'kyc.approved'
  | 'kyc.rejected'
  | 'bank_transfer.completed'
  | 'bank_transfer.failed'
  | 'bank_transfer.initiated'
  | 'bank_transfer.processing'
  | 'pos.sale_completed'
  | 'pos.float_credited'
  | 'pos.float_debited'
  | 'airtime.purchase_completed'
  | 'airtime.purchase_failed'
  | 'b2b.rfq_created'
  | 'b2b.bid_submitted'
  | 'b2b.bid_accepted'
  | 'b2b.po_issued'
  | 'b2b.po_delivered'
  | 'b2b.invoice_raised'
  | 'b2b.dispute_raised'
  | 'claim.submitted'
  | 'claim.approved'
  | 'claim.rejected'
  | 'claim.advanced'
  | 'negotiation.session_started'
  | 'negotiation.accepted'
  | 'negotiation.rejected'
  | 'negotiation.session_expired'
  | 'support.ticket_created'
  | 'support.ticket_resolved'
  | 'support.ticket_closed'
  | 'partner.onboarded'
  | 'partner.application_approved'
  | 'partner.application_rejected'
  | 'partner.sub_partner_created'
  | 'onboarding.started'
  | 'onboarding.completed'
  | 'onboarding.stalled'
  | 'transport.booking_created'
  | 'transport.booking_confirmed'
  | 'transport.trip_started'
  | 'transport.trip_completed'
  | 'transport.booking_cancelled'
  | 'ai.response_generated'
  | 'ai.budget_warning'
  | 'ai.budget_exhausted'
  | 'social.post_published'
  | 'social.follow_created'
  | '*';

// ---------------------------------------------------------------------------
// Per-event payload interfaces
// ---------------------------------------------------------------------------

export interface TemplateInstalledPayload {
  template_slug: string;
  template_id: string;
  installation_id: string;
  installed_by: string;
}

export interface TemplatePurchasedPayload {
  template_slug: string;
  template_id: string;
  purchased_by: string;
  amount_kobo: number;
}

export interface WorkspaceMemberAddedPayload {
  member_user_id: string;
  role: string;
  added_by: string;
}

export interface PaymentCompletedPayload {
  payment_id: string;
  amount_kobo: number;
  currency: 'NGN';
  reference: string;
  channel: string;
}

export interface KycApprovedPayload {
  user_id: string;
  kyc_type: 'bvn' | 'nin' | 'cac' | 'frsc';
  tier: number;
}

export interface KycRejectedPayload {
  user_id: string;
  kyc_type: 'bvn' | 'nin' | 'cac' | 'frsc';
  reason: string;
}

export interface BankTransferPayload {
  transfer_id: string;
  amount_kobo: number;
  reference: string;
  bank_code?: string;
  account_name?: string;
}

export interface PosSaleCompletedPayload {
  sale_id: string;
  amount_kobo: number;
  items_count: number;
  terminal_id?: string;
}

export interface PosFloatPayload {
  float_id: string;
  amount_kobo: number;
  direction: 'credit' | 'debit';
}

export interface AirtimePayload {
  purchase_id: string;
  amount_kobo: number;
  phone_number_masked: string;
  network: string;
}

export interface B2bRfqCreatedPayload {
  rfq_id: string;
  category: string;
  quantity: number;
  currency: string;
}

export interface B2bBidPayload {
  rfq_id: string;
  bid_id: string;
  amount_kobo: number;
  bidder_workspace_id: string;
}

export interface B2bPoPayload {
  po_id: string;
  rfq_id: string;
  amount_kobo: number;
  supplier_workspace_id: string;
}

export interface B2bInvoicePayload {
  invoice_id: string;
  po_id: string;
  amount_kobo: number;
}

export interface B2bDisputePayload {
  dispute_id: string;
  po_id: string;
  reason: string;
}

export interface ClaimPayload {
  claim_id: string;
  entity_id: string;
  claim_type: string;
  status: string;
}

export interface NegotiationPayload {
  session_id: string;
  product_id?: string;
  final_amount_kobo?: number;
}

export interface SupportTicketPayload {
  ticket_id: string;
  subject: string;
  status: string;
  priority?: string;
}

export interface PartnerPayload {
  partner_id: string;
  partner_name: string;
  tier?: string;
}

export interface OnboardingPayload {
  onboarding_id: string;
  step?: string;
  workspace_id: string;
}

export interface TransportPayload {
  booking_id: string;
  route?: string;
  status: string;
}

export interface AiPayload {
  capability: string;
  tokens_used?: number;
  budget_remaining_kobo?: number;
}

export interface SocialPostPublishedPayload {
  post_id: string;
  author_id: string;
  channel?: string;
}

export interface SocialFollowPayload {
  follower_id: string;
  followed_id: string;
}

// ---------------------------------------------------------------------------
// Typed envelope helpers per event type
// ---------------------------------------------------------------------------

export type TemplateInstalledEvent = WebhookEnvelope<TemplateInstalledPayload>;
export type TemplatePurchasedEvent = WebhookEnvelope<TemplatePurchasedPayload>;
export type WorkspaceMemberAddedEvent = WebhookEnvelope<WorkspaceMemberAddedPayload>;
export type PaymentCompletedEvent = WebhookEnvelope<PaymentCompletedPayload>;
export type KycApprovedEvent = WebhookEnvelope<KycApprovedPayload>;
export type KycRejectedEvent = WebhookEnvelope<KycRejectedPayload>;
export type BankTransferCompletedEvent = WebhookEnvelope<BankTransferPayload>;
export type BankTransferFailedEvent = WebhookEnvelope<BankTransferPayload>;
export type BankTransferInitiatedEvent = WebhookEnvelope<BankTransferPayload>;
export type BankTransferProcessingEvent = WebhookEnvelope<BankTransferPayload>;
export type PosSaleCompletedEvent = WebhookEnvelope<PosSaleCompletedPayload>;
export type PosFloatCreditedEvent = WebhookEnvelope<PosFloatPayload>;
export type PosFloatDebitedEvent = WebhookEnvelope<PosFloatPayload>;
export type AirtimePurchaseCompletedEvent = WebhookEnvelope<AirtimePayload>;
export type AirtimePurchaseFailedEvent = WebhookEnvelope<AirtimePayload>;
export type B2bRfqCreatedEvent = WebhookEnvelope<B2bRfqCreatedPayload>;
export type B2bBidSubmittedEvent = WebhookEnvelope<B2bBidPayload>;
export type B2bBidAcceptedEvent = WebhookEnvelope<B2bBidPayload>;
export type B2bPoIssuedEvent = WebhookEnvelope<B2bPoPayload>;
export type B2bPoDeliveredEvent = WebhookEnvelope<B2bPoPayload>;
export type B2bInvoiceRaisedEvent = WebhookEnvelope<B2bInvoicePayload>;
export type B2bDisputeRaisedEvent = WebhookEnvelope<B2bDisputePayload>;
export type ClaimSubmittedEvent = WebhookEnvelope<ClaimPayload>;
export type ClaimApprovedEvent = WebhookEnvelope<ClaimPayload>;
export type ClaimRejectedEvent = WebhookEnvelope<ClaimPayload>;
export type ClaimAdvancedEvent = WebhookEnvelope<ClaimPayload>;
export type NegotiationSessionStartedEvent = WebhookEnvelope<NegotiationPayload>;
export type NegotiationAcceptedEvent = WebhookEnvelope<NegotiationPayload>;
export type NegotiationRejectedEvent = WebhookEnvelope<NegotiationPayload>;
export type NegotiationSessionExpiredEvent = WebhookEnvelope<NegotiationPayload>;
export type SupportTicketCreatedEvent = WebhookEnvelope<SupportTicketPayload>;
export type SupportTicketResolvedEvent = WebhookEnvelope<SupportTicketPayload>;
export type SupportTicketClosedEvent = WebhookEnvelope<SupportTicketPayload>;
export type PartnerOnboardedEvent = WebhookEnvelope<PartnerPayload>;
export type PartnerApplicationApprovedEvent = WebhookEnvelope<PartnerPayload>;
export type PartnerApplicationRejectedEvent = WebhookEnvelope<PartnerPayload>;
export type PartnerSubPartnerCreatedEvent = WebhookEnvelope<PartnerPayload>;
export type OnboardingStartedEvent = WebhookEnvelope<OnboardingPayload>;
export type OnboardingCompletedEvent = WebhookEnvelope<OnboardingPayload>;
export type OnboardingStalledEvent = WebhookEnvelope<OnboardingPayload>;
export type TransportBookingCreatedEvent = WebhookEnvelope<TransportPayload>;
export type TransportBookingConfirmedEvent = WebhookEnvelope<TransportPayload>;
export type TransportTripStartedEvent = WebhookEnvelope<TransportPayload>;
export type TransportTripCompletedEvent = WebhookEnvelope<TransportPayload>;
export type TransportBookingCancelledEvent = WebhookEnvelope<TransportPayload>;
export type AiResponseGeneratedEvent = WebhookEnvelope<AiPayload>;
export type AiBudgetWarningEvent = WebhookEnvelope<AiPayload>;
export type AiBudgetExhaustedEvent = WebhookEnvelope<AiPayload>;
export type SocialPostPublishedEvent = WebhookEnvelope<SocialPostPublishedPayload>;
export type SocialFollowCreatedEvent = WebhookEnvelope<SocialFollowPayload>;

/**
 * Union of all strongly-typed webhook event envelopes.
 * Use this for exhaustive event type discrimination:
 *
 * @example
 * function handleEvent(event: WebhookEvent) {
 *   switch (event.event_type) {
 *     case 'payment.completed': // PaymentCompletedEvent
 *     case 'kyc.approved':      // KycApprovedEvent
 *     ...
 *   }
 * }
 */
export type WebhookEvent =
  | TemplateInstalledEvent
  | TemplatePurchasedEvent
  | WorkspaceMemberAddedEvent
  | PaymentCompletedEvent
  | KycApprovedEvent
  | KycRejectedEvent
  | BankTransferCompletedEvent
  | BankTransferFailedEvent
  | BankTransferInitiatedEvent
  | BankTransferProcessingEvent
  | PosSaleCompletedEvent
  | PosFloatCreditedEvent
  | PosFloatDebitedEvent
  | AirtimePurchaseCompletedEvent
  | AirtimePurchaseFailedEvent
  | B2bRfqCreatedEvent
  | B2bBidSubmittedEvent
  | B2bBidAcceptedEvent
  | B2bPoIssuedEvent
  | B2bPoDeliveredEvent
  | B2bInvoiceRaisedEvent
  | B2bDisputeRaisedEvent
  | ClaimSubmittedEvent
  | ClaimApprovedEvent
  | ClaimRejectedEvent
  | ClaimAdvancedEvent
  | NegotiationSessionStartedEvent
  | NegotiationAcceptedEvent
  | NegotiationRejectedEvent
  | NegotiationSessionExpiredEvent
  | SupportTicketCreatedEvent
  | SupportTicketResolvedEvent
  | SupportTicketClosedEvent
  | PartnerOnboardedEvent
  | PartnerApplicationApprovedEvent
  | PartnerApplicationRejectedEvent
  | PartnerSubPartnerCreatedEvent
  | OnboardingStartedEvent
  | OnboardingCompletedEvent
  | OnboardingStalledEvent
  | TransportBookingCreatedEvent
  | TransportBookingConfirmedEvent
  | TransportTripStartedEvent
  | TransportTripCompletedEvent
  | TransportBookingCancelledEvent
  | AiResponseGeneratedEvent
  | AiBudgetWarningEvent
  | AiBudgetExhaustedEvent
  | SocialPostPublishedEvent
  | SocialFollowCreatedEvent;
