/**
 * TST-003 / ENH-045: Property-based style tests for currency utilities
 * Verifies P9 invariant (integer kobo) and formatNaira ↔ parseNairaInput round-trip.
 *
 * Key design note: parseNairaInput is a USER INPUT parser (handles "₦1,234.56" strings).
 * It does NOT decode compact display values ("~₦100.0K") — those use "K"/"M" suffixes
 * that are display-only. Round-trip is only valid for non-compact (full-precision) format.
 *
 * TC-P003 regression: parseNairaInput ALWAYS returns an integer (P9 invariant).
 */
import { describe, it, expect } from 'vitest';
import { formatNaira, parseNairaInput } from '../currency.js';

// Representative kobo amounts covering zero, small, medium, large, and near-million values.
const ROUND_TRIP_CASES: number[] = [
  0,
  1,
  100,
  50_00,        // ₦50.00
  450_00,       // ₦450.00
  1_000_00,     // ₦1,000.00
  10_000_00,    // ₦10,000.00
  99_999_99,    // ₦99,999.99
  1_000_000_00, // ₦1,000,000.00
  9_999_999_99, // ₦99,999,999.99
];

describe('TC-P003 | P9 Currency Round-Trip Properties', () => {

  describe('Non-compact formatNaira → parseNairaInput round-trip (≤1 kobo tolerance)', () => {
    it.each(ROUND_TRIP_CASES)(
      'round-trips %i kobo within 1 kobo',
      (kobo) => {
        const formatted = formatNaira(kobo);
        const reparsed = parseNairaInput(formatted);
        // Allow ≤1 kobo for Intl.NumberFormat locale-specific rounding differences
        expect(Math.abs(reparsed - kobo)).toBeLessThanOrEqual(1);
      },
    );
  });

  describe('Compact formatNaira produces abbreviated display strings (not round-trippable)', () => {
    const COMPACT_CASES: [number, string][] = [
      [100_000_00, 'K'],   // ₦100,000 → ~₦100.0K
      [1_000_000_00, 'M'], // ₦1,000,000 → ~₦1.0M
      [5_000_000_00, 'M'], // ₦5,000,000 → ~₦5.0M
    ];

    it.each(COMPACT_CASES)(
      'compact format of %i kobo contains suffix %s',
      (kobo, expectedSuffix) => {
        const formatted = formatNaira(kobo, { compact: true });
        // Compact output should contain K or M suffix
        expect(formatted).toContain(expectedSuffix);
        // Should also be a string (display-only — no round-trip guarantee for K/M)
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      },
    );
  });

  describe('P9: parseNairaInput always returns integer — never float', () => {
    const FLOAT_STRING_INPUTS = [
      '0.1', '1.5', '100.75', '999.99', '1234.56',
      '₦1.5', '₦100.75', '1,234.56',
    ];

    it.each(FLOAT_STRING_INPUTS)(
      'parseNairaInput("%s") returns integer kobo',
      (input) => {
        const parsed = parseNairaInput(input);
        expect(Number.isInteger(parsed)).toBe(true);
      },
    );
  });

  describe('P9: parseNairaInput(formatNaira(x)) is always non-negative', () => {
    it.each(ROUND_TRIP_CASES)(
      'result for %i kobo is non-negative',
      (kobo) => {
        const result = parseNairaInput(formatNaira(kobo));
        expect(result).toBeGreaterThanOrEqual(0);
      },
    );
  });

  describe('P9: parseNairaInput returns 0 for invalid / non-numeric input', () => {
    const INVALID_INPUTS = ['', 'abc', 'N/A', '₦', '~', 'null', 'undefined'];

    it.each(INVALID_INPUTS)(
      'parseNairaInput("%s") returns 0',
      (invalidInput) => {
        const result = parseNairaInput(invalidInput);
        expect(result).toBe(0);
        expect(Number.isInteger(result)).toBe(true);
      },
    );
  });

});
