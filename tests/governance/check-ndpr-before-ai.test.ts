/**
 * Governance Check Tests — check-ndpr-before-ai (Wave 3 C1-5)
 *
 * Verifies the NDPR consent gate check correctly detects:
 *   - Missing aiConsentGate (FAIL)
 *   - Missing aiEntitlementMiddleware (FAIL)
 *   - Missing ussdExclusionMiddleware (FAIL)
 *   - All present (PASS)
 */
import { describe, it, expect } from 'vitest';

function checkNdprCompliance(routeSource: string): {
  hasConsentGate: boolean;
  hasAiEntitlement: boolean;
  hasUssdExclusion: boolean;
  isCompliant: boolean;
} {
  const hasConsentGate = routeSource.includes('aiConsentGate') || routeSource.includes('consentGate');
  const hasAiEntitlement = routeSource.includes('aiEntitlementMiddleware');
  const hasUssdExclusion = routeSource.includes('ussdExclusionMiddleware');
  return {
    hasConsentGate,
    hasAiEntitlement,
    hasUssdExclusion,
    isCompliant: hasConsentGate && hasAiEntitlement && hasUssdExclusion,
  };
}

describe('Governance check: check-ndpr-before-ai (C1-5)', () => {
  const COMPLIANT_ROUTE = `
    router.use('/superagent', ussdExclusionMiddleware, aiConsentGate, aiEntitlementMiddleware, superagentRoutes);
  `;

  it('passes a compliant route definition', () => {
    const result = checkNdprCompliance(COMPLIANT_ROUTE);
    expect(result.isCompliant).toBe(true);
    expect(result.hasConsentGate).toBe(true);
    expect(result.hasAiEntitlement).toBe(true);
    expect(result.hasUssdExclusion).toBe(true);
  });

  it('fails when aiConsentGate is missing', () => {
    const route = `router.use('/superagent', ussdExclusionMiddleware, aiEntitlementMiddleware, handler);`;
    const result = checkNdprCompliance(route);
    expect(result.hasConsentGate).toBe(false);
    expect(result.isCompliant).toBe(false);
  });

  it('fails when aiEntitlementMiddleware is missing', () => {
    const route = `router.use('/superagent', ussdExclusionMiddleware, aiConsentGate, handler);`;
    const result = checkNdprCompliance(route);
    expect(result.hasAiEntitlement).toBe(false);
    expect(result.isCompliant).toBe(false);
  });

  it('fails when ussdExclusionMiddleware is missing', () => {
    const route = `router.use('/superagent', aiConsentGate, aiEntitlementMiddleware, handler);`;
    const result = checkNdprCompliance(route);
    expect(result.hasUssdExclusion).toBe(false);
    expect(result.isCompliant).toBe(false);
  });

  it('accepts consentGate as alias for aiConsentGate', () => {
    const route = `router.use('/superagent', ussdExclusionMiddleware, consentGate, aiEntitlementMiddleware, h);`;
    const result = checkNdprCompliance(route);
    expect(result.hasConsentGate).toBe(true);
  });

  it('empty route string fails all checks', () => {
    const result = checkNdprCompliance('');
    expect(result.isCompliant).toBe(false);
  });
});
