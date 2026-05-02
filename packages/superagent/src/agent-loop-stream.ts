/**
 * AgentLoopStream — SA-3.x / Wave 3 (A1-5)
 * WebWaka OS — Streaming multi-turn agent loop for POST /superagent/chat/stream
 *
 * This variant adds streaming to the multi-turn agent loop. The adapter
 * streams the final response token-by-token while still supporting tool
 * rounds (tool calls are executed non-streaming, then the final answer is streamed).
 *
 * Protocol: Server-Sent Events (SSE), UTF-8 text
 *   data: {"type":"token","content":"Hello"}
 *   data: {"type":"tool_start","tool":"search_offerings","round":1}
 *   data: {"type":"tool_result","tool":"search_offerings","success":true}
 *   data: {"type":"done","tokensUsed":450,"toolRounds":1,"provider":"openai","model":"gpt-4o-mini"}
 *   data: [DONE]
 *
 * Platform Invariants:
 *   P7  — All AI calls go through the injected adapter
 *   P8  — BYOK keys never logged or emitted in SSE stream
 *   P13 — PII stripped by caller before messages enter the loop
 *   T3  — Tool context carries tenant_id
 */

import type { AIRequest, AIMessage, ToolCall } from '@webwaka/ai';
import type { ToolRegistry, ToolExecutionContext } from './tool-registry.js';
import type { AIAdapter, AIAdapterResponse } from './agent-loop.js';
import { MAX_TOOL_ROUNDS } from './tool-registry.js';

// ---------------------------------------------------------------------------
// SSE event types
// ---------------------------------------------------------------------------

export type SSEEvent =
  | { type: 'token'; content: string }
  | { type: 'tool_start'; tool: string; round: number }
  | { type: 'tool_result'; tool: string; success: boolean; error?: string }
  | { type: 'done'; tokensUsed: number; toolRounds: number; provider: string; model: string; totalToolCallsExecuted: number }
  | { type: 'error'; message: string };

export type SSEEmitter = (event: SSEEvent) => void;

// ---------------------------------------------------------------------------
// Streaming adapter interface (extends non-streaming)
// ---------------------------------------------------------------------------

export interface StreamingAIAdapter extends AIAdapter {
  /** Stream tokens — calls onToken for each token, resolves with full metadata. */
  stream(
    request: AIRequest,
    onToken: (token: string) => void,
  ): Promise<AIAdapterResponse>;
}

// ---------------------------------------------------------------------------
// AgentLoopStreamInput
// ---------------------------------------------------------------------------

export interface AgentLoopStreamInput {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Adapter MUST implement stream(). If adapter.stream is absent, falls back to complete(). */
  adapter: StreamingAIAdapter;
  toolRegistry: ToolRegistry | null;
  toolCtx: ToolExecutionContext;
  /** Called per SSE event — caller writes to Response stream. */
  emit: SSEEmitter;
}

// ---------------------------------------------------------------------------
// runAgentLoopStream
// ---------------------------------------------------------------------------

/**
 * Streaming multi-turn agent loop.
 *
 * Tool rounds are executed synchronously (non-streaming); only the final
 * answer turn is streamed token-by-token.
 *
 * Usage (Hono route):
 *   const { readable, writable } = new TransformStream();
 *   const writer = writable.getWriter();
 *   const emit: SSEEmitter = (event) => {
 *     writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
 *   };
 *   await runAgentLoopStream({ ...input, emit });
 *   emit({ type: 'done', ... });
 *   writer.write(encoder.encode('data: [DONE]\n\n'));
 *   writer.close();
 *   return new Response(readable, { headers: { 'Content-Type': 'text/event-stream' } });
 */
export async function runAgentLoopStream(input: AgentLoopStreamInput): Promise<void> {
  const { messages, adapter, toolRegistry, toolCtx, emit } = input;
  const maxTokens = input.maxTokens ?? 2048;
  const temperature = input.temperature ?? 0.7;

  let currentMessages: AIMessage[] = [...messages];
  let toolRound = 0;
  let totalToolCallsExecuted = 0;

  const buildRequest = (msgs: AIMessage[], withTools: boolean): AIRequest => ({
    messages: msgs,
    maxTokens,
    temperature,
    tools: withTools && toolRegistry ? toolRegistry.getDefinitions() : undefined,
    toolChoice: withTools && toolRegistry ? 'auto' : undefined,
  } as AIRequest);

  // -------------------------------------------------------------------------
  // Tool rounds (non-streaming)
  // -------------------------------------------------------------------------
  while (toolRound < MAX_TOOL_ROUNDS) {
    let response: AIAdapterResponse;
    try {
      response = await adapter.complete(buildRequest(currentMessages, toolRegistry !== null));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Adapter error';
      emit({ type: 'error', message: msg });
      return;
    }

    if (response.finishReason !== 'tool_calls' || !response.toolCalls?.length || !toolRegistry) {
      // No tool calls — stream the final answer
      break;
    }

    toolRound++;
    const toolCalls: ToolCall[] = response.toolCalls;

    // Emit tool_start events
    for (const tc of toolCalls) {
      emit({ type: 'tool_start', tool: tc.function.name, round: toolRound });
    }

    // Execute tools in parallel
    const toolResults = await toolRegistry.executeAll(toolCalls, toolCtx);
    totalToolCallsExecuted += toolResults.length;

    // Emit tool_result events
    for (let i = 0; i < toolCalls.length; i++) {
      const tc = toolCalls[i]!;
      const result = toolResults[i];
      const parsed = result ? (() => { try { return JSON.parse(result.content); } catch { return {}; } })() : {};
      const success = !parsed?.error;
      emit({ type: 'tool_result', tool: tc.function.name, success, error: parsed?.error });
    }

    // Append assistant + tool result messages
    currentMessages = [
      ...currentMessages,
      {
        role: 'assistant' as const,
        content: response.content ?? '',
        tool_calls: toolCalls,
      } as AIMessage,
      ...toolResults.map((r) => ({
        role: 'tool' as const,
        content: r.content,
        tool_call_id: r.tool_call_id,
      } as AIMessage)),
    ];
  }

  // -------------------------------------------------------------------------
  // Final answer — stream tokens
  // -------------------------------------------------------------------------
  let finalResponse: AIAdapterResponse;

  if (typeof adapter.stream === 'function') {
    try {
      finalResponse = await adapter.stream(
        buildRequest(currentMessages, false),
        (token: string) => emit({ type: 'token', content: token }),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Stream error';
      emit({ type: 'error', message: msg });
      return;
    }
  } else {
    // Fallback: complete() then emit whole content as one token
    finalResponse = await adapter.complete(buildRequest(currentMessages, false));
    if (finalResponse.content) {
      emit({ type: 'token', content: finalResponse.content });
    }
  }

  emit({
    type: 'done',
    tokensUsed: finalResponse.tokensUsed,
    toolRounds: toolRound,
    provider: finalResponse.provider,
    model: finalResponse.model,
    totalToolCallsExecuted,
  });
}
