/**
 * Analytics Event Taxonomy tests — Wave 3 C6-5
 */
import { describe, it, expect } from 'vitest';
import { ANALYTICS_EVENTS, VALID_EVENT_NAMES } from './event-taxonomy.js';

describe('Analytics Event Taxonomy (C6-5)', () => {
  it('all event names are snake_case strings', () => {
    for (const [key, def] of Object.entries(ANALYTICS_EVENTS)) {
      expect(typeof def.name).toBe('string');
      expect(def.name).toMatch(/^[a-z][a-z0-9_]+$/);
    }
  });

  it('no duplicate event names', () => {
    const names = Object.values(ANALYTICS_EVENTS).map(e => e.name);
    expect(names.length).toBe(new Set(names).size);
  });

  it('VALID_EVENT_NAMES contains all event names', () => {
    for (const def of Object.values(ANALYTICS_EVENTS)) {
      expect(VALID_EVENT_NAMES.has(def.name)).toBe(true);
    }
  });

  it('every event has at least one pillar', () => {
    for (const def of Object.values(ANALYTICS_EVENTS)) {
      expect(def.pillars.length).toBeGreaterThan(0);
    }
  });

  it('every event has a source path', () => {
    for (const def of Object.values(ANALYTICS_EVENTS)) {
      expect(def.source).toBeTruthy();
      expect(def.source).toMatch(/^(apps|packages)\//);
    }
  });

  it('every event has at least one property', () => {
    for (const [key, def] of Object.entries(ANALYTICS_EVENTS)) {
      expect(Object.keys(def.properties).length).toBeGreaterThan(0);
    }
  });

  // Spot-check Wave 3 specific events
  it('SUPERAGENT_CHAT_COMPLETED has tokens_used and waka_cu (P9)', () => {
    const e = ANALYTICS_EVENTS.SUPERAGENT_CHAT_COMPLETED;
    expect(e.properties.tokens_used).toBe('number');
    expect(e.properties.waka_cu).toBe('number');
    expect(e.pillars).toContain('P9');
  });

  it('SUPERAGENT_CHAT_FAILED has tokens_used = 0 comment (P9)', () => {
    const e = ANALYTICS_EVENTS.SUPERAGENT_CHAT_FAILED;
    expect(e.properties.tokens_used).toBe('number'); // always 0 on failure
    expect(e.pillars).toContain('P7');
  });

  it('WAKA_CU_CHARGED is tagged P9 (monetary integrity)', () => {
    expect(ANALYTICS_EVENTS.WAKA_CU_CHARGED.pillars).toContain('P9');
  });

  it('PWA_OFFLINE_SERVED is tagged P4 (mobile-first)', () => {
    expect(ANALYTICS_EVENTS.PWA_OFFLINE_SERVED.pillars).toContain('P4');
  });

  it('taxonomy has at least 10 events (Wave 3 coverage)', () => {
    expect(Object.keys(ANALYTICS_EVENTS).length).toBeGreaterThanOrEqual(10);
  });

  it('all pillar tags are valid format (P + digit)', () => {
    const pillarRe = /^P\d+$/;
    for (const def of Object.values(ANALYTICS_EVENTS)) {
      for (const p of def.pillars) expect(p).toMatch(pillarRe);
    }
  });
});
