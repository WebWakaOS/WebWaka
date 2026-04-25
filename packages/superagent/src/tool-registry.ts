/**
 * Tool Registry — SA-5.x
 * WebWaka OS — Typed, auth-aware tool execution registry for SuperAgent.
 *
 * The registry holds all tools that the AI model is allowed to call when
 * processing a 'function_call' capability request. Each tool has:
 *   - A ToolDefinition (JSON Schema — sent to the AI model)
 *   - A handler function (executed server-side when the model requests it)
 *
 * Platform Invariants:
 *   P7  — Tool handlers must NOT call AI APIs directly
 *   P8  — Tool handlers must NOT log API keys or BYOK credentials
 *   P13 — Tool handlers must NOT include raw PII in return values
 *   T3  — All D1 queries in tool handlers must be tenant-scoped
 *
 * Handlers receive the tenant ID and workspace context so every D1 query is
 * scoped to the requesting tenant (T3). They return a string result which is
 * fed back to the model as a tool message.
 *
 * Safety:
 *   - MAX_TOOL_ROUNDS limits multi-turn execution to prevent infinite loops
 *   - Unknown tool names return a descriptive error string (not a throw) so the
 *     model can communicate the failure to the user gracefully
 */

import type { ToolDefinition, ToolCall } from '@webwaka/ai';

export { ToolDefinition, ToolCall };

export const MAX_TOOL_ROUNDS = 3;

// ---------------------------------------------------------------------------
// Execution context injected into every tool handler (T3 — tenant-scoped)
// ---------------------------------------------------------------------------

export interface ToolExecutionContext {
  tenantId: string;
  workspaceId: string;
  userId: string;
  db: D1Database;
}

// ---------------------------------------------------------------------------
// Tool handler signature
// ---------------------------------------------------------------------------

export type ToolHandler = (
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
) => Promise<string>;

// ---------------------------------------------------------------------------
// Registered tool — definition + handler
// ---------------------------------------------------------------------------

export interface RegisteredTool {
  definition: ToolDefinition;
  handler: ToolHandler;
}

// ---------------------------------------------------------------------------
// ToolRegistry class
// ---------------------------------------------------------------------------

export class ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  /**
   * Register a tool in the registry.
   * The tool name must be unique — re-registering overrides the previous entry.
   */
  register(tool: RegisteredTool): void {
    this.tools.set(tool.definition.function.name, tool);
  }

  /**
   * Return all tool definitions to be sent to the AI model.
   * Returns an empty array if no tools are registered.
   */
  getDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  /**
   * Execute a tool call from the AI model.
   *
   * - Parses the JSON arguments string from the model.
   * - Invokes the handler with the parsed args and execution context.
   * - Returns the result as a string for the tool message.
   * - On any error, returns a structured error string so the model can report
   *   the failure to the user instead of crashing the conversation.
   */
  async execute(
    toolCall: ToolCall,
    ctx: ToolExecutionContext,
  ): Promise<string> {
    const tool = this.tools.get(toolCall.function.name);

    if (!tool) {
      return JSON.stringify({
        error: 'TOOL_NOT_FOUND',
        message: `No tool named '${toolCall.function.name}' is registered. Available tools: ${
          Array.from(this.tools.keys()).join(', ') || '(none)'
        }`,
      });
    }

    let args: Record<string, unknown>;
    try {
      args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
    } catch {
      return JSON.stringify({
        error: 'INVALID_ARGUMENTS',
        message: `Tool '${toolCall.function.name}' received unparseable arguments: ${toolCall.function.arguments}`,
      });
    }

    try {
      return await tool.handler(args, ctx);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return JSON.stringify({
        error: 'TOOL_EXECUTION_FAILED',
        tool: toolCall.function.name,
        message,
      });
    }
  }

  /**
   * Execute all tool calls from an AI response in parallel.
   * Returns an array of { tool_call_id, content } pairs ready to be
   * appended to the conversation as tool messages.
   */
  async executeAll(
    toolCalls: ToolCall[],
    ctx: ToolExecutionContext,
  ): Promise<Array<{ tool_call_id: string; content: string }>> {
    return Promise.all(
      toolCalls.map(async (tc) => ({
        tool_call_id: tc.id,
        content: await this.execute(tc, ctx),
      })),
    );
  }

  /** Number of registered tools. */
  get size(): number {
    return this.tools.size;
  }
}
