/**
 * @webwaka/wakapage-blocks — MVP Block type union and TypeScript interfaces.
 *
 * Phase 0 foundation (ADR-0041). Types and contracts ONLY.
 * No renderer, no builder UI, no database logic in this package.
 *
 * Design constraints (ADR-0041):
 * - Block schemas are stored as JSON in wakapage_blocks.config_json (Phase 1 migration)
 * - Each block type is identified by a BlockType discriminant
 * - All block configs are tenant-scoped via the page they belong to
 * - Blocks are ordered via sort_order (integer, ascending)
 * - Mobile-first rendering (Nigeria First — low-bandwidth optimised defaults)
 *
 * MVP block set (Phase 1 scope — these types are ratified in Phase 0):
 *   hero, bio, offerings, contact_form, social_links, gallery,
 *   cta_button, map, testimonials, faq, countdown, media_kit,
 *   trust_badges, social_feed, blog_post, community, event_list
 *
 * Phase 2+ block types (not in MVP — do not implement in Phase 1):
 *   fx_rates, hospital_booking, legal_consultation, campaign_timeline,
 *   course_preview, reservation_form, lead_magnet, qr_embed
 *
 * Phase 4 block types (Template System Rollout — M14 gate):
 *   cases_board, dues_status, mutual_aid_wall
 *
 * Governance:
 *   - All new block types must be added here first (types contract)
 *   - Then added to the wakapage_blocks.block_type CHECK constraint (migration)
 *   - Never scatter block type strings into route or renderer code
 */

// ---------------------------------------------------------------------------
// Block type discriminant
// ---------------------------------------------------------------------------

/**
 * MVP block type union — Phase 1 implementation scope + Phase 4 additions.
 * This is the canonical list. Extend here first, then migration.
 */
export type BlockType =
  | 'hero'            // Profile hero: name, tagline, avatar, cover image
  | 'bio'             // Text bio/about section
  | 'offerings'       // Products/services grid from offerings table
  | 'contact_form'    // Offline-capable contact form (no @webwaka/contact — that is channel management)
  | 'social_links'    // Social media link icons
  | 'gallery'         // Image/media gallery
  | 'cta_button'      // Single call-to-action button
  | 'map'             // Location map (from places table)
  | 'testimonials'    // Customer testimonials carousel
  | 'faq'             // FAQ accordion
  | 'countdown'       // Campaign/event countdown timer
  | 'media_kit'       // Downloadable press pack / brand assets
  | 'trust_badges'    // Verification + sector licence badges
  | 'social_feed'     // @webwaka/social posts feed
  | 'blog_post'       // Recent posts from blog_posts table
  | 'community'       // @webwaka/community spaces
  | 'event_list'      // @webwaka/community events list
  | 'group'              // @webwaka/groups public profile + join CTA (Phase 0 rename from support_group)
  | 'fundraising_campaign' // @webwaka/fundraising public campaign + donate CTA
  // ---------------------------------------------------------------------------
  // Phase 4 — Template System Rollout (M14 gate: 4 new block types)
  // ---------------------------------------------------------------------------
  | 'cases_board'     // @webwaka/cases board: open/closed cases filtered by type/status
  | 'dues_status'     // @webwaka/dues: member dues payment status + history
  | 'mutual_aid_wall'; // @webwaka/mutual-aid: open requests + recent disbursements

/**
 * Runtime set of all MVP block type strings + Phase 4 additions.
 *
 * This is the single canonical list of valid block types.
 * Derive your runtime validators from this — never scatter block type strings
 * into route or renderer code.
 *
 * Governance: add a new type to `BlockType` above AND to this Set, then update
 * the wakapage_blocks.block_type CHECK constraint in a new migration.
 */
export const BLOCK_TYPES: ReadonlySet<BlockType> = new Set<BlockType>([
  'hero',
  'bio',
  'offerings',
  'contact_form',
  'social_links',
  'gallery',
  'cta_button',
  'map',
  'testimonials',
  'faq',
  'countdown',
  'media_kit',
  'trust_badges',
  'social_feed',
  'blog_post',
  'community',
  'event_list',
  'group',
  'fundraising_campaign',
  // Phase 4 additions (M14 gate)
  'cases_board',
  'dues_status',
  'mutual_aid_wall',
]);

