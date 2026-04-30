/**
 * SuperAgent API client — workspace-app
 * Wraps calls to /superagent/* endpoints
 */

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

function getToken(): string | null {
  return localStorage.getItem('ww_token');
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> ?? {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// -------------------------------------------------------------------------
// Consent
// -------------------------------------------------------------------------

export interface ConsentStatus {
  has_consent: boolean;
  consent_id?: string;
  granted_at?: string;
  purposes?: string[];
  locale?: string;
}

export async function getConsentStatus(): Promise<ConsentStatus> {
  return request<ConsentStatus>('/superagent/consent');
}

export async function grantConsent(purposes: string[] = ['ai_chat', 'tool_execution', 'usage_analytics']): Promise<ConsentStatus> {
  return request<ConsentStatus>('/superagent/consent', {
    method: 'POST',
    body: JSON.stringify({ purposes, locale: 'en-NG' }),
  });
}

export async function revokeConsent(): Promise<void> {
  await request<void>('/superagent/consent', { method: 'DELETE' });
}

// -------------------------------------------------------------------------
// Chat (multi-turn)
// -------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: ToolCallResult[];
  timestamp?: number;
}

export interface ToolCallResult {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status?: 'pending' | 'approved' | 'rejected' | 'executed';
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  capability?: string;
  vertical?: string;
}

export interface ChatResponse {
  content: string;
  session_id: string;
  tool_calls?: ToolCallResult[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    wakacu_burned: number;
  };
  hitl_pending?: boolean;
  hitl_id?: string;
}

export async function sendChat(req: ChatRequest): Promise<ChatResponse> {
  return request<ChatResponse>('/superagent/chat', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// -------------------------------------------------------------------------
// Sessions
// -------------------------------------------------------------------------

export interface SessionSummary {
  session_id: string;
  vertical: string;
  capability?: string;
  last_message_at: number;
  message_count: number;
  title?: string;
}

export async function listSessions(): Promise<{ sessions: SessionSummary[] }> {
  return request<{ sessions: SessionSummary[] }>('/superagent/sessions');
}

export async function getSessionHistory(sessionId: string): Promise<{ messages: ChatMessage[] }> {
  return request<{ messages: ChatMessage[] }>(`/superagent/sessions/${sessionId}/history`);
}

// -------------------------------------------------------------------------
// Usage
// -------------------------------------------------------------------------

export interface UsageSummary {
  total_wakacu_burned: number;
  total_messages: number;
  total_tool_calls: number;
  period: string;
  by_capability?: Record<string, number>;
}

export async function getUsage(): Promise<UsageSummary> {
  return request<UsageSummary>('/superagent/usage');
}

// -------------------------------------------------------------------------
// Capabilities (public endpoint)
// -------------------------------------------------------------------------

export interface Capability {
  type: string;
  displayName: string;
  description: string;
  pillar: string;
  planTier: string;
}

export async function listCapabilities(): Promise<{ capabilities: Capability[] }> {
  return request<{ capabilities: Capability[] }>('/superagent/capabilities');
}
