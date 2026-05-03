/**
 * AgentLoop tests — SA-3.x / Wave 3
 * Covers: tool round capping, error recovery, HITL gating, multi-turn state
 */

import { describe, it, expect, vi } from 'vitest';
import { runAgentLoop } from './agent-loop.js';
import type { AIAdapter, AIAdapterResponse } from './agent-loop.js';
import { ToolRegistry } from './tool-registry.js';
import { MAX_TOOL_ROUNDS } from './tool-registry.js';
import type { ToolExecutionContext } from './tool-registry.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAdapter(responses: Partial<AIAdapterResponse>[]): AIAdapter {
  let idx = 0;
  return {
    complete: vi.fn().mockImplementation(async () => {
      const base: AIAdapterResponse = {
        content: 'Final answer',
        finishReason: 'stop',
        tokensUsed: 100,
        provider: 'groq',
        model: 'llama-3.1-8b-instant',
      };
      const r = { ...base, ...responses[idx] };
      idx = Math.min(idx + 1, responses.length - 1);
      return r;
    }),
  };
}

function makeToolCtx(): ToolExecutionContext {
  return {
    tenantId: 'tnt_test',
    workspaceId: 'ws_test',
    userId: 'usr_test',
    db: {} as D1Database,
    vertical: 'bakery',
    hitlService: {} as never,
    autonomyLevel: 3,
  };
}

const baseMessages = [{ role: 'user' as const, content: 'Hello' }];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('runAgentLoop', () => {
  it('returns response directly when no tools are requested', async () => {
    const adapter = makeAdapter([{ content: 'Hi there', finishReason: 'stop', tokensUsed: 50 }]);
    const result = await runAgentLoop({
      messages: baseMessages,
      adapter,
      toolRegistry: null,
      toolCtx: makeToolCtx(),
    });

    expect(result.content).toBe('Hi there');
    expect(result.toolRounds).toBe(0);
    expect(result.totalToolCallsExecuted).toBe(0);
    expect(adapter.complete).toHaveBeenCalledTimes(1);
  });

  it('executes a single tool round and returns final answer', async () => {
    const registry = new ToolRegistry();
    registry.register({
      definition: {
        type: 'function',
        function: { name: 'inventory_check', description: 'Check stock', parameters: { type: 'object', properties: {}, required: [] } },
      },
      handler: vi.fn().mockResolvedValue('{"stock": 42}'),
    });

    const adapter = makeAdapter([
      {
        content: null,
        finishReason: 'tool_calls',
        tokensUsed: 50,
        toolCalls: [{ id: 'tc_1', type: 'function', function: { name: 'inventory_check', arguments: '{}' } }],
      },
      { content: 'You have 42 items in stock.', finishReason: 'stop', tokensUsed: 60 },
    ]);

    const result = await runAgentLoop({
      messages: baseMessages,
      adapter,
      toolRegistry: registry,
      toolCtx: makeToolCtx(),
    });

    expect(result.toolRounds).toBe(1);
    expect(result.totalToolCallsExecuted).toBe(1);
    expect(result.content).toBe('You have 42 items in stock.');
    expect(adapter.complete).toHaveBeenCalledTimes(2);
  });

  it('caps tool rounds at MAX_TOOL_ROUNDS to prevent infinite loops', async () => {
    const registry = new ToolRegistry();
    registry.register({
      definition: {
        type: 'function',
        function: { name: 'loop_tool', description: 'Loops forever', parameters: { type: 'object', properties: {}, required: [] } },
      },
      handler: vi.fn().mockResolvedValue('ok'),
    });

    // Always returns tool_calls — should be capped
    const adapter: AIAdapter = {
      complete: vi.fn().mockResolvedValue({
        content: null,
        finishReason: 'tool_calls',
        tokensUsed: 10,
        provider: 'groq',
        model: 'test',
        toolCalls: [{ id: 'tc_x', type: 'function', function: { name: 'loop_tool', arguments: '{}' } }],
      }),
    };

    const result = await runAgentLoop({
      messages: baseMessages,
      adapter,
      toolRegistry: registry,
      toolCtx: makeToolCtx(),
    });

    // Should have exited after MAX_TOOL_ROUNDS even though model kept requesting tools
    expect(result.toolRounds).toBe(MAX_TOOL_ROUNDS);
    // adapter called: 1 initial + MAX_TOOL_ROUNDS continuation rounds
    expect((adapter.complete as ReturnType<typeof vi.fn>).mock.calls.length).toBe(MAX_TOOL_ROUNDS + 1);
  });

  it('calls onToolRound callback on each round', async () => {
    const registry = new ToolRegistry();
    registry.register({
      definition: {
        type: 'function',
        function: { name: 'test_tool', description: 'Test', parameters: { type: 'object', properties: {}, required: [] } },
      },
      handler: vi.fn().mockResolvedValue('result'),
    });

    const adapter = makeAdapter([
      {
        content: null,
        finishReason: 'tool_calls',
        toolCalls: [{ id: 'tc_1', type: 'function', function: { name: 'test_tool', arguments: '{}' } }],
        tokensUsed: 10,
      },
      { content: 'Done', finishReason: 'stop', tokensUsed: 20 },
    ]);

    const onToolRound = vi.fn();
    await runAgentLoop({
      messages: baseMessages,
      adapter,
      toolRegistry: registry,
      toolCtx: makeToolCtx(),
      onToolRound,
    });

    expect(onToolRound).toHaveBeenCalledOnce();
    expect(onToolRound).toHaveBeenCalledWith(1, ['test_tool']);
  });

  it('propagates adapter errors so caller can return 503', async () => {
    const adapter: AIAdapter = {
      complete: vi.fn().mockRejectedValue(new Error('Provider timeout')),
    };

    await expect(
      runAgentLoop({
        messages: baseMessages,
        adapter,
        toolRegistry: null,
        toolCtx: makeToolCtx(),
      }),
    ).rejects.toThrow('Provider timeout');
  });

  it('includes all messages in finalMessages for session persistence', async () => {
    const registry = new ToolRegistry();
    registry.register({
      definition: {
        type: 'function',
        function: { name: 'check_stock', description: 'Check', parameters: { type: 'object', properties: {}, required: [] } },
      },
      handler: vi.fn().mockResolvedValue('{"stock":5}'),
    });

    const adapter = makeAdapter([
      {
        content: null,
        finishReason: 'tool_calls',
        toolCalls: [{ id: 'tc_1', type: 'function', function: { name: 'check_stock', arguments: '{}' } }],
        tokensUsed: 10,
      },
      { content: 'Stock is 5.', finishReason: 'stop', tokensUsed: 20 },
    ]);

    const result = await runAgentLoop({
      messages: baseMessages,
      adapter,
      toolRegistry: registry,
      toolCtx: makeToolCtx(),
    });

    // finalMessages should include: original + assistant tool_calls message + tool result message
    expect(result.finalMessages.length).toBeGreaterThan(baseMessages.length);
    const roles = result.finalMessages.map((m) => m.role);
    expect(roles).toContain('assistant');
    expect(roles).toContain('tool');
  });
});
