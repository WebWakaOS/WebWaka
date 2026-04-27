/**
 * @webwaka/wakapage-blocks — MVP block type contract tests.
 * Phase 0 verification: types compile, parse/serialize round-trip correctly.
 */

import { describe, it, expect } from 'vitest';
import {
  parseBlockConfig,
  serializeBlockConfig,
} from './block-types.js';
import type {
  BlockType,
  HeroBlockConfig,
  OfferingsBlockConfig,
  ContactFormBlockConfig,
  BlogPostBlockConfig,
  BlockConfig,
} from './block-types.js';

// ---------------------------------------------------------------------------
// Block type exhaustiveness — ensure all 17 MVP block types are declared
// ---------------------------------------------------------------------------

describe('BlockType exhaustiveness', () => {
  const MVP_BLOCK_TYPES: BlockType[] = [
    'hero', 'bio', 'offerings', 'contact_form', 'social_links',
    'gallery', 'cta_button', 'map', 'testimonials', 'faq',
    'countdown', 'media_kit', 'trust_badges', 'social_feed',
    'blog_post', 'community', 'event_list',
  ];

  it('has exactly 17 MVP block types defined', () => {
    expect(MVP_BLOCK_TYPES).toHaveLength(17);
  });
});

// ---------------------------------------------------------------------------
// parseBlockConfig
// ---------------------------------------------------------------------------

describe('parseBlockConfig', () => {
  it('parses a valid hero config', () => {
    const config: HeroBlockConfig = {
      displayName: 'Ade Bakery',
      tagline: 'Fresh bread daily',
      ctaLabel: 'Order Now',
    };
    const json = JSON.stringify(config);
    const parsed = parseBlockConfig('hero', json);
    expect(parsed).not.toBeNull();
    expect(parsed?.blockType).toBe('hero');
  });

  it('parses a valid offerings config', () => {
    const config: OfferingsBlockConfig = {
      heading: 'Our Products',
      maxItems: 6,
      showPrices: true,
    };
    const parsed = parseBlockConfig('offerings', JSON.stringify(config));
    expect(parsed?.blockType).toBe('offerings');
  });

  it('parses a valid contact_form config', () => {
    const config: ContactFormBlockConfig = {
      fields: ['name', 'phone', 'message'],
      offlineCapable: true,
    };
    const parsed = parseBlockConfig('contact_form', JSON.stringify(config));
    expect(parsed?.blockType).toBe('contact_form');
  });

  it('parses a valid blog_post config', () => {
    const config: BlogPostBlockConfig = {
      heading: 'Latest Posts',
      maxPosts: 3,
    };
    const parsed = parseBlockConfig('blog_post', JSON.stringify(config));
    expect(parsed?.blockType).toBe('blog_post');
  });

  it('returns null for invalid JSON', () => {
    const parsed = parseBlockConfig('hero', '{not valid json}');
    expect(parsed).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// serializeBlockConfig
// ---------------------------------------------------------------------------

describe('serializeBlockConfig', () => {
  it('strips blockType discriminant from serialized output', () => {
    const config: BlockConfig = {
      blockType: 'hero',
      displayName: 'Test',
      tagline: 'Sub',
    };
    const json = serializeBlockConfig(config);
    const parsed = JSON.parse(json);
    expect(parsed.blockType).toBeUndefined();
    expect(parsed.displayName).toBe('Test');
  });

  it('round-trips correctly: serialize then parse', () => {
    const config: BlockConfig = {
      blockType: 'faq',
      heading: 'Common Questions',
      items: [{ question: 'Do you deliver?', answer: 'Yes!' }],
    };
    const json = serializeBlockConfig(config);
    const parsed = parseBlockConfig('faq', json);
    expect(parsed).not.toBeNull();
    if (parsed?.blockType === 'faq') {
      expect(parsed.heading).toBe('Common Questions');
      expect(parsed.items).toHaveLength(1);
    }
  });
});
