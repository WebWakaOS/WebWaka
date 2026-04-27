/**
 * WakaPage block renderer registry.
 * (Phase 2 — ADR-0041 D2)
 *
 * Single dispatch table: BlockType → renderer function.
 * "P1 — Build Once Use Infinitely": this registry is the extension point for
 * all future block types across all WebWakaOS pillars.
 *
 * Governance:
 *   - Add new block types to @webwaka/wakapage-blocks first (type + BLOCK_TYPES set)
 *   - Then add a migration for the CHECK constraint
 *   - Then add a renderer here and create its template file
 *   - Never hard-code block type strings in route or renderer code
 *
 * Platform Invariants:
 *   T3 — no DB queries here; all tenant-scoped data comes via RenderContext
 *   P2 — Nigeria First: all renderers default to mobile-first, 44px touch targets
 */

import type { BlockType } from '@webwaka/wakapage-blocks';
import { parseBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext, WakaBlockDbRow } from './wakapage-types.js';

import { renderHeroBlock } from '../templates/wakapage/hero.js';
import { renderBioBlock } from '../templates/wakapage/bio.js';
import { renderOfferingsBlock } from '../templates/wakapage/offerings.js';
import { renderContactFormBlock } from '../templates/wakapage/contact_form.js';
import { renderSocialLinksBlock } from '../templates/wakapage/social_links.js';
import { renderGalleryBlock } from '../templates/wakapage/gallery.js';
import { renderCtaButtonBlock } from '../templates/wakapage/cta_button.js';
import { renderMapBlock } from '../templates/wakapage/map.js';
import { renderTestimonialsBlock } from '../templates/wakapage/testimonials.js';
import { renderFaqBlock } from '../templates/wakapage/faq.js';
import { renderCountdownBlock } from '../templates/wakapage/countdown.js';
import { renderMediaKitBlock } from '../templates/wakapage/media_kit.js';
import { renderTrustBadgesBlock } from '../templates/wakapage/trust_badges.js';
import { renderSocialFeedBlock } from '../templates/wakapage/social_feed.js';
import { renderBlogPostBlock } from '../templates/wakapage/blog_post.js';
import { renderCommunityBlock } from '../templates/wakapage/community.js';
import { renderEventListBlock } from '../templates/wakapage/event_list.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlockRendererFn = (config: any, ctx: RenderContext) => string;

/**
 * The canonical block renderer registry.
 * Keyed by BlockType discriminant — one entry per Phase 1 MVP block type.
 */
const REGISTRY = new Map<BlockType, BlockRendererFn>([
  ['hero',         renderHeroBlock],
  ['bio',          renderBioBlock],
  ['offerings',    renderOfferingsBlock],
  ['contact_form', renderContactFormBlock],
  ['social_links', renderSocialLinksBlock],
  ['gallery',      renderGalleryBlock],
  ['cta_button',   renderCtaButtonBlock],
  ['map',          renderMapBlock],
  ['testimonials', renderTestimonialsBlock],
  ['faq',          renderFaqBlock],
  ['countdown',    renderCountdownBlock],
  ['media_kit',    renderMediaKitBlock],
  ['trust_badges', renderTrustBadgesBlock],
  ['social_feed',  renderSocialFeedBlock],
  ['blog_post',    renderBlogPostBlock],
  ['community',    renderCommunityBlock],
  ['event_list',   renderEventListBlock],
]);

/**
 * Resolve the renderer for a given block type.
 * Returns null for unknown types (graceful degradation — never throws).
 */
export function resolveBlockRenderer(type: BlockType): BlockRendererFn | null {
  return REGISTRY.get(type) ?? null;
}

/**
 * Render a single WakaBlock row to HTML.
 *
 * - Skips blocks where is_visible = 0 (checked here for defence-in-depth;
 *   the SQL query in the route also filters is_visible = 1).
 * - Parses config_json using parseBlockConfig from @webwaka/wakapage-blocks.
 * - Falls back to an empty string on any error (never throws).
 *
 * Nigeria First: empty/null config is safe — all renderers handle missing fields.
 */
export function renderBlock(block: WakaBlockDbRow, ctx: RenderContext): string {
  if (!block.is_visible) return '';

  const blockType = block.block_type as BlockType;
  const renderer = resolveBlockRenderer(blockType);
  if (!renderer) {
    // Unknown block type — log but do not crash the page
    console.warn(`[wakapage] unknown block_type "${blockType}" — skipping`);
    return '';
  }

  const config = parseBlockConfig(blockType, block.config_json);
  try {
    return renderer(config ?? {}, ctx);
  } catch (err) {
    // Individual block render failure must never crash the page
    console.error(`[wakapage] renderBlock "${blockType}" error:`, err);
    return '';
  }
}

/**
 * Render all blocks for a page in sort_order sequence.
 * Returns the concatenated HTML string ready to inject into the page shell.
 */
export function renderAllBlocks(blocks: WakaBlockDbRow[], ctx: RenderContext): string {
  return blocks
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at - b.created_at)
    .map((block) => renderBlock(block, ctx))
    .join('\n');
}
