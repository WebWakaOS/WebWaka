/**
 * B4-3: Migration parity test for 5 high-traffic verticals migrated to engine-only.
 *
 * Verticals: restaurant, pharmacy, hotel, school, farm
 *
 * For each, verifies:
 *   - Registry entry exists and is complete (slug, fsm, ai, route, compliance)
 *   - FSM standard transitions are present (seeded → claimed → active → suspended)
 *   - Profile fields include the primary identifier field
 *   - generateRoutes() produces valid HTTP handlers
 *   - Route basePath matches expected value
 */
import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { REGISTRY } from '../registry.js';
import { generateRoutes } from '../generators/route-generator.js';

const MIGRATED_VERTICALS = [
  { slug: 'restaurant',  expectedPath: '/restaurant',  primaryField: 'restaurantName' },
  { slug: 'pharmacy',    expectedPath: '/pharmacy',    primaryField: 'pharmacyName'   },
  { slug: 'hotel',       expectedPath: '/hotel',       primaryField: 'hotelName'      },
  { slug: 'school',      expectedPath: '/school',      primaryField: 'schoolName'     },
  { slug: 'farm',        expectedPath: '/farm',        primaryField: 'farmName'       },
];

for (const { slug, expectedPath, primaryField } of MIGRATED_VERTICALS) {
  describe(`B4-3: Migrated vertical — ${slug}`, () => {
    const config = REGISTRY[slug];

    it('is registered in engine registry', () => {
      expect(config).toBeDefined();
    });

    it(`basePath is '${expectedPath}'`, () => {
      expect(config?.route.basePath).toBe(expectedPath);
    });

    it('has maturity full or basic (not stub)', () => {
      expect(['full', 'basic']).toContain(config?.maturity);
    });

    it('FSM includes seeded → claimed transition', () => {
      const t = config?.fsm.transitions.find(t => t.from === 'seeded' && t.to === 'claimed');
      expect(t).toBeDefined();
    });

    it('FSM includes claimed → active or intermediate → active transition', () => {
      const t = config?.fsm.transitions.find(t => t.to === 'active');
      expect(t).toBeDefined();
    });

    it('FSM includes active → suspended transition', () => {
      const t = config?.fsm.transitions.find(t => t.from === 'active' && t.to === 'suspended');
      expect(t).toBeDefined();
    });

    it(`has '${primaryField}' in updateFields`, () => {
      expect(config?.updateFields).toContain(primaryField);
    });

    it('has compliance.kycTierForClaim defined', () => {
      expect(config?.compliance.kycTierForClaim).toBeDefined();
    });

    it('generateRoutes() returns a Hono router', () => {
      if (!config) return;
      const router = generateRoutes(config);
      expect(router).toBeInstanceOf(Hono);
    });

    it('AI config has at least one useCase', () => {
      expect(config?.ai.useCases.length).toBeGreaterThanOrEqual(1);
    });
  });
}
