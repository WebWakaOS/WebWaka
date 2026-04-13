import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANTS = {
  primary:   { background: '#0F4C81', color: '#fff', border: 'none' },
  secondary: { background: '#e2e8f0', color: '#1e293b', border: 'none' },
  ghost:     { background: 'transparent', color: '#0F4C81', border: '1.5px solid #0F4C81' },
  danger:    { background: '#dc2626', color: '#fff', border: 'none' },
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
          borderRadius: 8,
          fontWeight: 600,
          cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
          opacity: (disabled || loading) ? 0.65 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'opacity 0.15s ease, transform 0.1s ease',
          touchAction: 'manipulation',
          ...style,
        }}
        {...rest}
      >
        {loading && <Spinner size={16} color={variant === 'primary' || variant === 'danger' ? '#fff' : '#0F4C81'} />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
