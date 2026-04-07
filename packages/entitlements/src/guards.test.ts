/**
 * Tests for entitlement guards (throw on denial).
 */

import { describe, it, expect } from 'vitest';
import { SubscriptionPlan, SubscriptionStatus, PlatformLayer, Role } from '@webwaka/types';
import type { EntitlementContext } from '@webwaka/types';
import {
  requireLayerAccess,
  requireBrandingRights,
  requireDelegationRights,
  requireAIAccess,
  EntitlementError,
} from './guards.js';

function makeCtx(
  plan: SubscriptionPlan,
  layers: PlatformLayer[],
  status: SubscriptionStatus = SubscriptionStatus.Active,
): EntitlementContext {
  return {
    userId: 'user_001' as EntitlementContext['userId'],
    workspaceId: 'ws_001' as EntitlementContext['workspaceId'],
    tenantId: 'tenant_001' as EntitlementContext['tenantId'],
    role: Role.Admin,
    subscriptionPlan: plan,
    subscriptionStatus: status,
    activeLayers: layers,
  };
}

describe('requireLayerAccess', () => {
  it('passes when layer is present in activeLayers', () => {
    const ctx = makeCtx(SubscriptionPlan.Starter, [PlatformLayer.Discovery, PlatformLayer.Operational]);
    expect(() => requireLayerAccess(ctx, PlatformLayer.Operational)).not.toThrow();
  });

  it('throws EntitlementError when layer is absent', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, [PlatformLayer.Discovery]);
    expect(() => requireLayerAccess(ctx, PlatformLayer.Commerce)).toThrow(EntitlementError);
    expect(() => requireLayerAccess(ctx, PlatformLayer.Commerce)).toThrow(/commerce/i);
  });

  it('throws when subscription is cancelled', () => {
    const ctx = makeCtx(
      SubscriptionPlan.Enterprise,
      Object.values(PlatformLayer),
      SubscriptionStatus.Cancelled,
    );
    expect(() => requireLayerAccess(ctx, PlatformLayer.Discovery)).toThrow(EntitlementError);
  });
});

describe('requireBrandingRights', () => {
  it('passes for Starter and above', () => {
    const ctx = makeCtx(SubscriptionPlan.Starter, []);
    expect(() => requireBrandingRights(ctx)).not.toThrow();
  });

  it('throws for Free plan', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(() => requireBrandingRights(ctx)).toThrow(EntitlementError);
    expect(() => requireBrandingRights(ctx)).toThrow(/branding/i);
  });
});

describe('requireDelegationRights', () => {
  it('passes for Enterprise plan', () => {
    const ctx = makeCtx(SubscriptionPlan.Enterprise, []);
    expect(() => requireDelegationRights(ctx)).not.toThrow();
  });

  it('throws for Growth plan', () => {
    const ctx = makeCtx(SubscriptionPlan.Growth, []);
    expect(() => requireDelegationRights(ctx)).toThrow(EntitlementError);
    expect(() => requireDelegationRights(ctx)).toThrow(/delegation/i);
  });
});

describe('requireAIAccess', () => {
  it('passes for Growth and above', () => {
    const ctx = makeCtx(SubscriptionPlan.Growth, []);
    expect(() => requireAIAccess(ctx)).not.toThrow();
  });

  it('throws for Starter plan', () => {
    const ctx = makeCtx(SubscriptionPlan.Starter, []);
    expect(() => requireAIAccess(ctx)).toThrow(EntitlementError);
    expect(() => requireAIAccess(ctx)).toThrow(/AI/i);
  });

  it('throws for Free plan', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(() => requireAIAccess(ctx)).toThrow(EntitlementError);
  });
});

describe('EntitlementError', () => {
  it('has statusCode 403', () => {
    const err = new EntitlementError('denied');
    expect(err.statusCode).toBe(403);
    expect(err.name).toBe('EntitlementError');
  });
});
