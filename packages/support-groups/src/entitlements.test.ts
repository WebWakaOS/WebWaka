import { describe, expect, it } from 'vitest';
import {
  assertMaxGroups,
  assertBroadcastEnabled,
  assertBroadcastChannel,
  assertGotvEnabled,
  assertHierarchyEnabled,
  assertAnalyticsEnabled,
  assertAiAssistEnabled,
  FREE_SUPPORT_GROUP_ENTITLEMENTS,
  STARTER_SUPPORT_GROUP_ENTITLEMENTS,
  GROWTH_SUPPORT_GROUP_ENTITLEMENTS,
  PRO_SUPPORT_GROUP_ENTITLEMENTS,
  ENTERPRISE_SUPPORT_GROUP_ENTITLEMENTS,
} from './entitlements';

describe('Support Group Entitlements', () => {
  describe('assertMaxGroups', () => {
    it('throws if maximum groups are reached or exceeded', () => {
      expect(() => assertMaxGroups(1, FREE_SUPPORT_GROUP_ENTITLEMENTS)).toThrowError(
        /ENTITLEMENT_DENIED/,
      );
      expect(() => assertMaxGroups(2, FREE_SUPPORT_GROUP_ENTITLEMENTS)).toThrowError(
        /ENTITLEMENT_DENIED/,
      );
    });

    it('does not throw if under maximum groups', () => {
      expect(() => assertMaxGroups(0, FREE_SUPPORT_GROUP_ENTITLEMENTS)).not.toThrow();
    });

    it('does not throw if plan allows unlimited groups', () => {
      expect(() => assertMaxGroups(9999, ENTERPRISE_SUPPORT_GROUP_ENTITLEMENTS)).not.toThrow();
    });
  });

  describe('assertBroadcastEnabled', () => {
    it('throws if broadcast is not enabled', () => {
      expect(() => assertBroadcastEnabled(FREE_SUPPORT_GROUP_ENTITLEMENTS)).toThrowError(
        /ENTITLEMENT_DENIED/,
      );
    });

    it('does not throw if broadcast is enabled', () => {
      expect(() => assertBroadcastEnabled(STARTER_SUPPORT_GROUP_ENTITLEMENTS)).not.toThrow();
    });
  });

  describe('assertBroadcastChannel', () => {
    it('throws if broadcast channel is not included', () => {
      expect(() => assertBroadcastChannel('sms', FREE_SUPPORT_GROUP_ENTITLEMENTS)).toThrowError(
        /ENTITLEMENT_DENIED/,
      );
      expect(() =>
        assertBroadcastChannel('whatsapp', STARTER_SUPPORT_GROUP_ENTITLEMENTS),
      ).toThrowError(/ENTITLEMENT_DENIED/);
    });

    it('does not throw if broadcast channel is included', () => {
      expect(() => assertBroadcastChannel('in_app', FREE_SUPPORT_GROUP_ENTITLEMENTS)).not.toThrow();
      expect(() => assertBroadcastChannel('sms', STARTER_SUPPORT_GROUP_ENTITLEMENTS)).not.toThrow();
    });
  });

  describe('assertGotvEnabled', () => {
    it('throws if GOTV is not enabled', () => {
      expect(() => assertGotvEnabled(FREE_SUPPORT_GROUP_ENTITLEMENTS)).toThrowError(
        /ENTITLEMENT_DENIED/,
      );
    });

    it('does not throw if GOTV is enabled', () => {
      expect(() => assertGotvEnabled(STARTER_SUPPORT_GROUP_ENTITLEMENTS)).not.toThrow();
    });
  });

  describe('assertHierarchyEnabled', () => {
    it('throws if hierarchy is not enabled', () => {
      expect(() => assertHierarchyEnabled(STARTER_SUPPORT_GROUP_ENTITLEMENTS)).toThrowError(
        /ENTITLEMENT_DENIED/,
      );
    });

    it('does not throw if hierarchy is enabled', () => {
      expect(() => assertHierarchyEnabled(GROWTH_SUPPORT_GROUP_ENTITLEMENTS)).not.toThrow();
    });
  });

  describe('assertAnalyticsEnabled', () => {
    it('throws if analytics is not enabled', () => {
      expect(() => assertAnalyticsEnabled(STARTER_SUPPORT_GROUP_ENTITLEMENTS)).toThrowError(
        /ENTITLEMENT_DENIED/,
      );
    });

    it('does not throw if analytics is enabled', () => {
      expect(() => assertAnalyticsEnabled(GROWTH_SUPPORT_GROUP_ENTITLEMENTS)).not.toThrow();
    });
  });

  describe('assertAiAssistEnabled', () => {
    it('throws if AI assist is not enabled', () => {
      expect(() => assertAiAssistEnabled(GROWTH_SUPPORT_GROUP_ENTITLEMENTS)).toThrowError(
        /ENTITLEMENT_DENIED/,
      );
    });

    it('does not throw if AI assist is enabled', () => {
      expect(() => assertAiAssistEnabled(PRO_SUPPORT_GROUP_ENTITLEMENTS)).not.toThrow();
    });
  });
});
