/**
 * Template Validator Tests — WebWaka 1.0.1
 * Sprint 1, Task 1.4 — 20 test cases
 */

import { describe, it, expect } from 'vitest';
import {
  validateTemplateManifest,
  checkPlatformCompatibility,
  checkVerticalCompatibility,
  isValidSemver,
  isValidSemverRange,
  parseSemver,
} from './template-validator.js';

function validManifest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug: 'restaurant-dashboard',
    display_name: 'Restaurant Dashboard',
    description: 'A full POS dashboard for restaurant operators in Nigeria.',
    template_type: 'dashboard',
    version: '1.0.0',
    platform_compat: '^1.0.0',
    compatible_verticals: ['restaurant', 'catering'],
    permissions: ['read:workspace', 'read:offerings'],
    entrypoints: { dashboard: 'dashboard.html' },
    pricing: { model: 'free', price_kobo: 0 },
    author: { name: 'WebWaka Platform Team' },
    events: ['pos.sale.created'],
    dependencies: { templates: [], platform_packages: ['@webwaka/pos'] },
    ...overrides,
  };
}

describe('validateTemplateManifest', () => {
  it('accepts a fully valid manifest', () => {
    const result = validateTemplateManifest(validManifest());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects null input', () => {
    const result = validateTemplateManifest(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('non-null object');
  });

  it('rejects a non-object input', () => {
    const result = validateTemplateManifest('not-an-object');
    expect(result.valid).toBe(false);
  });

  it('rejects missing slug', () => {
    const result = validateTemplateManifest(validManifest({ slug: undefined }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('slug'))).toBe(true);
  });

  it('rejects invalid slug with uppercase', () => {
    const result = validateTemplateManifest(validManifest({ slug: 'Bad-Slug' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('lowercase'))).toBe(true);
  });

  it('rejects slug with special characters', () => {
    const result = validateTemplateManifest(validManifest({ slug: 'my_template!' }));
    expect(result.valid).toBe(false);
  });

  it('rejects missing display_name', () => {
    const result = validateTemplateManifest(validManifest({ display_name: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('display_name'))).toBe(true);
  });

  it('rejects too-short description', () => {
    const result = validateTemplateManifest(validManifest({ description: 'short' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('description'))).toBe(true);
  });

  it('rejects invalid template_type', () => {
    const result = validateTemplateManifest(validManifest({ template_type: 'plugin' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('template_type'))).toBe(true);
  });

  it('rejects invalid semver version', () => {
    const result = validateTemplateManifest(validManifest({ version: 'v1.0' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('version'))).toBe(true);
  });

  it('rejects invalid platform_compat range', () => {
    const result = validateTemplateManifest(validManifest({ platform_compat: 'latest' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('platform_compat'))).toBe(true);
  });

  it('rejects float price_kobo (T4 enforcement)', () => {
    const result = validateTemplateManifest(validManifest({ pricing: { model: 'one_time', price_kobo: 50.5 } }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('price_kobo') && e.includes('integer'))).toBe(true);
  });

  it('rejects negative price_kobo', () => {
    const result = validateTemplateManifest(validManifest({ pricing: { model: 'one_time', price_kobo: -100 } }));
    expect(result.valid).toBe(false);
  });

  it('warns on free model with non-zero price', () => {
    const result = validateTemplateManifest(validManifest({ pricing: { model: 'free', price_kobo: 5000 } }));
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('free') && w.includes('price_kobo'))).toBe(true);
  });

  it('warns on unknown permissions', () => {
    const result = validateTemplateManifest(validManifest({ permissions: ['read:workspace', 'write:nuclear-codes'] }));
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('nuclear-codes'))).toBe(true);
  });

  it('rejects invalid compatible_verticals (non-array)', () => {
    const result = validateTemplateManifest(validManifest({ compatible_verticals: 'restaurant' }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('compatible_verticals'))).toBe(true);
  });

  it('rejects invalid vertical slug in compatible_verticals', () => {
    const result = validateTemplateManifest(validManifest({ compatible_verticals: ['Restaurant'] }));
    expect(result.valid).toBe(false);
  });

  it('accepts manifest with empty compatible_verticals (all verticals)', () => {
    const result = validateTemplateManifest(validManifest({ compatible_verticals: [] }));
    expect(result.valid).toBe(true);
  });

  it('warns when dashboard template is missing dashboard entrypoint', () => {
    const result = validateTemplateManifest(validManifest({ entrypoints: { dashboard: null } }));
    expect(result.warnings.some((w) => w.includes('dashboard'))).toBe(true);
  });

  it('accepts all six valid template types', () => {
    for (const t of ['dashboard', 'website', 'vertical-blueprint', 'workflow', 'email', 'module']) {
      const result = validateTemplateManifest(validManifest({ template_type: t }));
      expect(result.valid).toBe(true);
    }
  });
});

describe('isValidSemver', () => {
  it('accepts 1.0.0', () => expect(isValidSemver('1.0.0')).toBe(true));
  it('accepts 0.0.1', () => expect(isValidSemver('0.0.1')).toBe(true));
  it('accepts 2.1.3-beta.1', () => expect(isValidSemver('2.1.3-beta.1')).toBe(true));
  it('rejects v1.0', () => expect(isValidSemver('v1.0')).toBe(false));
  it('rejects empty string', () => expect(isValidSemver('')).toBe(false));
});

describe('isValidSemverRange', () => {
  it('accepts ^1.0.0', () => expect(isValidSemverRange('^1.0.0')).toBe(true));
  it('accepts ~1.0.0', () => expect(isValidSemverRange('~1.0.0')).toBe(true));
  it('accepts >=1.0.0', () => expect(isValidSemverRange('>=1.0.0')).toBe(true));
  it('accepts 1.0.0 (exact)', () => expect(isValidSemverRange('1.0.0')).toBe(true));
  it('rejects latest', () => expect(isValidSemverRange('latest')).toBe(false));
  it('rejects empty', () => expect(isValidSemverRange('')).toBe(false));
});

describe('parseSemver', () => {
  it('parses 1.0.0', () => expect(parseSemver('1.0.0')).toEqual([1, 0, 0]));
  it('parses 12.3.45', () => expect(parseSemver('12.3.45')).toEqual([12, 3, 45]));
  it('returns null for invalid', () => expect(parseSemver('abc')).toBeNull());
});

describe('checkPlatformCompatibility', () => {
  it('^1.0.0 matches 1.0.0', () => expect(checkPlatformCompatibility('^1.0.0', '1.0.0')).toBe(true));
  it('^1.0.0 matches 1.0.1', () => expect(checkPlatformCompatibility('^1.0.0', '1.0.1')).toBe(true));
  it('^1.0.0 matches 1.5.0', () => expect(checkPlatformCompatibility('^1.0.0', '1.5.0')).toBe(true));
  it('^1.0.0 does not match 2.0.0', () => expect(checkPlatformCompatibility('^1.0.0', '2.0.0')).toBe(false));
  it('^1.0.0 does not match 0.9.0', () => expect(checkPlatformCompatibility('^1.0.0', '0.9.0')).toBe(false));
  it('~1.0.0 matches 1.0.5', () => expect(checkPlatformCompatibility('~1.0.0', '1.0.5')).toBe(true));
  it('~1.0.0 does not match 1.1.0', () => expect(checkPlatformCompatibility('~1.0.0', '1.1.0')).toBe(false));
  it('>=1.0.0 matches 1.0.0', () => expect(checkPlatformCompatibility('>=1.0.0', '1.0.0')).toBe(true));
  it('>=1.0.0 matches 2.0.0', () => expect(checkPlatformCompatibility('>=1.0.0', '2.0.0')).toBe(true));
  it('>=2.0.0 does not match 1.9.9', () => expect(checkPlatformCompatibility('>=2.0.0', '1.9.9')).toBe(false));
  it('exact match 1.0.0', () => expect(checkPlatformCompatibility('1.0.0', '1.0.0')).toBe(true));
  it('exact match 1.0.0 vs 1.0.1 fails', () => expect(checkPlatformCompatibility('1.0.0', '1.0.1')).toBe(false));
});

describe('checkVerticalCompatibility', () => {
  it('empty array matches any vertical', () => expect(checkVerticalCompatibility([], 'restaurant')).toBe(true));
  it('matches when vertical is in list', () => expect(checkVerticalCompatibility(['restaurant', 'catering'], 'restaurant')).toBe(true));
  it('fails when vertical is not in list', () => expect(checkVerticalCompatibility(['restaurant', 'catering'], 'pharmacy')).toBe(false));
  it('single vertical match', () => expect(checkVerticalCompatibility(['school'], 'school')).toBe(true));
});
