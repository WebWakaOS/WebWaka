/**
 * Tests for ID generation — format, uniqueness, branding.
 */

import { describe, it, expect } from 'vitest';
import {
  generateIndividualId,
  generateOrganizationId,
  generatePlaceId,
  generateOfferingId,
  generateProfileId,
  generateWorkspaceId,
  generateBrandSurfaceId,
} from './ids.js';

const generators = [
  { fn: generateIndividualId,   prefix: 'ind_' },
  { fn: generateOrganizationId, prefix: 'org_' },
  { fn: generatePlaceId,        prefix: 'plc_' },
  { fn: generateOfferingId,     prefix: 'off_' },
  { fn: generateProfileId,      prefix: 'prf_' },
  { fn: generateWorkspaceId,    prefix: 'wsp_' },
  { fn: generateBrandSurfaceId, prefix: 'brs_' },
] as const;

describe('ID generation — format and prefix', () => {
  for (const { fn, prefix } of generators) {
    it(`${prefix}* IDs start with '${prefix}'`, () => {
      const id = fn();
      expect(id).toMatch(new RegExp(`^${prefix}`));
    });

    it(`${prefix}* IDs have correct total length`, () => {
      const id = fn();
      // prefix (3-4 chars) + underscore + 32-char UUID (no dashes)
      expect(id.length).toBeGreaterThan(30);
    });
  }
});

describe('ID generation — uniqueness', () => {
  it('generates unique individual IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateIndividualId()));
    expect(ids.size).toBe(100);
  });

  it('generates unique organization IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateOrganizationId()));
    expect(ids.size).toBe(100);
  });
});