// ---------------------------------------------------------------------------
// Base block interface
// ---------------------------------------------------------------------------

/**
 * All blocks share this base shape.
 * config_json stores the block-specific config (BlockConfig union).
 */
export interface Block {
  id: string;
  pageId: string;
  blockType: BlockType;
  sortOrder: number;
  isVisible: boolean;
  /** Serialised BlockConfig. Parsed at render time. */
  configJson: string;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Block config interfaces — one per BlockType
// ---------------------------------------------------------------------------

export interface HeroBlockConfig {
  displayName?: string;
  tagline?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface BioBlockConfig {
  body: string; // Rich text (HTML subset — sanitised at save time)
  maxChars?: number; // default 500 for mobile-first low-bandwidth
}

export interface OfferingsBlockConfig {
  heading?: string;
  maxItems?: number;      // default 6
  showPrices?: boolean;   // default true
  categoryFilter?: string;
}

export interface ContactFormBlockConfig {
  heading?: string;
  fields: Array<'name' | 'phone' | 'email' | 'message'>;
  submitLabel?: string;
  successMessage?: string;
  /** Offline-capable: stores submission locally when network unavailable */
  offlineCapable?: boolean; // default true (Nigeria First)
}

export interface SocialLinksBlockConfig {
  links: Array<{
    platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'whatsapp' | 'youtube' | 'linkedin' | 'telegram' | 'website';
    url: string;
    label?: string;
  }>;
  style?: 'icons' | 'buttons' | 'text';
}

export interface GalleryBlockConfig {
  heading?: string;
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  columns?: 2 | 3 | 4;
}

export interface CtaButtonBlockConfig {
  label: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'outline';
  openInNewTab?: boolean;
}

export interface MapBlockConfig {
  /** place_id from places table */
  placeId?: string;
  /** Fallback lat/lng if placeId not set */
  lat?: number;
  lng?: number;
  zoom?: number;
  showDirectionsLink?: boolean; // default true (Nigeria First — physical location discovery)
}

export interface TestimonialsBlockConfig {
  heading?: string;
  items: Array<{
    name: string;
    text: string;
    avatarUrl?: string;
    rating?: 1 | 2 | 3 | 4 | 5;
  }>;
  layout?: 'carousel' | 'grid';
}

export interface FaqBlockConfig {
  heading?: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export interface CountdownBlockConfig {
  heading?: string;
  targetDate: string; // ISO-8601
  timezone?: string;  // default 'Africa/Lagos'
  expiredMessage?: string;
}

export interface MediaKitBlockConfig {
  heading?: string;
  files: Array<{
    label: string;
    url: string;
    fileType?: 'pdf' | 'zip' | 'image' | 'doc';
    sizeBytes?: number;
  }>;
}

export interface TrustBadgesBlockConfig {
  showVerificationBadge?: boolean;  // from profiles.verification_state
  showClaimBadge?: boolean;         // from profiles.claim_state >= verified
  sectorLicenseIds?: string[];      // FK to sector_license_verifications.id
  customBadges?: Array<{
    label: string;
    iconUrl?: string;
  }>;
}

export interface SocialFeedBlockConfig {
  maxPosts?: number;   // default 6
  showEngagement?: boolean;
}

export interface BlogPostBlockConfig {
  heading?: string;
  maxPosts?: number;   // default 3
  showExcerpt?: boolean;
  showCoverImage?: boolean;
}

export interface CommunityBlockConfig {
  spaceId?: string;
  showMemberCount?: boolean;
  joinCta?: string;
}

export interface EventListBlockConfig {
  heading?: string;
  maxEvents?: number;  // default 5
  showPastEvents?: boolean;
  filterBySpaceId?: string;
}

/**
 * GroupBlockConfig — extended in Phase 4 with casework + dues + mutual aid preview.
 * Phase 0 rename: was SupportGroupBlockConfig.
 */
export interface GroupBlockConfig {
  groupId?: string;
  groupSlug?: string;
  heading?: string;
  showMemberCount?: boolean;     // default true
  showHierarchy?: boolean;       // show ward/LGA/state context
  showChildGroups?: boolean;     // list sub-groups
  joinCtaLabel?: string;         // default 'Join Group'
  donateCtaLabel?: string;       // if linked to a fundraising campaign
  linkedCampaignId?: string;     // optional link to fundraising campaign
  showUpcomingEvents?: boolean;  // default true
  maxEventsPreview?: number;     // default 3
  // Phase 4 extensions (Template System — M14 gate)
  showCasesPreview?: boolean;    // show open cases board preview (T02/T05)
  maxCasesPreview?: number;      // default 3
  showDuesStatus?: boolean;      // show member dues status widget (T03/T06)
  showMutualAidWall?: boolean;   // show open mutual aid requests (T03)
  vocabularyOverrides?: {        // TR-T-03: UI-layer term overrides from installed template
    member?: string;             // e.g. "Volunteer", "Constituent", "Neighbor"
    group?: string;              // e.g. "Chapter", "Ward Network", "Ministry"
    joinCta?: string;            // e.g. "Join Chapter", "Enlist as Supporter"
  };
}

/** @deprecated Use GroupBlockConfig */
export type SupportGroupBlockConfig = GroupBlockConfig;

export interface FundraisingCampaignBlockConfig {
  campaignId?: string;
  campaignSlug?: string;
  heading?: string;
  showProgressBar?: boolean;     // default true
  showContributorCount?: boolean;// default true
  showDonorWall?: boolean;       // default true (if campaign.donor_wall_enabled)
  showDeadline?: boolean;        // default true
  showRewards?: boolean;         // default true (if campaign.rewards_enabled)
  donateCtaLabel?: string;       // default 'Donate Now'
  pledgeCtaLabel?: string;       // default 'Make a Pledge'
  showUpdates?: boolean;         // default true
  maxUpdatesPreview?: number;    // default 3
  showStory?: boolean;           // default true (long-form narrative block)
  anonymousMode?: boolean;       // hide individual amounts in donor wall
}

// ---------------------------------------------------------------------------
// Phase 4 — New Block Config interfaces (M14 gate)
// ---------------------------------------------------------------------------

/**
 * CasesBoardBlockConfig — embeds the tenant's cases board.
 * Used by: T02 (Civic), T03 (Mutual Aid), T05 (Constituency Service).
 * Applies template vocabulary overrides at the UI layer (TR-T-03).
 */
export interface CasesBoardBlockConfig {
  heading?: string;              // default: vocabulary.Case + ' Board' (e.g. 'Aid Request Board')
  filterByStatus?: Array<'open' | 'in_progress' | 'resolved' | 'closed'>;
  filterByType?: string[];       // e.g. ['constituency_case','beneficiary_case']
  maxCases?: number;             // default 5
  showResolutionTime?: boolean;  // default true
  showAssignee?: boolean;        // default false (PII — masked unless consented)
  showCaseType?: boolean;        // default true
  linkToFullBoard?: boolean;     // default true — link to /cases
  /** TR-T-03: Applied at UI layer from installed template vocabulary */
  caseLabelOverride?: string;    // e.g. "Aid Request", "Constituency Case", "Beneficiary Case"
  /** Nigeria First: low-bandwidth mode — card view not full table */
  lowBandwidthMode?: boolean;    // default true
}

/**
 * DuesStatusBlockConfig — embeds a member dues payment status widget.
 * Used by: T03 (Mutual Aid), T06 (Faith Community), T07 (Cooperative — Phase 5).
 * Sensitive: individual contribution amounts are PII under NDPR (policy rule: faith.tithe_records.pii.v1)
 */
export interface DuesStatusBlockConfig {
  heading?: string;              // default: vocabulary.Contribution + ' Status' (e.g. 'Tithe Status')
  showCurrentPeriod?: boolean;   // default true
  showHistory?: boolean;         // default false (requires NDPR consent)
  historyMonths?: number;        // default 6; max 24
  showNextDueDate?: boolean;     // default true
  showTotalPaid?: boolean;       // default false (PII — masked unless consented)
  /** TR-T-03: Applied at UI layer from installed template vocabulary */
  contributionLabelOverride?: string; // e.g. "Tithe", "Dues", "Levy", "Gift"
  /** P13 compliance: amounts must not be shown in public contexts */
  anonymousMode?: boolean;       // default true (hide individual amounts on public pages)
}

/**
 * MutualAidWallBlockConfig — embeds the network's open/recent aid requests.
 * Used by: T03 (Mutual Aid Network).
 * PII sensitive: financial need descriptions must not be exposed without consent.
 */
export interface MutualAidWallBlockConfig {
  heading?: string;              // default: 'Aid Requests' (or vocabulary.Case + 's')
  showOpenRequests?: boolean;    // default true
  showRecentlyFunded?: boolean;  // default true
  maxItems?: number;             // default 5
  showRequestAmount?: boolean;   // default false (PII — amounts are sensitive)
  showRequesterName?: boolean;   // default false (PII — masked by default)
  showApprovalStatus?: boolean;  // default true (approved/pending/denied)
  /** TR-T-03: Applied at UI layer from installed template vocabulary */
  requestLabelOverride?: string; // e.g. "Aid Request", "Help Request", "Network Call"
  neighborLabelOverride?: string; // e.g. "Neighbor", "Member"
  /** Nigeria First: offline-friendly compact card layout */
  compactMode?: boolean;         // default true
}

// ---------------------------------------------------------------------------
// Discriminated union of all block configs
// ---------------------------------------------------------------------------

export type BlockConfig =
  | ({ blockType: 'hero' } & HeroBlockConfig)
  | ({ blockType: 'bio' } & BioBlockConfig)
  | ({ blockType: 'offerings' } & OfferingsBlockConfig)
  | ({ blockType: 'contact_form' } & ContactFormBlockConfig)
  | ({ blockType: 'social_links' } & SocialLinksBlockConfig)
  | ({ blockType: 'gallery' } & GalleryBlockConfig)
  | ({ blockType: 'cta_button' } & CtaButtonBlockConfig)
  | ({ blockType: 'map' } & MapBlockConfig)
  | ({ blockType: 'testimonials' } & TestimonialsBlockConfig)
  | ({ blockType: 'faq' } & FaqBlockConfig)
  | ({ blockType: 'countdown' } & CountdownBlockConfig)
  | ({ blockType: 'media_kit' } & MediaKitBlockConfig)
  | ({ blockType: 'trust_badges' } & TrustBadgesBlockConfig)
  | ({ blockType: 'social_feed' } & SocialFeedBlockConfig)
  | ({ blockType: 'blog_post' } & BlogPostBlockConfig)
  | ({ blockType: 'community' } & CommunityBlockConfig)
  | ({ blockType: 'event_list' } & EventListBlockConfig)
  | ({ blockType: 'group' } & GroupBlockConfig)
  | ({ blockType: 'fundraising_campaign' } & FundraisingCampaignBlockConfig)
  // Phase 4 (M14 gate)
  | ({ blockType: 'cases_board' } & CasesBoardBlockConfig)
  | ({ blockType: 'dues_status' } & DuesStatusBlockConfig)
  | ({ blockType: 'mutual_aid_wall' } & MutualAidWallBlockConfig);

// ---------------------------------------------------------------------------
// Parse helper — Phase 0 contract only, no renderer
// ---------------------------------------------------------------------------

/**
 * Parse a stored config_json string into a typed BlockConfig.
 * Returns null if parsing fails (graceful degradation — Nigeria First offline).
 */
export function parseBlockConfig(blockType: BlockType, configJson: string): BlockConfig | null {
  try {
    const parsed = JSON.parse(configJson) as Record<string, unknown>;
    return { blockType, ...parsed } as BlockConfig;
  } catch {
    return null;
  }
}

/**
 * Serialize a block config to JSON for storage.
 * Strips the blockType discriminant (stored separately in DB).
 */
export function serializeBlockConfig(config: BlockConfig): string {
  const { blockType: _type, ...rest } = config as { blockType: BlockType } & Record<string, unknown>;
  return JSON.stringify(rest);
}
