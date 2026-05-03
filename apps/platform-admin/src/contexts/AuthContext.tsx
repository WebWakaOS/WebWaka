import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, saveToken, clearToken, hasToken } from '@/lib/api';

interface AdminUser {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasToken()) {
      setLoading(false);
      return;
    }
    api.get<{ id: string; email: string; role: string; tenantId?: string; tenant_id?: string }>('/auth/me')
      .then((me) => {
        if (me.role !== 'super_admin') {
          clearToken();
          setUser(null);
        } else {
          setUser({ userId: me.id, email: me.email, role: me.role, tenantId: me.tenantId ?? me.tenant_id ?? '' });
        }
      })
      .catch(() => { clearToken(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: { id: string; email: string; role: string; tenantId?: string; tenant_id?: string } }>('/auth/login', { email, password });
    if (res.user.role !== 'super_admin') {
      throw new Error('Access denied: super_admin role required');
    }
    saveToken(res.token);
    setUser({ userId: res.user.id, email: res.user.email, role: res.user.role, tenantId: res.user.tenantId ?? res.user.tenant_id ?? '' });
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
