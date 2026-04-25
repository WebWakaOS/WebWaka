/**
 * SessionService — SA-6.x
 * WebWaka OS — Server-side persistent conversation state for /superagent/chat.
 *
 * D1 tables: ai_sessions, ai_session_messages (migration 0390).
 *
 * Sessions are:
 *   - Tenant-scoped (T3) — all queries bind tenant_id
 *   - NDPR-aware (P13) — content stored only after PII stripping at call site
 *   - TTL-capped — default 7 days of inactivity; configurable per vertical
 *   - Fully wipeable via deleteSession() for GDPR compliance
 *
 * Context-window trimming:
 *   loadHistory() accepts a maxTokens param. If the sum of token estimates
 *   exceeds it, the oldest non-system messages are dropped until it fits.
 *   Heuristic: 4 chars ≈ 1 token (fast, no model-specific tokenizer needed).
 */

export interface SessionMessage {
  id: string;
  sessionId: string;
  tenantId: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallsJson: string | null;
  toolCallId: string | null;
  tokenEstimate: number;
  createdAt: string;
}

export interface Session {
  id: string;
  tenantId: string;
  userId: string;
  workspaceId: string | null;
  vertical: string | null;
  title: string | null;
  messageCount: number;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

export interface SessionListItem {
  id: string;
  tenantId: string;
  userId: string;
  vertical: string | null;
  title: string | null;
  messageCount: number;
  lastActiveAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface AppendMessageInput {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallsJson?: string | null;
  toolCallId?: string | null;
}

export interface SessionServiceDeps {
  db: {
    prepare(sql: string): {
      bind(...values: unknown[]): {
        run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
        first<T>(): Promise<T | null>;
        all<T>(): Promise<{ results: T[] }>;
      };
    };
    batch(stmts: unknown[]): Promise<Array<{ success: boolean }>>;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_TTL_DAYS = 7;
const CHARS_PER_TOKEN = 4;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function sessionTtl(ttlDays: number = DEFAULT_TTL_DAYS): string {
  return new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
}

// ---------------------------------------------------------------------------
// SessionService
// ---------------------------------------------------------------------------

export class SessionService {
  private readonly db: SessionServiceDeps['db'];

  constructor(deps: SessionServiceDeps) {
    this.db = deps.db;
  }

  // ── Create ─────────────────────────────────────────────────────────────────

  async createSession(opts: {
    tenantId: string;
    userId: string;
    workspaceId?: string | null;
    vertical?: string | null;
    title?: string | null;
    ttlDays?: number;
  }): Promise<Session> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const expiresAt = sessionTtl(opts.ttlDays);

    await this.db
      .prepare(
        `INSERT INTO ai_sessions
           (id, tenant_id, user_id, workspace_id, vertical, title, message_count,
            created_at, last_active_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      )
      .bind(
        id,
        opts.tenantId,
        opts.userId,
        opts.workspaceId ?? null,
        opts.vertical ?? null,
        opts.title ?? null,
        now,
        now,
        expiresAt,
      )
      .run();

    return {
      id,
      tenantId: opts.tenantId,
      userId: opts.userId,
      workspaceId: opts.workspaceId ?? null,
      vertical: opts.vertical ?? null,
      title: opts.title ?? null,
      messageCount: 0,
      createdAt: now,
      lastActiveAt: now,
      expiresAt,
    };
  }

  // ── Get (with expiry check) ─────────────────────────────────────────────────

  async getSession(id: string, tenantId: string): Promise<Session | null> {
    const row = await this.db
      .prepare(
        `SELECT id, tenant_id, user_id, workspace_id, vertical, title, message_count,
                created_at, last_active_at, expires_at
         FROM ai_sessions
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(id, tenantId)
      .first<{
        id: string; tenant_id: string; user_id: string; workspace_id: string | null;
        vertical: string | null; title: string | null; message_count: number;
        created_at: string; last_active_at: string; expires_at: string;
      }>();

    if (!row) return null;

    // Enforce TTL at read time
    if (new Date(row.expires_at) < new Date()) {
      await this.db
        .prepare(`DELETE FROM ai_sessions WHERE id = ? AND tenant_id = ?`)
        .bind(id, tenantId)
        .run();
      return null;
    }

    return this.mapSession(row);
  }

  // ── Append messages (batch) ─────────────────────────────────────────────────

  async appendMessages(
    sessionId: string,
    tenantId: string,
    messages: AppendMessageInput[],
    ttlDays: number = DEFAULT_TTL_DAYS,
  ): Promise<void> {
    if (messages.length === 0) return;

    const now = new Date().toISOString();

    const inserts = messages.map((m) => {
      const tokenEstimate = estimateTokens(m.content);
      return this.db
        .prepare(
          `INSERT INTO ai_session_messages
             (id, session_id, tenant_id, role, content, tool_calls_json,
              tool_call_id, token_estimate, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          sessionId,
          tenantId,
          m.role,
          m.content,
          m.toolCallsJson ?? null,
          m.toolCallId ?? null,
          tokenEstimate,
          now,
        );
    });

    const countDelta = messages.length;

    // Use the caller-supplied ttlDays to extend expires_at, preserving the
    // per-vertical TTL policy set at session creation time.
    const updateSession = this.db
      .prepare(
        `UPDATE ai_sessions
         SET message_count   = message_count + ?,
             last_active_at  = ?,
             expires_at      = ?
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(countDelta, now, sessionTtl(ttlDays), sessionId, tenantId);

    await this.db.batch([...inserts, updateSession]);
  }

  // ── Load history (with context-window trimming) ─────────────────────────────

  async loadHistory(
    sessionId: string,
    tenantId: string,
    maxTokens: number = 8192,
  ): Promise<Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_calls?: unknown[];
    tool_call_id?: string;
  }>> {
    const { results } = await this.db
      .prepare(
        `SELECT role, content, tool_calls_json, tool_call_id, token_estimate
         FROM ai_session_messages
         WHERE session_id = ? AND tenant_id = ?
         ORDER BY created_at ASC`,
      )
      .bind(sessionId, tenantId)
      .all<{
        role: string;
        content: string;
        tool_calls_json: string | null;
        tool_call_id: string | null;
        token_estimate: number;
      }>();

    if (results.length === 0) return [];

    // Split system messages (always preserved) from regular turns
    const systemMsgs = results.filter((r) => r.role === 'system');
    const nonSystemMsgs = results.filter((r) => r.role !== 'system');

    const systemTokens = systemMsgs.reduce((s, m) => s + m.token_estimate, 0);
    const budget = maxTokens - systemTokens;

    // Trim oldest non-system messages until total fits within budget
    let runningTokens = nonSystemMsgs.reduce((s, m) => s + m.token_estimate, 0);
    let trimStart = 0;
    while (runningTokens > budget && trimStart < nonSystemMsgs.length) {
      runningTokens -= nonSystemMsgs[trimStart]!.token_estimate;
      trimStart++;
    }

    const trimmed = nonSystemMsgs.slice(trimStart);
    const ordered = [...systemMsgs, ...trimmed];

    return ordered.map((r) => ({
      role: r.role as 'system' | 'user' | 'assistant' | 'tool',
      content: r.content,
      ...(r.tool_calls_json ? { tool_calls: JSON.parse(r.tool_calls_json) as unknown[] } : {}),
      ...(r.tool_call_id ? { tool_call_id: r.tool_call_id } : {}),
    }));
  }

  // ── Delete (GDPR hard-delete) ───────────────────────────────────────────────

  async deleteSession(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .prepare(`DELETE FROM ai_sessions WHERE id = ? AND tenant_id = ?`)
      .bind(id, tenantId)
      .run();
    return (result.meta?.changes ?? 0) > 0;
  }

  // ── List (paginated, cursor-based) ──────────────────────────────────────────

  async listSessions(opts: {
    tenantId: string;
    userId: string;
    limit?: number;
    cursor?: string | null;
  }): Promise<{ sessions: SessionListItem[]; nextCursor: string | null }> {
    const limit = Math.min(opts.limit ?? 20, 100);
    const now = new Date().toISOString();

    let sql = `SELECT id, tenant_id, user_id, vertical, title, message_count,
                      last_active_at, expires_at, created_at
               FROM ai_sessions
               WHERE tenant_id = ? AND user_id = ? AND expires_at > ?`;
    const bindings: unknown[] = [opts.tenantId, opts.userId, now];

    if (opts.cursor) {
      sql += ` AND last_active_at < ?`;
      bindings.push(opts.cursor);
    }

    sql += ` ORDER BY last_active_at DESC LIMIT ?`;
    bindings.push(limit + 1);

    const { results } = await this.db
      .prepare(sql)
      .bind(...bindings)
      .all<{
        id: string; tenant_id: string; user_id: string;
        vertical: string | null; title: string | null;
        message_count: number; last_active_at: string;
        expires_at: string; created_at: string;
      }>();

    const hasMore = results.length > limit;
    const page = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? (page[page.length - 1]?.last_active_at ?? null) : null;

    return {
      sessions: page.map((r) => ({
        id: r.id,
        tenantId: r.tenant_id,
        userId: r.user_id,
        vertical: r.vertical,
        title: r.title,
        messageCount: r.message_count,
        lastActiveAt: r.last_active_at,
        expiresAt: r.expires_at,
        createdAt: r.created_at,
      })),
      nextCursor,
    };
  }

  // ── Get messages for a session ──────────────────────────────────────────────

  async getMessages(
    sessionId: string,
    tenantId: string,
  ): Promise<SessionMessage[]> {
    const { results } = await this.db
      .prepare(
        `SELECT id, session_id, tenant_id, role, content, tool_calls_json,
                tool_call_id, token_estimate, created_at
         FROM ai_session_messages
         WHERE session_id = ? AND tenant_id = ?
         ORDER BY created_at ASC`,
      )
      .bind(sessionId, tenantId)
      .all<{
        id: string; session_id: string; tenant_id: string; role: string;
        content: string; tool_calls_json: string | null; tool_call_id: string | null;
        token_estimate: number; created_at: string;
      }>();

    return results.map((r) => ({
      id: r.id,
      sessionId: r.session_id,
      tenantId: r.tenant_id,
      role: r.role as SessionMessage['role'],
      content: r.content,
      toolCallsJson: r.tool_calls_json,
      toolCallId: r.tool_call_id,
      tokenEstimate: r.token_estimate,
      createdAt: r.created_at,
    }));
  }

  // ── Prune expired sessions (scheduler / CRON) ───────────────────────────────

  static async pruneExpiredSessions(
    db: SessionServiceDeps['db'],
  ): Promise<number> {
    const now = new Date().toISOString();
    const result = await db
      .prepare(`DELETE FROM ai_sessions WHERE expires_at < ?`)
      .bind(now)
      .run();
    return result.meta?.changes ?? 0;
  }

  // ── Internal mapping ────────────────────────────────────────────────────────

  private mapSession(row: {
    id: string; tenant_id: string; user_id: string; workspace_id: string | null;
    vertical: string | null; title: string | null; message_count: number;
    created_at: string; last_active_at: string; expires_at: string;
  }): Session {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      userId: row.user_id,
      workspaceId: row.workspace_id,
      vertical: row.vertical,
      title: row.title,
      messageCount: row.message_count,
      createdAt: row.created_at,
      lastActiveAt: row.last_active_at,
      expiresAt: row.expires_at,
    };
  }
}
