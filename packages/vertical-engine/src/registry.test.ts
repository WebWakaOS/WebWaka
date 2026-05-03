/**
 * Registry governance tests — Wave 3 B1-1..B1-4
 */
import { describe, it, expect } from 'vitest';
import {
  REGISTRY,
  getRegistryStats,
  validateRegistryMaturity,
  listSlugs,
  getVerticalConfig,
} from './registry.js';

// ── B1-1: Registry size ───────────────────────────────────────────────────────
describe('B1-1: Registry completeness', () => {
  it('has exactly 159 registered verticals', () => {
    expect(Object.keys(REGISTRY).length).toBe(162);
  });

  it('every entry has a non-empty slug matching its key', () => {
    for (const [key, cfg] of Object.entries(REGISTRY)) {
      expect(cfg.slug).toBe(key);
      expect(cfg.slug.length).toBeGreaterThan(0);
    }
  });

  it('listSlugs() returns 159 items', () => {
    expect(listSlugs().length).toBe(162);
  });

  it('getVerticalConfig returns correct config', () => {
    const cfg = getVerticalConfig('restaurant');
    expect(cfg).toBeDefined();
    expect(cfg?.primaryPillar).toBeGreaterThanOrEqual(1);
  });

  it('new verticals event-planner, driving-school, fitness-center are present', () => {
    expect(REGISTRY['event-planner']).toBeDefined();
    expect(REGISTRY['driving-school']).toBeDefined();
    expect(REGISTRY['fitness-center']).toBeDefined();
  });
});

// ── B1-2: Maturity validation ─────────────────────────────────────────────────
describe('B1-2: Maturity field governance', () => {
  it('every entry has a maturity field', () => {
    const missing = Object.entries(REGISTRY)
      .filter(([, c]) => !c.maturity)
      .map(([k]) => k);
    expect(missing).toEqual([]);
  });

  it('every maturity is full | basic | stub', () => {
    const VALID = new Set(['full', 'basic', 'stub']);
    const invalid = Object.entries(REGISTRY)
      .filter(([, c]) => !VALID.has(c.maturity as string))
      .map(([k, c]) => `${k}:${c.maturity}`);
    expect(invalid).toEqual([]);
  });

  it('validateRegistryMaturity() does not throw', () => {
    expect(() => validateRegistryMaturity()).not.toThrow();
  });

  it('getRegistryStats().missingMaturity is empty', () => {
    expect(getRegistryStats().missingMaturity).toEqual([]);
  });
});

// ── B1-3: Registry stats & pillar coverage ────────────────────────────────────
describe('B1-3: getRegistryStats pillar + maturity breakdown', () => {
  it('total equals registry size', () => {
    const stats = getRegistryStats();
    expect(stats.total).toBe(162);
  });

  it('byPillar sums to total', () => {
    const stats = getRegistryStats();
    const pillarSum = stats.byPillar[1] + stats.byPillar[2] + stats.byPillar[3];
    expect(pillarSum).toBe(stats.total);
  });

  it('byPillar has all three pillars', () => {
    const stats = getRegistryStats();
    expect(stats.byPillar[1]).toBeGreaterThan(0);
    expect(stats.byPillar[2]).toBeGreaterThan(0);
    expect(stats.byPillar[3]).toBeGreaterThan(0);
  });

  it('byMaturity has full, basic, or stub keys', () => {
    const stats = getRegistryStats();
    const keys = Object.keys(stats.byMaturity);
    expect(keys.some(k => ['full', 'basic', 'stub'].includes(k))).toBe(true);
  });

  it('byMaturity does not contain unknown key', () => {
    const stats = getRegistryStats();
    expect(stats.byMaturity['unknown']).toBeUndefined();
  });

  it('byMaturity values sum to total', () => {
    const stats = getRegistryStats();
    const sum = Object.values(stats.byMaturity).reduce((a, b) => a + b, 0);
    expect(sum).toBe(stats.total);
  });

  it('byMilestone has at least one milestone', () => {
    const stats = getRegistryStats();
    expect(Object.keys(stats.byMilestone).length).toBeGreaterThan(0);
  });
});

// ── B1-4: AI config cross-check ───────────────────────────────────────────────
describe('B1-4: Every registry slug has FSM + AI config', () => {
  it('every entry has a non-empty fsm.states array', () => {
    const missing = Object.entries(REGISTRY)
      .filter(([, c]) => !c.fsm?.states?.length)
      .map(([k]) => k);
    expect(missing).toEqual([]);
  });

  it('every entry has an ai object with allowedCapabilities', () => {
    const missing = Object.entries(REGISTRY)
      .filter(([, c]) => !c.ai?.allowedCapabilities)
      .map(([k]) => k);
    expect(missing).toEqual([]);
  });

  it('every entry has a route.basePath', () => {
    const missing = Object.entries(REGISTRY)
      .filter(([, c]) => !c.route?.basePath)
      .map(([k]) => k);
    expect(missing).toEqual([]);
  });

  it('every entry has a compliance object', () => {
    const missing = Object.entries(REGISTRY)
      .filter(([, c]) => !c.compliance)
      .map(([k]) => k);
    expect(missing).toEqual([]);
  });

  it('no duplicate slugs in registry', () => {
    const slugs = Object.values(REGISTRY).map(c => c.slug);
    const uniq = new Set(slugs);
    expect(uniq.size).toBe(slugs.length);
  });
});
