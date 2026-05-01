import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

// Use CSS custom properties for all colors — respects dark mode and white-label theming
const VARIANTS: Record<string, React.CSSProperties> = {
  primary:   { background: 'var(--ww-primary, #0F4C81)', color: '#fff', border: 'none' },
  secondary: { background: 'var(--ww-surface-2, #e2e8f0)', color: 'var(--ww-text, #1e293b)', border: '1.5px solid var(--ww-border, #e5e7eb)' },
  ghost:     { background: 'transparent', color: 'var(--ww-primary, #0F4C81)', border: '1.5px solid var(--ww-primary, #0F4C81)' },
  danger:    { background: 'var(--ww-danger, #dc2626)', color: '#fff', border: 'none' },
};

const SIZES = {
  sm: { padding: '8px 14px', fontSize: '13px', minHeight: '36px' },
  md: { padding: '12px 20px', fontSize: '15px', minHeight: '44px' },
  lg: { padding: '14px 28px', fontSize: '16px', minHeight: '52px' },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, disabled, style, ...rest }, ref) => {
    const v = VARIANTS[variant];
    const s = SIZES[size];
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{
          ...v, ...s,
          width: fullWidth ? '100%' : undefined,
          borderRadius: 'var(--ww-radius, 8px)',
          fontWeight: 600,
          cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
          opacity: (disabled || loading) ? 0.65 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'opacity 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease',
          touchAction: 'manipulation',
          boxShadow: variant === 'primary' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
          ...style,
        }}
        {...rest}
      >
        {loading && <Spinner size={16} color={variant === 'primary' || variant === 'danger' ? '#fff' : 'var(--ww-primary, #0F4C81)'} />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
