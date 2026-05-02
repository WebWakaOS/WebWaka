/**
 * Tool Registry — SA-5.x / Wave 3
 * WebWaka OS — Typed, auth-aware tool execution registry for SuperAgent.
 *
 * Wave 3 additions:
 *   - RegisteredTool now carries optional metadata (pillar, autonomyThreshold, readOnly)
 *   - executeWithTimeout() wraps handlers with a configurable deadline
 *   - getCatalogue() returns the full tool catalogue for GET /superagent/tools
 *
 * Platform Invariants:
 *   P7  — Tool handlers must NOT call AI APIs directly
 *   P8  — Tool handlers must NOT log API keys or BYOK credentials
 *   P13 — Tool handlers must NOT include raw PII in return values
 *   T3  — All D1 queries in tool handlers must be tenant-scoped
 */

import type { ToolDefinition, ToolCall } from '@webwaka/ai';
import type { HitlService } from './hitl-service.js';

export { ToolDefinition, ToolCall };

export const MAX_TOOL_ROUNDS = 3;
/** Default per-tool execution timeout in milliseconds */
export const DEFAULT_TOOL_TIMEOUT_MS = 5_000;

// ---------------------------------------------------------------------------
// Execution context
// ---------------------------------------------------------------------------

export interface ToolExecutionContext {
  tenantId: string;
  workspaceId: string;
  userId: string;
  db: D1Database;
  vertical: string;
  hitlService: HitlService;
  autonomyLevel: 1 | 2 | 3;
}

// ---------------------------------------------------------------------------
// Tool handler + metadata
// ---------------------------------------------------------------------------

export type ToolHandler = (
  args: Record<string, unknown>,
  ctx: ToolExecutionContext,
) => Promise<string>;

/** Wave 3: extended metadata on each registered tool */
export interface ToolMeta {
  /** Platform pillar this tool primarily serves */
  pillar: 1 | 2 | 3;
  /** true = handler never writes to DB; false = may write (HITL-gated) */
  readOnly: boolean;
  /**
   * Minimum autonomy level required to execute without HITL queuing.
   * undefined = always executes (read-only or no autonomy gating needed).
   */
  autonomyThreshold?: 1 | 2 | 3;
  /** Human-readable display label for the tool catalogue */
  displayName: string;
  /** Execution timeout override in ms (default: DEFAULT_TOOL_TIMEOUT_MS) */
  timeoutMs?: number;
}

export interface RegisteredTool {
  definition: ToolDefinition;
  handler: ToolHandler;
  /** Wave 3: optional metadata — enriches catalogue and observability */
  meta?: ToolMeta;
}

// ---------------------------------------------------------------------------
// Tool catalogue entry (safe to return over HTTP)
// ---------------------------------------------------------------------------

export interface ToolCatalogueEntry {
  name: string;
  description: string;
  pillar: number | null;
  readOnly: boolean | null;
  autonomyThreshold: number | null;
  displayName: string | null;
}

// ---------------------------------------------------------------------------
// ToolRegistry
// ---------------------------------------------------------------------------

export class ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  register(tool: RegisteredTool): void {
    this.tools.set(tool.definition.function.name, tool);
  }

  getDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  /** Wave 3: return safe tool catalogue for GET /superagent/tools */
  getCatalogue(): ToolCatalogueEntry[] {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.definition.function.name,
      description: t.definition.function.description ?? '',
      pillar: t.meta?.pillar ?? null,
      readOnly: t.meta?.readOnly ?? null,
      autonomyThreshold: t.meta?.autonomyThreshold ?? null,
      displayName: t.meta?.displayName ?? t.definition.function.name,
    }));
  }

  async execute(toolCall: ToolCall, ctx: ToolExecutionContext): Promise<string> {
    const tool = this.tools.get(toolCall.function.name);
    if (!tool) {
      return JSON.stringify({
        error: 'TOOL_NOT_FOUND',
        message: `No tool named '${toolCall.function.name}'. Available: ${
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
      return JSON.stringify({ error: 'TOOL_EXECUTION_FAILED', tool: toolCall.function.name, message });
    }
  }

  /**
   * Wave 3: Execute a single tool with a timeout.
   * If the handler exceeds timeoutMs, returns a TOOL_TIMEOUT error string.
   */
  async executeWithTimeout(
    toolCall: ToolCall,
    ctx: ToolExecutionContext,
    timeoutMs?: number,
  ): Promise<string> {
    const tool = this.tools.get(toolCall.function.name);
    const deadline = timeoutMs ?? tool?.meta?.timeoutMs ?? DEFAULT_TOOL_TIMEOUT_MS;

    const timeout = new Promise<string>((resolve) =>
      setTimeout(
        () =>
          resolve(
            JSON.stringify({
              error: 'TOOL_TIMEOUT',
              tool: toolCall.function.name,
              message: `Tool '${toolCall.function.name}' exceeded ${deadline}ms execution deadline`,
            }),
          ),
        deadline,
      ),
    );

    return Promise.race([this.execute(toolCall, ctx), timeout]);
  }

  async executeAll(
    toolCalls: ToolCall[],
    ctx: ToolExecutionContext,
  ): Promise<Array<{ tool_call_id: string; content: string }>> {
    return Promise.all(
      toolCalls.map(async (tc) => ({
        tool_call_id: tc.id,
        content: await this.executeWithTimeout(tc, ctx),
      })),
    );
  }

  get size(): number {
    return this.tools.size;
  }
}
