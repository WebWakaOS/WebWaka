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
  CasesBoardBlockConfig,
  DuesStatusBlockConfig,
  MutualAidWallBlockConfig,
  GroupBlockConfig,
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

// ---------------------------------------------------------------------------
// Phase 4 (E28) — New block types: cases_board, dues_status, mutual_aid_wall
// Extended GroupBlockConfig Phase 4 fields
// M14 gate: WakaPage has 4 new block types
// ---------------------------------------------------------------------------

describe('Phase 4 — E28: BlockType exhaustiveness (Phase 4 additions)', () => {
  const PHASE4_BLOCK_TYPES: BlockType[] = [
    'group',
    'fundraising_campaign',
    'cases_board',
    'dues_status',
    'mutual_aid_wall',
  ];

  it('has 5 Phase 4 block types defined (group, fundraising_campaign + 3 new)', () => {
    expect(PHASE4_BLOCK_TYPES).toHaveLength(5);
  });

  it('all Phase 4 block types are distinct snake_case strings', () => {
    const unique = new Set(PHASE4_BLOCK_TYPES);
    expect(unique.size).toBe(PHASE4_BLOCK_TYPES.length);
    for (const t of PHASE4_BLOCK_TYPES) {
      expect(t).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });
});

describe('Phase 4 — E28: CasesBoardBlockConfig', () => {
  it('parses a valid cases_board config', () => {
    const config: CasesBoardBlockConfig = {
      heading: 'Open Cases',
      filterByType: ['welfare', 'legal', 'housing'],
      maxCases: 10,
    };
    const json = JSON.stringify(config);
    const parsed = parseBlockConfig('cases_board', json);
    expect(parsed).not.toBeNull();
    expect(parsed?.blockType).toBe('cases_board');
  });

  it('parses minimal cases_board config (no optional fields)', () => {
    const config: CasesBoardBlockConfig = {};
    const parsed = parseBlockConfig('cases_board', JSON.stringify(config));
    expect(parsed?.blockType).toBe('cases_board');
  });

  it('round-trips cases_board config: serialize then parse', () => {
    const config: BlockConfig = {
      blockType: 'cases_board',
      heading: 'Constituency Cases',
      filterByType: ['infrastructure', 'healthcare'],
      maxCases: 20,
    };
    const json = serializeBlockConfig(config);
    const parsed = parseBlockConfig('cases_board', json);
    expect(parsed).not.toBeNull();
    if (parsed?.blockType === 'cases_board') {
      expect(parsed.heading).toBe('Constituency Cases');
      expect(parsed.filterByType).toEqual(['infrastructure', 'healthcare']);
      expect(parsed.maxCases).toBe(20);
    }
  });
});

describe('Phase 4 — E28: DuesStatusBlockConfig', () => {
  it('parses a valid dues_status config', () => {
    const config: DuesStatusBlockConfig = {
      heading: 'Member Dues',
      showHistory: true,
    };
    const json = JSON.stringify(config);
    const parsed = parseBlockConfig('dues_status', json);
    expect(parsed).not.toBeNull();
    expect(parsed?.blockType).toBe('dues_status');
  });

  it('parses minimal dues_status config', () => {
    const config: DuesStatusBlockConfig = {};
    const parsed = parseBlockConfig('dues_status', JSON.stringify(config));
    expect(parsed?.blockType).toBe('dues_status');
  });

  it('round-trips dues_status: serialize then parse', () => {
    const config: BlockConfig = {
      blockType: 'dues_status',
      heading: 'Ward Dues 2025',
      showHistory: false,
    };
    const json = serializeBlockConfig(config);
    const parsed = parseBlockConfig('dues_status', json);
    expect(parsed).not.toBeNull();
    if (parsed?.blockType === 'dues_status') {
      expect(parsed.heading).toBe('Ward Dues 2025');
      expect(parsed.showHistory).toBe(false);
    }
  });
});

describe('Phase 4 — E28: MutualAidWallBlockConfig', () => {
  it('parses a valid mutual_aid_wall config', () => {
    const config: MutualAidWallBlockConfig = {
      heading: 'Community Aid',
      maxItems: 8,
    };
    const json = JSON.stringify(config);
    const parsed = parseBlockConfig('mutual_aid_wall', json);
    expect(parsed).not.toBeNull();
    expect(parsed?.blockType).toBe('mutual_aid_wall');
  });

  it('parses minimal mutual_aid_wall config', () => {
    const parsed = parseBlockConfig('mutual_aid_wall', '{}');
    expect(parsed?.blockType).toBe('mutual_aid_wall');
  });

  it('round-trips mutual_aid_wall: serialize then parse', () => {
    const config: BlockConfig = {
      blockType: 'mutual_aid_wall',
      heading: 'Neighbourhood Solidarity',
      maxItems: 15,
    };
    const json = serializeBlockConfig(config);
    const parsed = parseBlockConfig('mutual_aid_wall', json);
    expect(parsed).not.toBeNull();
    if (parsed?.blockType === 'mutual_aid_wall') {
      expect(parsed.heading).toBe('Neighbourhood Solidarity');
      expect(parsed.maxItems).toBe(15);
    }
  });
});

describe('Phase 4 — E28: GroupBlockConfig extended fields', () => {
  it('parses group config with Phase 4 extended fields', () => {
    const config: GroupBlockConfig = {
      heading: 'Ward Network',
      showMemberCount: true,
      joinCtaLabel: 'Join Ward',
      groupId: 'Ward',
      showDuesStatus: true,
      showCasesPreview: true,
      showMutualAidWall: false,
    };
    const json = JSON.stringify(config);
    const parsed = parseBlockConfig('group', json);
    expect(parsed).not.toBeNull();
    expect(parsed?.blockType).toBe('group');
    if (parsed?.blockType === 'group') {
      expect(parsed.showDuesStatus).toBe(true);
      expect(parsed.showCasesPreview).toBe(true);
    }
  });

  it('round-trips group with all Phase 4 fields', () => {
    const config: BlockConfig = {
      blockType: 'group',
      heading: 'Faith Group',
      showMemberCount: false,
      groupId: 'Ministry',
      showDuesStatus: true,
      showCasesPreview: false,
      showMutualAidWall: true,
    };
    const json = serializeBlockConfig(config);
    const parsed = parseBlockConfig('group', json);
    if (parsed?.blockType === 'group') {
      expect(parsed.groupId).toBe('Ministry');
      expect(parsed.showMutualAidWall).toBe(true);
    }
  });
});
