/**
 * @webwaka/wakapage-blocks — WakaPage MVP block type contracts.
 *
 * Phase 0 foundation (ADR-0041). Types and contracts only.
 * No renderer, no builder UI, no D1 service layer in this package.
 *
 * Consumers:
 *   - Phase 1: apps/api/src/routes/wakapage/ (block CRUD API)
 *   - Phase 1: apps/brand-runtime/src/routes/wakapage.ts (public renderer)
 *   - Phase 2: apps/dashboard (builder UI)
 */

export type {
  BlockType,
  Block,
  BlockConfig,
  HeroBlockConfig,
  BioBlockConfig,
  OfferingsBlockConfig,
  ContactFormBlockConfig,
  SocialLinksBlockConfig,
  GalleryBlockConfig,
  CtaButtonBlockConfig,
  MapBlockConfig,
  TestimonialsBlockConfig,
  FaqBlockConfig,
  CountdownBlockConfig,
  MediaKitBlockConfig,
  TrustBadgesBlockConfig,
  SocialFeedBlockConfig,
  BlogPostBlockConfig,
  CommunityBlockConfig,
  EventListBlockConfig,
} from './block-types.js';

export { parseBlockConfig, serializeBlockConfig } from './block-types.js';

export type {
  PagePublicationState,
  PageSlugSource,
  WakaPage,
  WakaPageSummary,
} from './page-types.js';
