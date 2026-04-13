import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { ApiError } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>WebWaka</span>
          <span style={styles.logoBadge}>OS</span>
        </div>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to your workspace</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            required
            placeholder="you@business.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
          </div>
          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign in
          </Button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
  } as React.CSSProperties,
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  } as React.CSSProperties,
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 } as React.CSSProperties,
  logoText: { fontSize: 22, fontWeight: 800, color: '#0F4C81' } as React.CSSProperties,
  logoBadge: {
    background: '#0F4C81', color: '#fff', fontSize: 11, fontWeight: 700,
    padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em',
  } as React.CSSProperties,
  heading: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 } as React.CSSProperties,
  subheading: { fontSize: 14, color: '#6b7280', marginBottom: 28 } as React.CSSProperties,
  form: { display: 'flex', flexDirection: 'column', gap: 16 } as React.CSSProperties,
  forgotLink: { fontSize: 13, color: '#0F4C81', textDecoration: 'none' } as React.CSSProperties,
  footer: { marginTop: 24, fontSize: 14, color: '#6b7280', textAlign: 'center' } as React.CSSProperties,
  link: { color: '#0F4C81', fontWeight: 600, textDecoration: 'none' } as React.CSSProperties,
};
