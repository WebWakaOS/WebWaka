import { describe, it, expect } from 'vitest';
import {
  getSensitiveSector,
  isSensitiveVertical,
  preProcessCheck,
  stripPii,
  postProcessCheck,
} from './compliance-filter.js';

describe('Compliance Filter', () => {
  describe('getSensitiveSector', () => {
    it('identifies medical verticals', () => {
      expect(getSensitiveSector('hospital')).toBe('medical');
      expect(getSensitiveSector('clinic')).toBe('medical');
    });

    it('identifies legal verticals', () => {
      expect(getSensitiveSector('legal')).toBe('legal');
      expect(getSensitiveSector('lawyer')).toBe('legal');
    });

    it('identifies political verticals', () => {
      expect(getSensitiveSector('politician')).toBe('political');
      expect(getSensitiveSector('political-party')).toBe('political');
    });

    it('identifies pharmaceutical verticals', () => {
      expect(getSensitiveSector('pharmacy')).toBe('pharmaceutical');
    });

    it('returns null for non-sensitive verticals', () => {
      expect(getSensitiveSector('church')).toBeNull();
      expect(getSensitiveSector('pos-business')).toBeNull();
      expect(getSensitiveSector('restaurant')).toBeNull();
    });
  });

  describe('isSensitiveVertical', () => {
    it('returns true for sensitive verticals', () => {
      expect(isSensitiveVertical('hospital')).toBe(true);
      expect(isSensitiveVertical('politician')).toBe(true);
    });

    it('returns false for non-sensitive verticals', () => {
      expect(isSensitiveVertical('church')).toBe(false);
      expect(isSensitiveVertical('market')).toBe(false);
    });
  });

  describe('preProcessCheck', () => {
    it('allows non-sensitive verticals without HITL', () => {
      const result = preProcessCheck('church', [{ role: 'user', content: 'Hello' }], 1);
      expect(result.allowed).toBe(true);
      expect(result.requiresHitl).toBe(false);
      expect(result.disclaimers).toHaveLength(0);
    });

    it('detects PII in messages', () => {
      const result = preProcessCheck('church', [
        { role: 'user', content: 'Call me at 08012345678' },
      ], 1);
      expect(result.strippedPii).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('detects email PII', () => {
      const result = preProcessCheck('market', [
        { role: 'user', content: 'Email me at user@example.com' },
      ], 1);
      expect(result.strippedPii).toBe(true);
    });

    it('requires HITL for sensitive verticals at autonomy L2+', () => {
      const result = preProcessCheck('hospital', [{ role: 'user', content: 'Test' }], 2);
      expect(result.requiresHitl).toBe(true);
      expect(result.hitlLevel).toBe(1);
      expect(result.sector).toBe('medical');
      expect(result.disclaimers.length).toBeGreaterThan(0);
    });

    it('sets L3 HITL for autonomy L5+', () => {
      const result = preProcessCheck('politician', [{ role: 'user', content: 'Draft speech' }], 5);
      expect(result.requiresHitl).toBe(true);
      expect(result.hitlLevel).toBe(3);
    });

    it('does not require HITL for L1 even on sensitive verticals', () => {
      const result = preProcessCheck('hospital', [{ role: 'user', content: 'Info' }], 1);
      expect(result.requiresHitl).toBe(false);
    });

    it('adds sector-specific disclaimers', () => {
      const medResult = preProcessCheck('hospital', [{ role: 'user', content: 'Test' }], 1);
      expect(medResult.disclaimers.some(d => d.includes('medical advice'))).toBe(true);

      const legalResult = preProcessCheck('legal', [{ role: 'user', content: 'Test' }], 1);
      expect(legalResult.disclaimers.some(d => d.includes('legal advice'))).toBe(true);

      const polResult = preProcessCheck('politician', [{ role: 'user', content: 'Test' }], 1);
      expect(polResult.disclaimers.some(d => d.includes('INEC'))).toBe(true);

      const pharmaResult = preProcessCheck('pharmacy', [{ role: 'user', content: 'Test' }], 1);
      expect(pharmaResult.disclaimers.some(d => d.includes('NAFDAC'))).toBe(true);
    });
  });

  describe('stripPii', () => {
    it('strips Nigerian phone numbers (080x)', () => {
      const result = stripPii('Call 08012345678 for info');
      expect(result).not.toContain('08012345678');
      expect(result).toContain('[PHONE_REDACTED]');
    });

    it('strips Nigerian phone numbers (090x)', () => {
      const result = stripPii('Text 09087654321');
      expect(result).not.toContain('09087654321');
      expect(result).toContain('[PHONE_REDACTED]');
    });

    it('strips international format (+234) numbers', () => {
      const result = stripPii('Call +2348012345678');
      expect(result).not.toContain('+2348012345678');
      expect(result).toContain('[PHONE_REDACTED]');
    });

    it('strips email addresses', () => {
      const result = stripPii('Send to user@example.com');
      expect(result).not.toContain('user@example.com');
      expect(result).toContain('[EMAIL_REDACTED]');
    });

    it('returns unchanged text without PII', () => {
      const text = 'This is a regular message about products';
      expect(stripPii(text)).toBe(text);
    });

    it('strips multiple PII types in one string', () => {
      const result = stripPii('Call 08012345678 or email user@test.com');
      expect(result).toContain('[PHONE_REDACTED]');
      expect(result).toContain('[EMAIL_REDACTED]');
      expect(result).not.toContain('08012345678');
      expect(result).not.toContain('user@test.com');
    });
  });

  describe('postProcessCheck', () => {
    it('passes non-sensitive sector content', () => {
      const result = postProcessCheck('Generated bio text here.', null);
      expect(result.flagged).toBe(false);
      expect(result.flags).toHaveLength(0);
    });

    it('flags medical diagnosis content', () => {
      const result = postProcessCheck('Based on symptoms, the diagnosis is malaria.', 'medical');
      expect(result.flagged).toBe(true);
      expect(result.flags.length).toBeGreaterThan(0);
    });

    it('flags prescription content for medical', () => {
      const result = postProcessCheck('I prescribe amoxicillin 500mg.', 'medical');
      expect(result.flagged).toBe(true);
    });

    it('flags legal advice patterns', () => {
      const result = postProcessCheck('You should sue the landlord immediately.', 'legal');
      expect(result.flagged).toBe(true);
    });

    it('flags political inflammatory content', () => {
      const result = postProcessCheck('We must incite the people against them.', 'political');
      expect(result.flagged).toBe(true);
    });

    it('adds disclaimers for sensitive sectors', () => {
      const result = postProcessCheck('Some medical information.', 'medical');
      expect(result.disclaimers.length).toBeGreaterThan(0);
      expect(result.disclaimers.some(d => d.includes('medical'))).toBe(true);
    });

    it('does not flag safe medical content', () => {
      const result = postProcessCheck('The hospital visiting hours are 9am to 5pm.', 'medical');
      expect(result.flagged).toBe(false);
    });
  });
});
