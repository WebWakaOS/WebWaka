/**
 * AgentLoop — SA-3.x / Wave 3
 * WebWaka OS — Extracted multi-turn agent execution loop for SuperAgent.
 *
 * Previously this logic lived inline in apps/api/src/routes/superagent.ts.
 * Extracting it here makes the loop independently testable, reusable across
 * HTTP and streaming paths, and enforces platform invariants in one place.
 *
 * Platform Invariants:
 *   P7  — All AI calls go through the injected adapter (no direct SDK calls)
 *   P8  — BYOK keys never logged; adapter is pre-configured
 *   P13 — PII must be stripped by caller before passing messages
 *   T3  — Tool execution context carries tenant_id (enforced in tool handlers)
 *
 * The loop:
 *   1. Calls adapter.complete() with the current message array + tools (if function_call)
 *   2. If the model returns tool_calls and rounds < MAX_TOOL_ROUNDS:
 *      a. Execute all tool calls in parallel via ToolRegistry.executeAll()
 *      b. Append assistant message + tool results to message array
 *      c. Call adapter.complete() again WITHOUT tools (model gives final answer)
 *   3. Repeat until finishReason !== 'tool_calls' or round cap reached
 *   4. Return final response + execution metadata
 */

import type { AIRequest, AIMessage, ToolCall } from '@webwaka/ai';
import type { ToolRegistry, ToolExecutionContext } from './tool-registry.js';
import { MAX_TOOL_ROUNDS } from './tool-registry.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIAdapter {
  complete(request: AIRequest): Promise<AIAdapterResponse>;
}

export interface AIAdapterResponse {
  content: string | null;
  finishReason: string;
  tokensUsed: number;
  provider: string;
  model: string;
  toolCalls?: ToolCall[];
}

export interface AgentLoopInput {
  /** Pre-built messages including system prompt and history */
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Injected adapter (already configured with provider key) */
  adapter: AIAdapter;
  /** Tool registry — only used for 'function_call' capability. Pass null for other capabilities. */
  toolRegistry: ToolRegistry | null;
  /** Execution context for tool handlers (tenant-scoped, T3) */
  toolCtx: ToolExecutionContext;
  /** Called after each tool round to allow telemetry/event publishing */
  onToolRound?: (round: number, toolNames: string[]) => void;
}

export interface AgentLoopResult {
  content: string;
  finishReason: string;
  tokensUsed: number;
  provider: string;
  model: string;
  toolRounds: number;
  totalToolCallsExecuted: number;
  /** All messages including assistant + tool result turns (for session persistence) */
  finalMessages: AIMessage[];
}

// ---------------------------------------------------------------------------
// AgentLoop
// ---------------------------------------------------------------------------

/**
 * Execute the SuperAgent multi-turn loop.
 * Throws on adapter errors — caller is responsible for catch + 503 response.
 */
export async function runAgentLoop(input: AgentLoopInput): Promise<AgentLoopResult> {
  const {
    adapter,
    toolRegistry,
    toolCtx,
    maxTokens = 1024,
    temperature = 0.7,
    onToolRound,
  } = input;

  let currentMessages: AIMessage[] = [...input.messages];
  let toolRound = 0;
  let totalToolCallsExecuted = 0;

  const buildRequest = (msgs: AIMessage[], includeTools: boolean): AIRequest => ({
    messages: msgs,
    maxTokens,
    temperature,
    ...(includeTools && toolRegistry && toolRegistry.size > 0
      ? { tools: toolRegistry.getDefinitions(), tool_choice: 'auto' as const }
      : {}),
  });

  // Initial call — include tools when toolRegistry is provided
  let response = await adapter.complete(buildRequest(currentMessages, true));

  // Multi-turn tool execution loop (capped at MAX_TOOL_ROUNDS)
  while (
    toolRegistry &&
    response.finishReason === 'tool_calls' &&
    response.toolCalls &&
    response.toolCalls.length > 0 &&
    toolRound < MAX_TOOL_ROUNDS
  ) {
    toolRound++;

    const toolNames = response.toolCalls.map((tc) => tc.function.name);
    onToolRound?.(toolRound, toolNames);

    // Execute all requested tool calls in parallel (tenant-scoped via toolCtx)
    const toolResults = await toolRegistry.executeAll(response.toolCalls, toolCtx);
    totalToolCallsExecuted += response.toolCalls.length;

    // Append assistant message (with tool_calls) + tool result messages
    currentMessages = [
      ...currentMessages,
      {
        role: 'assistant' as const,
        content: response.content ?? '',
        tool_calls: response.toolCalls,
      } as AIMessage,
      ...toolResults.map((r) => ({
        role: 'tool' as const,
        content: r.content,
        tool_call_id: r.tool_call_id,
      } as AIMessage)),
    ];

    // Continue conversation — no tools on continuation rounds
    response = await adapter.complete(buildRequest(currentMessages, false));
  }

  return {
    content: response.content ?? '',
    finishReason: response.finishReason,
    tokensUsed: response.tokensUsed,
    provider: response.provider,
    model: response.model,
    toolRounds: toolRound,
    totalToolCallsExecuted,
    finalMessages: currentMessages,
  };
}
