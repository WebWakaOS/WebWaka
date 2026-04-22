/**
 * Root entity interfaces derived from the Universal Entity Model.
 * (docs/governance/universal-entity-model.md)
 *
 * Rule: Model what something IS before modeling what it DOES.
 * Roles, claims, subscriptions, and political assignments are layered on top.
 */
// ---------------------------------------------------------------------------
// Offering
// ---------------------------------------------------------------------------
export const OfferingKind = {
    Product: 'product',
    Service: 'service',
    Route: 'route',
    Seat: 'seat',
    Donation: 'donation',
    Membership: 'membership',
    Subscription: 'subscription',
    Ticket: 'ticket',
    Campaign: 'campaign',
    Appointment: 'appointment',
};
// ---------------------------------------------------------------------------
// Brand Surface
// ---------------------------------------------------------------------------
export const BrandSurfaceKind = {
    Website: 'website',
    Store: 'store',
    Portal: 'portal',
    BookingPage: 'booking_page',
    CampaignSite: 'campaign_site',
};
//# sourceMappingURL=entities.js.map