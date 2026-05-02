/**
 * PromptManager tests — Wave 3
 */

import { describe, it, expect } from 'vitest';
import { PromptManager } from './prompt-manager.js';

describe('PromptManager', () => {
  const pm = new PromptManager();

  it('builds a system prompt with the vertical name injected', () => {
    const { systemPrompt } = pm.build({ vertical: 'bakery', pillar: 1 });
    expect(systemPrompt).toContain('bakery');
    expect(systemPrompt).toContain('WebWaka SuperAgent');
  });

  it('includes capability addendum for function_call', () => {
    const { systemPrompt } = pm.build({ vertical: 'restaurant', pillar: 1, capability: 'function_call' });
    expect(systemPrompt).toContain('HITL queue');
    expect(systemPrompt).toContain('read-only tools');
  });

  it('injects sensitive sector warning for clinic vertical', () => {
    const { systemPrompt } = pm.build({ vertical: 'clinic', pillar: 1 });
    expect(systemPrompt).toContain('REGULATORY CONTEXT');
    expect(systemPrompt).toContain('qualified professional');
  });

  it('does NOT inject sensitive warning for standard verticals', () => {
    const { systemPrompt } = pm.build({ vertical: 'bakery', pillar: 2 });
    expect(systemPrompt).not.toContain('REGULATORY CONTEXT');
  });

  it('includes tenant name when provided', () => {
    const { systemPrompt } = pm.build({ vertical: 'hotel', pillar: 2, tenantName: 'Sunshine Hotel' });
    expect(systemPrompt).toContain('Sunshine Hotel');
  });

  it('includes today\'s date in prompt', () => {
    const today = new Date().toISOString().split('T')[0];
    const { systemPrompt } = pm.build({ vertical: 'farm', pillar: 1 });
    expect(systemPrompt).toContain(today);
  });

  it('returns the current version tag', () => {
    const { version } = pm.build({ vertical: 'pharmacy', pillar: 1 });
    expect(version).toBe(PromptManager.VERSION);
  });

  it('includes NDPR consent reminder', () => {
    const { systemPrompt } = pm.build({ vertical: 'restaurant', pillar: 1 });
    expect(systemPrompt).toContain('NDPR consent');
  });

  it('pillar 3 description references marketplace', () => {
    const { systemPrompt } = pm.build({ vertical: 'market', pillar: 3 });
    expect(systemPrompt).toContain('marketplace');
  });
});
