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

// ---------------------------------------------------------------------------
// DB-aware override tests (T006 — Entitlement Compatibility Bridge)
// Verify guards respect resolvedEntitlements from EntitlementEngine.
// ---------------------------------------------------------------------------

import {
  requireSensitiveSectorAccess,
  requireWakaPageAccess,
  evaluateWakaPageAccess,
  requireWakaPageAnalytics,
  evaluateWakaPageAnalytics,
  requireGroupsEnabled,
  evaluateGroupsEnabled,
  requireValueMovement,
  evaluateValueMovement,
} from './guards.js';

describe('requireBrandingRights — DB-aware overrides', () => {
  it('Free plan granted branding via DB override — passes', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(() => requireBrandingRights(ctx, { brandingRights: true })).not.toThrow();
  });

  it('Starter plan loses branding via DB override — throws', () => {
    const ctx = makeCtx(SubscriptionPlan.Starter, []);
    expect(() => requireBrandingRights(ctx, { brandingRights: false })).toThrow(EntitlementError);
  });

  it('Without override falls back to PLAN_CONFIGS — Free still throws', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(() => requireBrandingRights(ctx)).toThrow(EntitlementError);
  });
});

describe('requireDelegationRights — DB-aware overrides', () => {
  it('Free plan granted delegation via DB override — passes', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(() => requireDelegationRights(ctx, { delegationRights: true })).not.toThrow();
  });

  it('Enterprise loses delegation via DB override — throws', () => {
    const ctx = makeCtx(SubscriptionPlan.Enterprise, []);
    expect(() => requireDelegationRights(ctx, { delegationRights: false })).toThrow(EntitlementError);
  });
});

describe('requireAIAccess — DB-aware overrides', () => {
  it('Starter plan granted AI via DB override — passes', () => {
    const ctx = makeCtx(SubscriptionPlan.Starter, []);
    expect(() => requireAIAccess(ctx, { aiRights: true })).not.toThrow();
  });

  it('Growth loses AI via DB override — throws', () => {
    const ctx = makeCtx(SubscriptionPlan.Growth, []);
    expect(() => requireAIAccess(ctx, { aiRights: false })).toThrow(EntitlementError);
  });
});

describe('requireSensitiveSectorAccess — DB-aware overrides', () => {
  it('Free plan granted sensitive sector via DB override — passes', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(() => requireSensitiveSectorAccess(ctx, { sensitiveSectorRights: true })).not.toThrow();
  });

  it('Enterprise loses sensitive sector via DB override — throws', () => {
    const ctx = makeCtx(SubscriptionPlan.Enterprise, []);
    expect(() => requireSensitiveSectorAccess(ctx, { sensitiveSectorRights: false })).toThrow(EntitlementError);
  });
});

describe('WakaPage guards — DB-aware overrides', () => {
  it('requireWakaPageAccess: Free granted via DB override — passes', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(() => requireWakaPageAccess(ctx, { wakaPagePublicPage: true })).not.toThrow();
  });

  it('evaluateWakaPageAccess: returns overridden value', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(evaluateWakaPageAccess(ctx, { wakaPagePublicPage: true })).toBe(true);
    expect(evaluateWakaPageAccess(ctx)).toBe(false); // no override — PLAN_CONFIGS fallback
  });

  it('requireWakaPageAnalytics: Starter granted analytics via DB override — passes', () => {
    const ctx = makeCtx(SubscriptionPlan.Starter, []);
    expect(() => requireWakaPageAnalytics(ctx, { wakaPageAnalytics: true })).not.toThrow();
  });

  it('evaluateWakaPageAnalytics: returns overridden value', () => {
    const ctx = makeCtx(SubscriptionPlan.Starter, []);
    expect(evaluateWakaPageAnalytics(ctx, { wakaPageAnalytics: true })).toBe(true);
    expect(evaluateWakaPageAnalytics(ctx)).toBe(false); // Starter normally false
  });
});

describe('requireGroupsEnabled — DB-aware overrides', () => {
  it('Free plan enabled via DB override — passes', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(() => requireGroupsEnabled(ctx, { groupsEnabled: true })).not.toThrow();
  });

  it('Starter loses groups via DB override — throws', () => {
    const ctx = makeCtx(SubscriptionPlan.Starter, []);
    expect(() => requireGroupsEnabled(ctx, { groupsEnabled: false })).toThrow(EntitlementError);
  });

  it('evaluateGroupsEnabled: returns overridden value', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(evaluateGroupsEnabled(ctx, { groupsEnabled: true })).toBe(true);
    expect(evaluateGroupsEnabled(ctx)).toBe(false); // PLAN_CONFIGS fallback
  });
});

describe('requireValueMovement — DB-aware overrides', () => {
  it('Free plan enabled via DB override — passes', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(() => requireValueMovement(ctx, { valueMovementEnabled: true })).not.toThrow();
  });

  it('Starter loses value movement via DB override — throws', () => {
    const ctx = makeCtx(SubscriptionPlan.Starter, []);
    expect(() => requireValueMovement(ctx, { valueMovementEnabled: false })).toThrow(EntitlementError);
  });

  it('evaluateValueMovement: returns overridden value', () => {
    const ctx = makeCtx(SubscriptionPlan.Free, []);
    expect(evaluateValueMovement(ctx, { valueMovementEnabled: true })).toBe(true);
    expect(evaluateValueMovement(ctx)).toBe(false); // PLAN_CONFIGS fallback
  });
});
