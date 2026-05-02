/**
 * Tool Registry — SA-5.x / Wave 3
 * WebWaka OS — Typed, auth-aware tool execution registry for SuperAgent.
 *
 * The registry holds all tools that the AI model is allowed to call when
 * processing a 'function_call' capability request. Each tool has:
 *   - A ToolDefinition (JSON Schema — sent to the AI model)
 *   - A handler function (executed server-side when the model requests it)
 *   - ToolMetadata (Wave 3 A2-6): pillar, autonomyThreshold, readOnly flag
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
 *   - executeWithTimeout (A2-8) wraps each tool call with a configurable deadline
 *     (default 5 000 ms) to prevent slow D1 queries blocking the agent loop
 */

import type { ToolDefinition, ToolCall } from '@webwaka/ai';
import type { HitlService } from './hitl-service.js';

export { ToolDefinition, ToolCall };

export const MAX_TOOL_ROUNDS = 3;

/** Default per-tool execution deadline in milliseconds (A2-8). */
export const DEFAULT_TOOL_TIMEOUT_MS = 5_000;

// ---------------------------------------------------------------------------
// Execution context injected into every tool handler (T3 — tenant-scoped)
// ---------------------------------------------------------------------------

export interface ToolExecutionContext {
  tenantId: string;
  workspaceId: string;
  userId: string;
  db: D1Database;
  /** SA-5.x: Vertical slug for this request — required for HITL submission context. */
  vertical: string;
  /** SA-5.x: HITL service for write-gating below the vertical's autonomy threshold. */
  hitlService: HitlService;
  /**
   * SA-5.x: Autonomy level for this request (1 | 2 | 3).
   * Write-capable tools queue a HITL item instead of writing directly when the
   * vertical's autonomy level is below the tool's required threshold.
   */
  autonomyLevel: 1 | 2 | 3;
}

// ---------------------------------------------------------------------------
// Tool handler signature
// ---------------------------------------------------------------------------

export type ToolHandler = (
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
) => Promise<string>;

// ---------------------------------------------------------------------------
// Tool metadata (Wave 3 A2-6)
// ---------------------------------------------------------------------------

/**
 * Descriptor metadata for a registered tool.
 * Surfaced by GET /superagent/tools (A2-7) and used for observability.
 */
export interface ToolMetadata {
  /**
   * WebWaka platform pillar this tool belongs to.
   *   1 = Operations (POS, inventory, bookings)
   *   2 = Community / workspace (staff, tasks)
   *   3 = Discovery / marketplace (search, listings)
   */
  pillar: 1 | 2 | 3;

  /**
   * Minimum autonomy level required for this tool to write without a HITL gate.
   * - readOnly tools: set to 1 (always allowed, no write path)
   * - write tools: 2 = gate at autonomy < 2; 3 = gate at autonomy < 3
   * Null means no autonomy threshold (tool is always read-only / safe).
   */
  autonomyThreshold: 1 | 2 | 3 | null;

  /** True when the tool never writes to D1 or external services. */
  readOnly: boolean;
}

// ---------------------------------------------------------------------------
// Registered tool — definition + handler + metadata
// ---------------------------------------------------------------------------

export interface RegisteredTool {
  definition: ToolDefinition;
  handler: ToolHandler;
  /** Wave 3 A2-6 — optional metadata. Defaults applied at registration if omitted. */
  metadata?: ToolMetadata;
}

// ---------------------------------------------------------------------------
// Catalogue entry returned by GET /superagent/tools (A2-7)
// ---------------------------------------------------------------------------

export interface ToolCatalogueEntry {
  name: string;
  description: string;
  pillar: 1 | 2 | 3;
  autonomyThreshold: 1 | 2 | 3 | null;
  readOnly: boolean;
  parametersSchema: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// ToolRegistry class
// ---------------------------------------------------------------------------

export class ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  /**
   * Register a tool in the registry.
   * The tool name must be unique — re-registering overrides the previous entry.
   * Missing metadata fields are filled in with safe defaults (read-only, pillar 1).
   */
  register(tool: RegisteredTool): void {
    const name = tool.definition.function.name;
    const meta: ToolMetadata = {
      pillar: tool.metadata?.pillar ?? 1,
      autonomyThreshold: tool.metadata?.autonomyThreshold ?? null,
      readOnly: tool.metadata?.readOnly ?? true,
    };
    this.tools.set(name, { ...tool, metadata: meta });
  }

  /**
   * Return all tool definitions to be sent to the AI model.
   * Returns an empty array if no tools are registered.
   */
  getDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  /**
   * Return the full tool catalogue for GET /superagent/tools (A2-7).
   * Includes name, description, metadata, and parameters schema.
   * Suitable for non-sensitive HTTP exposure (no handler functions).
   */
  getCatalogue(): ToolCatalogueEntry[] {
    return Array.from(this.tools.values()).map((t) => {
      const fn = t.definition.function;
      const meta = t.metadata!;
      return {
        name: fn.name,
        description: fn.description,
        pillar: meta.pillar,
        autonomyThreshold: meta.autonomyThreshold,
        readOnly: meta.readOnly,
        parametersSchema: fn.parameters as unknown as Record<string, unknown>,
      };
    });
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
   * Execute a single tool call with a timeout (Wave 3 A2-8).
   *
   * Wraps execute() with a configurable deadline. If the handler has not
   * resolved within `timeoutMs`, the call is abandoned and a TOOL_TIMEOUT
   * error string is returned — preventing slow D1 queries from blocking the
   * entire agent loop.
   *
   * @param toolCall  The tool call from the AI model.
   * @param ctx       Execution context (tenant-scoped).
   * @param timeoutMs Deadline in ms. Defaults to DEFAULT_TOOL_TIMEOUT_MS (5 000).
   */
  async executeWithTimeout(
    toolCall: ToolCall,
    ctx: ToolExecutionContext,
    timeoutMs: number = DEFAULT_TOOL_TIMEOUT_MS,
  ): Promise<string> {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<string>((resolve) => {
      timer = setTimeout(() => {
        resolve(
          JSON.stringify({
            error: 'TOOL_TIMEOUT',
            tool: toolCall.function.name,
            message: `Tool '${toolCall.function.name}' timed out after ${timeoutMs}ms.`,
            timeoutMs,
          }),
        );
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([
        this.execute(toolCall, ctx),
        timeoutPromise,
      ]);
      return result;
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  }

  /**
   * Execute all tool calls from an AI response in parallel using executeWithTimeout.
   * Returns an array of { tool_call_id, content } pairs ready to be
   * appended to the conversation as tool messages.
   *
   * @param toolCalls  Array of tool calls from the model.
   * @param ctx        Execution context.
   * @param timeoutMs  Per-tool deadline. Defaults to DEFAULT_TOOL_TIMEOUT_MS.
   */
  async executeAll(
    toolCalls: ToolCall[],
    ctx: ToolExecutionContext,
    timeoutMs: number = DEFAULT_TOOL_TIMEOUT_MS,
  ): Promise<Array<{ tool_call_id: string; content: string }>> {
    return Promise.all(
      toolCalls.map(async (tc) => ({
        tool_call_id: tc.id,
        content: await this.executeWithTimeout(tc, ctx, timeoutMs),
      })),
    );
  }

  /** Number of registered tools. */
  get size(): number {
    return this.tools.size;
  }
}
