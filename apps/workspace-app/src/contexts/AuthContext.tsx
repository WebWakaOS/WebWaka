import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { authApi, setToken, setRefreshToken, clearToken, LoginResponse } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  workspaceId?: string;
  role: string;
  phone?: string | null;
  fullName?: string | null;
  businessName?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
}

type AuthAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_DONE'; user: AuthUser | null }
  | { type: 'LOGIN'; user: AuthUser }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT_START': return { ...state, loading: true };
    case 'INIT_DONE':  return { user: action.user, loading: false, initialized: true };
    case 'LOGIN':      return { user: action.user, loading: false, initialized: true };
    case 'LOGOUT':     return { user: null, loading: false, initialized: true };
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; businessName: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { user: null, loading: true, initialized: false });

  useEffect(() => {
    const token = localStorage.getItem('ww_token');
    if (!token) {
      dispatch({ type: 'INIT_DONE', user: null });
      return;
    }
    authApi.me()
      .then(user => dispatch({ type: 'INIT_DONE', user }))
      .catch(() => {
        clearToken();
        dispatch({ type: 'INIT_DONE', user: null });
      });
  }, []);

  // AUT-004 fix: /auth/login returns { token, user } — no separate refreshToken.
  // The access token itself is stored as the refresh credential so that
  // tryRefresh() (AUT-006 fix) can pass it as a Bearer header to /auth/refresh.
  const login = useCallback(async (email: string, password: string) => {
    const res: LoginResponse = await authApi.login(email, password);
    setToken(res.token);
    setRefreshToken(res.token);
    dispatch({ type: 'LOGIN', user: res.user });
  }, []);

  const register = useCallback(async (payload: { email: string; password: string; businessName: string; phone?: string }) => {
    const res: LoginResponse = await authApi.register(payload);
    setToken(res.token);
    setRefreshToken(res.token);
    dispatch({ type: 'LOGIN', user: res.user });
  }, []);

  // P19-C: Server-side logout — blacklists token in KV and clears sessions.
  // Best-effort: if the API call fails (e.g. network error), we still clear
  // the local session so the user is logged out on this device.
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best effort — always clear local state
    }
    clearToken();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
