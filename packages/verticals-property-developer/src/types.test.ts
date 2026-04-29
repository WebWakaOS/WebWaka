import { describe, it, expect } from 'vitest';
import {
  isValidPropertyDeveloperTransition,
  guardSeedToClaimed,
  guardClaimedToSurconVerified,
  guardPropertyOperation,
  PropertyDeveloperFSMState,
} from './types.js';

describe('Property Developer Types & Guards', () => {
  describe('isValidPropertyDeveloperTransition', () => {
    it('should allow valid transitions', () => {
      expect(isValidPropertyDeveloperTransition('seeded', 'claimed')).toBe(true);
      expect(isValidPropertyDeveloperTransition('claimed', 'surcon_verified')).toBe(true);
      expect(isValidPropertyDeveloperTransition('claimed', 'suspended')).toBe(true);
      expect(isValidPropertyDeveloperTransition('surcon_verified', 'active')).toBe(true);
      expect(isValidPropertyDeveloperTransition('surcon_verified', 'suspended')).toBe(true);
      expect(isValidPropertyDeveloperTransition('active', 'suspended')).toBe(true);
      expect(isValidPropertyDeveloperTransition('suspended', 'active')).toBe(true);
    });

    it('should reject invalid transitions', () => {
      expect(isValidPropertyDeveloperTransition('seeded', 'active')).toBe(false);
      expect(isValidPropertyDeveloperTransition('seeded', 'suspended')).toBe(false);
      expect(isValidPropertyDeveloperTransition('claimed', 'active')).toBe(false);
      expect(isValidPropertyDeveloperTransition('surcon_verified', 'claimed')).toBe(false);
      expect(isValidPropertyDeveloperTransition('active', 'claimed')).toBe(false);
      expect(isValidPropertyDeveloperTransition('suspended', 'seeded')).toBe(false);
    });

    it('should handle same state transitions as invalid by default', () => {
      expect(isValidPropertyDeveloperTransition('seeded', 'seeded')).toBe(false);
      expect(isValidPropertyDeveloperTransition('active', 'active')).toBe(false);
    });
  });

  describe('guardSeedToClaimed', () => {
    it('should allow if KYC Tier is 1 or higher', () => {
      expect(guardSeedToClaimed({ kycTier: 1 })).toEqual({ allowed: true });
      expect(guardSeedToClaimed({ kycTier: 2 })).toEqual({ allowed: true });
      expect(guardSeedToClaimed({ kycTier: 3 })).toEqual({ allowed: true });
    });

    it('should reject if KYC Tier is less than 1', () => {
      expect(guardSeedToClaimed({ kycTier: 0 })).toEqual({
        allowed: false,
        reason: 'KYC Tier 1 required to claim property developer profile',
      });
      expect(guardSeedToClaimed({ kycTier: -1 })).toEqual({
        allowed: false,
        reason: 'KYC Tier 1 required to claim property developer profile',
      });
    });
  });

  describe('guardClaimedToSurconVerified', () => {
    it('should allow if both SURCON and TOPREC numbers are provided', () => {
      expect(
        guardClaimedToSurconVerified({
          surconNumber: 'SURCON123',
          toprecNumber: 'TOPREC456',
        })
      ).toEqual({ allowed: true });
    });

    it('should reject if SURCON number is missing', () => {
      expect(
        guardClaimedToSurconVerified({
          surconNumber: null,
          toprecNumber: 'TOPREC456',
        })
      ).toEqual({
        allowed: false,
        reason: 'SURCON number required for surcon_verified transition',
      });
      expect(
        guardClaimedToSurconVerified({
          surconNumber: '',
          toprecNumber: 'TOPREC456',
        })
      ).toEqual({
        allowed: false,
        reason: 'SURCON number required for surcon_verified transition',
      });
    });

    it('should reject if TOPREC number is missing', () => {
      expect(
        guardClaimedToSurconVerified({
          surconNumber: 'SURCON123',
          toprecNumber: null,
        })
      ).toEqual({
        allowed: false,
        reason: 'TOPREC number required for surcon_verified transition',
      });
      expect(
        guardClaimedToSurconVerified({
          surconNumber: 'SURCON123',
          toprecNumber: '',
        })
      ).toEqual({
        allowed: false,
        reason: 'TOPREC number required for surcon_verified transition',
      });
    });

    it('should reject if both numbers are missing', () => {
      expect(
        guardClaimedToSurconVerified({
          surconNumber: null,
          toprecNumber: null,
        })
      ).toEqual({
        allowed: false,
        reason: 'SURCON number required for surcon_verified transition',
      });
    });
  });

  describe('guardPropertyOperation', () => {
    it('should allow if KYC Tier is 3 or higher', () => {
      expect(guardPropertyOperation({ kycTier: 3 })).toEqual({ allowed: true });
      expect(guardPropertyOperation({ kycTier: 4 })).toEqual({ allowed: true });
    });

    it('should reject if KYC Tier is less than 3', () => {
      expect(guardPropertyOperation({ kycTier: 0 })).toEqual({
        allowed: false,
        reason: 'KYC Tier 3 required for property operations',
      });
      expect(guardPropertyOperation({ kycTier: 1 })).toEqual({
        allowed: false,
        reason: 'KYC Tier 3 required for property operations',
      });
      expect(guardPropertyOperation({ kycTier: 2 })).toEqual({
        allowed: false,
        reason: 'KYC Tier 3 required for property operations',
      });
    });
  });
});
