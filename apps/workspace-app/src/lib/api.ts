/**
 * WebWaka Workspace API Client
 *
 * Changes:
 *  - M-3: X-Billing-Status interceptor — reads the header from every response
 *    and notifies registered listeners so BillingProvider can update React state.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// M-3: Billing-status pub/sub (module-level, outside React tree)
// ---------------------------------------------------------------------------

type BillingStatusValue = 'active' | 'suspended' | 'grace_period' | 'unknown';
type BillingStatusListener = (status: BillingStatusValue) => void;

const billingStatusListeners = new Set<BillingStatusListener>();

/** Register a listener for X-Billing-Status header values. Returns an unsubscribe fn. */
export function registerBillingStatusListener(fn: BillingStatusListener): () => void {
  billingStatusListeners.add(fn);
  return () => billingStatusListeners.delete(fn);
}

/** Parse and broadcast the X-Billing-Status header (if present). */
function notifyBillingStatus(res: Response): void {
  const raw = res.headers.get('X-Billing-Status');
  if (!raw) return;
  const valid: BillingStatusValue[] = ['active', 'suspended', 'grace_period', 'unknown'];
  const status: BillingStatusValue = (valid.includes(raw as BillingStatusValue)
    ? raw
    : 'unknown') as BillingStatusValue;
  billingStatusListeners.forEach((fn) => fn(status));
}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

function getToken(): string | null {
  return localStorage.getItem('ww_token');
}

export function setToken(token: string): void {
  localStorage.setItem('ww_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('ww_token');
  localStorage.removeItem('ww_refresh');
}

export function setRefreshToken(token: string): void {
  localStorage.setItem('ww_refresh', token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('ww_refresh');
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  opts: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...fetchOpts } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOpts.headers as Record<string, string>),
  };
  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...fetchOpts, headers });

  // M-3: Intercept billing status on every response
  notifyBillingStatus(res);

  if (res.status === 401 && !skipAuth) {
    const refresh = getRefreshToken();
    if (refresh) {
      const refreshed = await tryRefresh(refresh);
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getToken()}`;
        const retried = await fetch(`${API_BASE}${path}`, { ...fetchOpts, headers });
        // M-3: Also intercept billing status on retried response
        notifyBillingStatus(retried);
        if (retried.ok) return retried.json() as Promise<T>;
      }
    }
    clearToken();
    window.location.href = '/login';
    throw new ApiError(401, 'UNAUTHENTICATED', 'Session expired');
  }
  if (!res.ok) {
    let code = 'API_ERROR';
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json() as { error?: string; message?: string; code?: string };
      code = body.code ?? code;
      message = body.error ?? body.message ?? message;
    } catch { /* empty */ }
    throw new ApiError(res.status, code, message);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// AUT-006 fix: pass the stored JWT as an Authorization Bearer header so the
// auth middleware can validate it and issue a fresh token. The /auth/refresh
// route reads the caller's identity from the JWT — it does not accept a body.
// After a successful rotation both ww_token and ww_refresh are updated to the
// new token so subsequent refresh attempts use the latest valid credential.
async function tryRefresh(refreshToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    });
    if (!res.ok) return false;
    const body = await res.json() as { token: string };
    setToken(body.token);
    setRefreshToken(body.token);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: <T>(path: string, opts?: RequestInit) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, { ...opts, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, { ...opts, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, { ...opts, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, opts?: RequestInit) => request<T>(path, { ...opts, method: 'DELETE' }),
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    tenantId: string;
    workspaceId?: string;
    role: string;
    phone?: string | null;
    fullName?: string | null;
    businessName?: string | null;
  };
};

export type SessionInfo = {
  id: string;
  deviceHint: string;
  issuedAt: number;
  expiresAt: number;
  lastSeenAt: number;
  isExpired: boolean;
};

export type InvitationInfo = {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  expires_at: number;
  created_at: number;
};

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),
  register: (payload: { email: string; password: string; businessName: string; phone?: string }) =>
    request<LoginResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload), skipAuth: true }),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }), skipAuth: true }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }), skipAuth: true }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  updateProfile: (payload: { phone?: string; fullName?: string }) =>
    request<{ message: string }>('/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
  logout: () =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }),
  me: () => request<LoginResponse['user'] & { emailVerifiedAt?: number | null }>('/auth/me'),

  // P20-A: Workspace Member Invitations
  invite: (email: string, role?: string) =>
    request<{ inviteId: string; email: string; role: string; expiresAt: number; message: string }>(
      '/auth/invite',
      { method: 'POST', body: JSON.stringify({ email, role }) },
    ),
  pendingInvitations: () =>
    request<{ invitations: InvitationInfo[] }>('/auth/invite/pending'),
  revokeInvitation: (id: string) =>
    request<{ message: string }>(`/auth/invite/${id}`, { method: 'DELETE' }),
  acceptInvite: (token: string, payload?: { name?: string; password?: string }) =>
    request<{ message: string; userId: string; workspaceId: string; tenantId: string; role: string }>(
      '/auth/accept-invite',
      { method: 'POST', body: JSON.stringify({ token, ...payload }), skipAuth: true },
    ),

  // P20-B: Session Management
  sessions: () =>
    request<{ sessions: SessionInfo[]; count: number }>('/auth/sessions'),
  revokeSession: (id: string) =>
    request<{ message: string }>(`/auth/sessions/${id}`, { method: 'DELETE' }),
  revokeAllSessions: () =>
    request<{ message: string; revokedCount: number }>('/auth/sessions', { method: 'DELETE' }),

  // P20-C: Email Verification
  sendVerification: () =>
    request<{ message: string }>('/auth/send-verification', { method: 'POST' }),
  verifyEmail: (token: string) =>
    request<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`, { skipAuth: true }),

  // BUG-011: NDPR Article 3.1(9) Right to Erasure — requires X-Confirm-Erasure header
  deleteAccount: () =>
    request<{ message: string; receipt_id: string }>('/auth/me', {
      method: 'DELETE',
      headers: { 'X-Confirm-Erasure': 'confirmed' },
    }),
};
