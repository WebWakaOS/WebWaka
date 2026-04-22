/**
 * Root entity interfaces derived from the Universal Entity Model.
 * (docs/governance/universal-entity-model.md)
 *
 * Rule: Model what something IS before modeling what it DOES.
 * Roles, claims, subscriptions, and political assignments are layered on top.
 */
import type { IndividualId, OrganizationId, PlaceId, OfferingId, ProfileId, WorkspaceId, BrandSurfaceId, TenantId } from './ids.js';
import type { EntityType, GeographyType, ClaimLifecycleState, VerificationState, PublicationState, SubscriptionPlan, SubscriptionStatus, PlatformLayer } from './enums.js';
export interface BaseEntity {
    readonly createdAt: string;
    readonly updatedAt: string;
}
export interface Individual extends BaseEntity {
    readonly id: IndividualId;
    readonly type: typeof EntityType.Individual;
    readonly tenantId: TenantId;
    readonly firstName: string;
    readonly lastName: string;
    readonly middleName?: string;
    readonly displayName: string;
    readonly verificationState: VerificationState;
}
export interface Organization extends BaseEntity {
    readonly id: OrganizationId;
    readonly type: typeof EntityType.Organization;
    readonly tenantId: TenantId;
    readonly name: string;
    readonly registrationNumber?: string;
    readonly verificationState: VerificationState;
}
export interface Place extends BaseEntity {
    readonly id: PlaceId;
    readonly type: typeof EntityType.Place;
    readonly tenantId: TenantId;
    readonly name: string;
    readonly geographyType: GeographyType;
    /**
     * Parent place in the geography hierarchy.
     * Null only for the root country node.
     */
    readonly parentId: PlaceId | null;
    /** Full ancestry path from root → this place (ordered). Used for rollup queries. */
    readonly ancestryPath: ReadonlyArray<PlaceId>;
    readonly verificationState: VerificationState;
}
export declare const OfferingKind: {
    readonly Product: "product";
    readonly Service: "service";
    readonly Route: "route";
    readonly Seat: "seat";
    readonly Donation: "donation";
    readonly Membership: "membership";
    readonly Subscription: "subscription";
    readonly Ticket: "ticket";
    readonly Campaign: "campaign";
    readonly Appointment: "appointment";
};
export type OfferingKind = (typeof OfferingKind)[keyof typeof OfferingKind];
export interface Offering extends BaseEntity {
    readonly id: OfferingId;
    readonly type: typeof EntityType.Offering;
    readonly tenantId: TenantId;
    readonly workspaceId: WorkspaceId;
    readonly kind: OfferingKind;
    readonly name: string;
    /**
     * Price in integer kobo (NGN × 100). Platform Invariant T4.
     * Zero for free offerings. Never floating point.
     */
    readonly priceKobo: number;
    readonly publicationState: PublicationState;
}
export interface Profile extends BaseEntity {
    readonly id: ProfileId;
    readonly type: typeof EntityType.Profile;
    /**
     * The entity this profile surfaces for discovery.
     * An Individual, Organization, or Place.
     */
    readonly subjectType: typeof EntityType.Individual | typeof EntityType.Organization | typeof EntityType.Place;
    readonly subjectId: IndividualId | OrganizationId | PlaceId;
    readonly claimState: ClaimLifecycleState;
    readonly verificationState: VerificationState;
    readonly publicationState: PublicationState;
    /** Primary place this profile is indexed under for discovery. */
    readonly primaryPlaceId: PlaceId | null;
}
export interface Workspace extends BaseEntity {
    readonly id: WorkspaceId;
    readonly type: typeof EntityType.Workspace;
    readonly tenantId: TenantId;
    readonly name: string;
    /** The entity this workspace operates on behalf of. */
    readonly ownerType: typeof EntityType.Individual | typeof EntityType.Organization;
    readonly ownerId: IndividualId | OrganizationId;
    readonly subscriptionPlan: SubscriptionPlan;
    readonly subscriptionStatus: SubscriptionStatus;
    /** Active platform layers unlocked by current subscription. */
    readonly activeLayers: ReadonlyArray<PlatformLayer>;
}
export declare const BrandSurfaceKind: {
    readonly Website: "website";
    readonly Store: "store";
    readonly Portal: "portal";
    readonly BookingPage: "booking_page";
    readonly CampaignSite: "campaign_site";
};
export type BrandSurfaceKind = (typeof BrandSurfaceKind)[keyof typeof BrandSurfaceKind];
export interface BrandSurface extends BaseEntity {
    readonly id: BrandSurfaceId;
    readonly type: typeof EntityType.BrandSurface;
    readonly tenantId: TenantId;
    readonly workspaceId: WorkspaceId;
    readonly kind: BrandSurfaceKind;
    readonly slug: string;
    readonly customDomain?: string;
    readonly publicationState: PublicationState;
}
//# sourceMappingURL=entities.d.ts.map