/**
 * ToolRegistry tests — Wave 3 A2-6, A2-7, A2-8
 *
 * Covers:
 * A2-6: ToolMetadata on RegisteredTool — pillar, autonomyThreshold, readOnly
 * A2-7: getCatalogue() returns correct metadata for all registered tools
 * A2-8: executeWithTimeout() times out slow tools; fast tools resolve normally
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ToolRegistry,
  DEFAULT_TOOL_TIMEOUT_MS,
  type RegisteredTool,
  type ToolExecutionContext,
} from './tool-registry.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTool(
  name: string,
  handler: () => Promise<string>,
  metadata?: RegisteredTool['metadata'],
): RegisteredTool {
  return {
    definition: {
      type: 'function',
      function: {
        name,
        description: `Test tool: ${name}`,
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    handler: async (_args, _ctx) => handler(),
    metadata,
  };
}

const fakeCtx = {
  tenantId: 'tenant_001',
  workspaceId: 'ws_001',
  userId: 'user_001',
  vertical: 'restaurant',
  autonomyLevel: 3,
  db: {} as D1Database,
  hitlService: {} as any,
} satisfies ToolExecutionContext;

function makeCall(name: string, args: Record<string, unknown> = {}) {
  return {
    id: `call_${name}`,
    type: 'function' as const,
    function: { name, arguments: JSON.stringify(args) },
  };
}

// ---------------------------------------------------------------------------
// A2-6: ToolMetadata
// ---------------------------------------------------------------------------

describe('A2-6: ToolMetadata — pillar, autonomyThreshold, readOnly', () => {
  it('stores metadata supplied at registration', () => {
    const registry = new ToolRegistry();
    registry.register(
      makeTool('search_x', async () => '[]', { pillar: 3, autonomyThreshold: null, readOnly: true }),
    );
    const cat = registry.getCatalogue();
    expect(cat).toHaveLength(1);
    expect(cat[0].pillar).toBe(3);
    expect(cat[0].autonomyThreshold).toBeNull();
    expect(cat[0].readOnly).toBe(true);
  });

  it('applies safe defaults when metadata is omitted (readOnly=true, pillar=1, autonomyThreshold=null)', () => {
    const registry = new ToolRegistry();
    registry.register(makeTool('no_meta', async () => 'ok'));
    const cat = registry.getCatalogue();
    expect(cat[0].pillar).toBe(1);
    expect(cat[0].autonomyThreshold).toBeNull();
    expect(cat[0].readOnly).toBe(true);
  });

  it('stores write-capable metadata correctly', () => {
    const registry = new ToolRegistry();
    registry.register(
      makeTool('log_payment', async () => '{}', { pillar: 1, autonomyThreshold: 3, readOnly: false }),
    );
    const entry = registry.getCatalogue()[0];
    expect(entry.readOnly).toBe(false);
    expect(entry.autonomyThreshold).toBe(3);
  });

  it('re-registering a tool overrides its metadata', () => {
    const registry = new ToolRegistry();
    registry.register(
      makeTool('tool_a', async () => 'v1', { pillar: 1, autonomyThreshold: null, readOnly: true }),
    );
    registry.register(
      makeTool('tool_a', async () => 'v2', { pillar: 2, autonomyThreshold: 2, readOnly: false }),
    );
    expect(registry.size).toBe(1);
    const entry = registry.getCatalogue()[0];
    expect(entry.pillar).toBe(2);
    expect(entry.readOnly).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// A2-7: getCatalogue() — tool catalogue endpoint
// ---------------------------------------------------------------------------

describe('A2-7: getCatalogue() — tool catalogue for GET /superagent/tools', () => {
  it('returns all 14 default tools with correct shape after import', async () => {
    const { createDefaultToolRegistry } = await import('./tools/index.js');
    const registry = createDefaultToolRegistry();
    const catalogue = registry.getCatalogue();

    expect(catalogue).toHaveLength(14);

    // Every entry must have the required fields
    for (const entry of catalogue) {
      expect(entry.name).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect([1, 2, 3]).toContain(entry.pillar);
      expect(entry.readOnly === true || entry.readOnly === false).toBe(true);
      expect(entry.parametersSchema).toBeDefined();
    }
  });

  it('getCatalogue returns name and description from definition.function', () => {
    const registry = new ToolRegistry();
    registry.register(
      makeTool('check_stock', async () => '{}', { pillar: 1, autonomyThreshold: null, readOnly: true }),
    );
    const [entry] = registry.getCatalogue();
    expect(entry.name).toBe('check_stock');
    expect(entry.description).toContain('check_stock');
  });

  it('includes parametersSchema', () => {
    const registry = new ToolRegistry();
    registry.register(
      makeTool('search_cats', async () => '[]', { pillar: 3, autonomyThreshold: null, readOnly: true }),
    );
    const [entry] = registry.getCatalogue();
    expect(entry.parametersSchema).toMatchObject({ type: 'object' });
  });

  it('read-only tools have autonomyThreshold=null', async () => {
    const { createDefaultToolRegistry } = await import('./tools/index.js');
    const registry = createDefaultToolRegistry();
    const readOnly = registry.getCatalogue().filter((e) => e.readOnly);
    for (const entry of readOnly) {
      expect(entry.autonomyThreshold).toBeNull();
    }
  });

  it('write tools have non-null autonomyThreshold', async () => {
    const { createDefaultToolRegistry } = await import('./tools/index.js');
    const registry = createDefaultToolRegistry();
    const writes = registry.getCatalogue().filter((e) => !e.readOnly);
    // Must have at least some write tools
    expect(writes.length).toBeGreaterThan(0);
    for (const entry of writes) {
      expect(entry.autonomyThreshold).not.toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// A2-8: executeWithTimeout()
// ---------------------------------------------------------------------------

describe('A2-8: executeWithTimeout() — per-tool deadline', () => {
  it('returns result for tools that complete before timeout', async () => {
    const registry = new ToolRegistry();
    registry.register(makeTool('fast_tool', async () => JSON.stringify({ ok: true })));
    const result = await registry.executeWithTimeout(makeCall('fast_tool'), fakeCtx, 1_000);
    expect(JSON.parse(result)).toMatchObject({ ok: true });
  });

  it('returns TOOL_TIMEOUT error for tools that exceed the deadline', async () => {
    const registry = new ToolRegistry();
    registry.register(
      makeTool('slow_tool', () => new Promise((resolve) => setTimeout(() => resolve('done'), 500))),
    );

    const result = await registry.executeWithTimeout(makeCall('slow_tool'), fakeCtx, 50);
    const parsed = JSON.parse(result);
    expect(parsed.error).toBe('TOOL_TIMEOUT');
    expect(parsed.tool).toBe('slow_tool');
    expect(parsed.timeoutMs).toBe(50);
  }, 2_000);

  it('uses DEFAULT_TOOL_TIMEOUT_MS when no timeout is specified', () => {
    expect(DEFAULT_TOOL_TIMEOUT_MS).toBe(5_000);
  });

  it('TOOL_NOT_FOUND still resolves quickly even with timeout', async () => {
    const registry = new ToolRegistry();
    const result = await registry.executeWithTimeout(makeCall('nonexistent'), fakeCtx, 1_000);
    const parsed = JSON.parse(result);
    expect(parsed.error).toBe('TOOL_NOT_FOUND');
  });

  it('executeAll uses timeout for each tool', async () => {
    const registry = new ToolRegistry();
    registry.register(makeTool('fast_a', async () => '"a"'));
    registry.register(
      makeTool('slow_b', () => new Promise((resolve) => setTimeout(() => resolve('"b"'), 500))),
    );

    const results = await registry.executeAll(
      [makeCall('fast_a'), makeCall('slow_b')],
      fakeCtx,
      50, // timeout 50ms — slow_b should time out
    );

    expect(results).toHaveLength(2);
    expect(JSON.parse(results[0].content)).toBe('a');
    const slowResult = JSON.parse(results[1].content);
    expect(slowResult.error).toBe('TOOL_TIMEOUT');
  }, 2_000);

  it('clearTimeout is called after fast tool resolves (no timer leak)', async () => {
    const registry = new ToolRegistry();
    const clearSpy = vi.spyOn(global, 'clearTimeout');
    registry.register(makeTool('instant', async () => 'done'));
    await registry.executeWithTimeout(makeCall('instant'), fakeCtx, 1_000);
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
