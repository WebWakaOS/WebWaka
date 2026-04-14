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
  if (res.status === 401 && !skipAuth) {
    const refresh = getRefreshToken();
    if (refresh) {
      const refreshed = await tryRefresh(refresh);
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getToken()}`;
        const retried = await fetch(`${API_BASE}${path}`, { ...fetchOpts, headers });
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
  patch: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    request<T>(path, { ...opts, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, opts?: RequestInit) => request<T>(path, { ...opts, method: 'DELETE' }),
};

export type LoginResponse = {
  token: string;
  user: { id: string; email: string; tenantId: string; workspaceId?: string; role: string };
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
  me: () => request<LoginResponse['user']>('/auth/me'),
};
