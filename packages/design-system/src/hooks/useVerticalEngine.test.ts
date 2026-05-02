/**
 * Tests for useVerticalEngine hook — Wave 3 B3-4
 * Uses vitest + vi.fn() fetch mocking (no jsdom needed — pure logic tests)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Minimal React stub so the hook module can load without a real React env ──
vi.mock('react', () => {
  const stateMap = new Map<string, unknown>();
  const useState = <T>(init: T | (() => T)): [T, (v: T | ((p: T) => T)) => void] => {
    const key = String(Math.random());
    const val = typeof init === 'function' ? (init as () => T)() : init;
    stateMap.set(key, val);
    const setter = (v: T | ((p: T) => T)) => {
      stateMap.set(key, typeof v === 'function' ? (v as (p: T) => T)(stateMap.get(key) as T) : v);
    };
    return [val, setter];
  };
  const useRef = <T>(init: T): { current: T } => ({ current: init });
  const useCallback = <T extends (...args: unknown[]) => unknown>(fn: T): T => fn;
  const useEffect = (_fn: () => void): void => { /* no-op in unit tests */ };
  return { useState, useRef, useCallback, useEffect };
});

import { useVerticalEngine } from './useVerticalEngine.js';

// ── Mock fetch ────────────────────────────────────────────────────────────────

type MockFetch = ReturnType<typeof vi.fn>;

function makeFetchOk(body: unknown): MockFetch {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  });
}

function makeFetchFail(status: number, body: unknown = { message: 'error' }): MockFetch {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  });
}

const sampleProfile = {
  id: 'p1',
  slug: 'restaurant',
  workspaceId: 'ws1',
  state: 'claimed',
  restaurantName: 'Mama Cooks',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useVerticalEngine — initialization', () => {
  it('starts with loading=true and profile=null when not skipping fetch', () => {
    global.fetch = makeFetchOk(sampleProfile) as typeof fetch;
    const result = useVerticalEngine('restaurant', 'ws1');
    // In test env useEffect is no-op so loading stays at initial value
    expect(result.profile).toBeNull();
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('starts with loading=false when skipInitialFetch=true', () => {
    global.fetch = makeFetchOk(sampleProfile) as typeof fetch;
    const result = useVerticalEngine('restaurant', 'ws1', { skipInitialFetch: true });
    expect(result.loading).toBe(false);
  });
});

describe('useVerticalEngine — update()', () => {
  it('calls PATCH /api/v1/{slug}/profile with workspaceId + data', async () => {
    const mockFetch = makeFetchOk({ ...sampleProfile, restaurantName: 'New Name' });
    global.fetch = mockFetch as typeof fetch;
    const hook = useVerticalEngine('restaurant', 'ws1', { skipInitialFetch: true });
    const result = await hook.update({ restaurantName: 'New Name' });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/restaurant/profile',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result.restaurantName).toBe('New Name');
  });

  it('throws when PATCH returns non-ok', async () => {
    global.fetch = makeFetchFail(422, { message: 'Validation failed' }) as typeof fetch;
    const hook = useVerticalEngine('restaurant', 'ws1', { skipInitialFetch: true });
    await expect(hook.update({ restaurantName: '' })).rejects.toThrow('Validation failed');
  });

  it('uses custom baseUrl', async () => {
    const mockFetch = makeFetchOk(sampleProfile);
    global.fetch = mockFetch as typeof fetch;
    const hook = useVerticalEngine('restaurant', 'ws1', {
      skipInitialFetch: true,
      baseUrl: 'https://api.example.com',
    });
    await hook.update({ restaurantName: 'x' });
    expect(mockFetch.mock.calls[0]![0]).toContain('https://api.example.com');
  });
});

describe('useVerticalEngine — transition()', () => {
  it('calls POST /api/v1/{slug}/fsm/transition with toState', async () => {
    const mockFetch = makeFetchOk({ ...sampleProfile, state: 'active' });
    global.fetch = mockFetch as typeof fetch;
    const hook = useVerticalEngine('restaurant', 'ws1', { skipInitialFetch: true });
    const result = await hook.transition('active');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/restaurant/fsm/transition',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"toState":"active"'),
      }),
    );
    expect(result.state).toBe('active');
  });

  it('passes meta fields in POST body', async () => {
    const mockFetch = makeFetchOk(sampleProfile);
    global.fetch = mockFetch as typeof fetch;
    const hook = useVerticalEngine('restaurant', 'ws1', { skipInitialFetch: true });
    await hook.transition('suspended', { reason: 'policy violation' });
    const body = JSON.parse(mockFetch.mock.calls[0]![1]!.body as string) as Record<string, unknown>;
    expect(body.reason).toBe('policy violation');
    expect(body.toState).toBe('suspended');
  });

  it('throws when transition returns 400', async () => {
    global.fetch = makeFetchFail(400, { message: 'Invalid transition' }) as typeof fetch;
    const hook = useVerticalEngine('restaurant', 'ws1', { skipInitialFetch: true });
    await expect(hook.transition('active')).rejects.toThrow('Invalid transition');
  });
});

describe('useVerticalEngine — refresh()', () => {
  it('calls GET /api/v1/{slug}/profile?workspaceId=', async () => {
    const mockFetch = makeFetchOk(sampleProfile);
    global.fetch = mockFetch as typeof fetch;
    const hook = useVerticalEngine('restaurant', 'ws1', { skipInitialFetch: true });
    await hook.refresh();
    const url = mockFetch.mock.calls[0]![0] as string;
    expect(url).toContain('/api/v1/restaurant/profile');
    expect(url).toContain('workspaceId=ws1');
  });

  it('uses custom headers when provided', async () => {
    const mockFetch = makeFetchOk(sampleProfile);
    global.fetch = mockFetch as typeof fetch;
    const hook = useVerticalEngine('restaurant', 'ws1', {
      skipInitialFetch: true,
      headers: { Authorization: 'Bearer tok123' },
    });
    await hook.refresh();
    const reqInit = mockFetch.mock.calls[0]![1] as RequestInit;
    const headers = reqInit.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer tok123');
  });

  it('sets error on network failure without throwing', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network down')) as typeof fetch;
    const hook = useVerticalEngine('restaurant', 'ws1', { skipInitialFetch: true });
    // refresh catches internally and sets error state — should not propagate
    await expect(hook.refresh()).resolves.toBeUndefined();
  });
});
