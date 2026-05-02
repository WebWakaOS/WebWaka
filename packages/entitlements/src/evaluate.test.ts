/**
 * Tests for entitlement evaluation engine.
 */

import { describe, it, expect } from 'vitest';
import { SubscriptionPlan, SubscriptionStatus, PlatformLayer } from '@webwaka/types';
import type { Subscription } from '@webwaka/types';
import {
  evaluateLayerAccess,
  evaluateUserLimit,
  evaluatePlaceLimit,
  evaluateOfferingLimit,
  evaluateBrandingRights,
} from './evaluate.js';

// ---------------------------------------------------------------------------
// Test subscription factories
// ---------------------------------------------------------------------------

function makeSub(plan: SubscriptionPlan, status: SubscriptionStatus = SubscriptionStatus.Active): Subscription {
  return {
    id: 'sub_test_001' as Subscription['id'],
    workspaceId: 'ws_test_001' as Subscription['workspaceId'],
    tenantId: 'tenant_001' as Subscription['tenantId'],
    plan,
    status,
    currentPeriodStart: Math.floor(Date.now() / 1000) - 3600,
    currentPeriodEnd: Math.floor(Date.now() / 1000) + 86400 * 30,
    cancelAtPeriodEnd: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// evaluateLayerAccess
// ---------------------------------------------------------------------------

describe('evaluateLayerAccess', () => {
  it('Free plan: allows discovery layer', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    const result = evaluateLayerAccess(sub, PlatformLayer.Discovery);
    expect(result.allowed).toBe(true);
  });

  it('Free plan: denies operational layer', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    const result = evaluateLayerAccess(sub, PlatformLayer.Operational);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/operational/i);
  });

  it('Enterprise plan: allows all layers', () => {
    const sub = makeSub(SubscriptionPlan.Enterprise);
    for (const layer of Object.values(PlatformLayer)) {
      const result = evaluateLayerAccess(sub, layer);
      expect(result.allowed).toBe(true);
    }
  });

  it('Cancelled subscription: denies access regardless of plan', () => {
    const sub = makeSub(SubscriptionPlan.Enterprise, SubscriptionStatus.Cancelled);
    const result = evaluateLayerAccess(sub, PlatformLayer.Discovery);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/cancelled/i);
  });

  it('Trialing subscription: grants access', () => {
    const sub = makeSub(SubscriptionPlan.Starter, SubscriptionStatus.Trialing);
    const result = evaluateLayerAccess(sub, PlatformLayer.Operational);
    expect(result.allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluateUserLimit
// ---------------------------------------------------------------------------

describe('evaluateUserLimit', () => {
  it('Free plan: allows when under limit', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    expect(evaluateUserLimit(sub, 2).allowed).toBe(true);
  });

  it('Free plan: denies when at limit', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    const result = evaluateUserLimit(sub, 3);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/3\/3/);
  });

  it('Enterprise plan: always allows (unlimited)', () => {
    const sub = makeSub(SubscriptionPlan.Enterprise);
    expect(evaluateUserLimit(sub, 99999).allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluatePlaceLimit
// ---------------------------------------------------------------------------

describe('evaluatePlaceLimit', () => {
  it('Free plan: allows under limit', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    expect(evaluatePlaceLimit(sub, 0).allowed).toBe(true);
  });

  it('Free plan: denies at limit', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    const result = evaluatePlaceLimit(sub, 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/1\/1/);
  });

  it('Growth plan: denies at limit', () => {
    const sub = makeSub(SubscriptionPlan.Growth);
    const result = evaluatePlaceLimit(sub, 10);
    expect(result.allowed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluateOfferingLimit
// ---------------------------------------------------------------------------

describe('evaluateOfferingLimit', () => {
  it('Free plan: allows under limit', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    expect(evaluateOfferingLimit(sub, 4).allowed).toBe(true);
  });

  it('Free plan: denies at limit', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    expect(evaluateOfferingLimit(sub, 5).allowed).toBe(false);
  });

  it('Pro plan: unlimited offerings', () => {
    const sub = makeSub(SubscriptionPlan.Pro);
    expect(evaluateOfferingLimit(sub, 50000).allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluateBrandingRights
// ---------------------------------------------------------------------------

describe('evaluateBrandingRights', () => {
  it('Free plan: denies branding', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    expect(evaluateBrandingRights(sub).allowed).toBe(false);
  });

  it('Starter plan: allows branding', () => {
    const sub = makeSub(SubscriptionPlan.Starter);
    expect(evaluateBrandingRights(sub).allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// DB-aware override tests (T006 — Entitlement Compatibility Bridge)
// These verify that resolvedEntitlements from EntitlementEngine takes precedence
// over PLAN_CONFIGS when provided.
// ---------------------------------------------------------------------------

describe('evaluateLayerAccess — DB-aware overrides', () => {
  it('Free plan gains operational layer via DB override', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    // Normally free denies operational — DB resolves it as granted
    const resolved = { layers: [PlatformLayer.Discovery, PlatformLayer.Operational] };
    expect(evaluateLayerAccess(sub, PlatformLayer.Operational, resolved).allowed).toBe(true);
  });

  it('Enterprise plan loses a layer via DB override (downgrade scenario)', () => {
    const sub = makeSub(SubscriptionPlan.Enterprise);
    // DB override strips the layer (e.g. workspace suspended from sensitive sector)
    const resolved = { layers: [PlatformLayer.Discovery] };
    expect(evaluateLayerAccess(sub, PlatformLayer.Operational, resolved).allowed).toBe(false);
  });

  it('Cancelled subscription: DB override cannot bypass status check', () => {
    const sub = makeSub(SubscriptionPlan.Free, SubscriptionStatus.Cancelled);
    const resolved = { layers: Object.values(PlatformLayer) };
    // Status is checked before config — cancelled always denies
    expect(evaluateLayerAccess(sub, PlatformLayer.Discovery, resolved).allowed).toBe(false);
  });
});

describe('evaluateUserLimit — DB-aware overrides', () => {
  it('Free plan raised to 100 users via DB override', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    const resolved = { maxUsers: 100 };
    // Free normally caps at 3; DB says 100
    expect(evaluateUserLimit(sub, 50, resolved).allowed).toBe(true);
    expect(evaluateUserLimit(sub, 100, resolved).allowed).toBe(false);
  });

  it('Enterprise unlimited overridden to a specific cap via DB', () => {
    const sub = makeSub(SubscriptionPlan.Enterprise);
    const resolved = { maxUsers: 10 };
    expect(evaluateUserLimit(sub, 10, resolved).allowed).toBe(false);
    expect(evaluateUserLimit(sub, 9, resolved).allowed).toBe(true);
  });

  it('Without resolvedEntitlements, falls back to PLAN_CONFIGS', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    // No override — static free cap is 3
    expect(evaluateUserLimit(sub, 3).allowed).toBe(false);
    expect(evaluateUserLimit(sub, 2).allowed).toBe(true);
  });
});

describe('evaluatePlaceLimit — DB-aware overrides', () => {
  it('Free plan raised to 5 places via DB override', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    const resolved = { maxPlaces: 5 };
    expect(evaluatePlaceLimit(sub, 4, resolved).allowed).toBe(true);
    expect(evaluatePlaceLimit(sub, 5, resolved).allowed).toBe(false);
  });
});

describe('evaluateOfferingLimit — DB-aware overrides', () => {
  it('Free plan made unlimited via DB override', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    const resolved = { maxOfferings: -1 };
    expect(evaluateOfferingLimit(sub, 99999, resolved).allowed).toBe(true);
  });
});

describe('evaluateBrandingRights — DB-aware overrides', () => {
  it('Free plan granted branding rights via DB override', () => {
    const sub = makeSub(SubscriptionPlan.Free);
    const resolved = { brandingRights: true };
    expect(evaluateBrandingRights(sub, resolved).allowed).toBe(true);
  });

  it('Starter plan loses branding rights via DB override', () => {
    const sub = makeSub(SubscriptionPlan.Starter);
    const resolved = { brandingRights: false };
    expect(evaluateBrandingRights(sub, resolved).allowed).toBe(false);
  });
});
